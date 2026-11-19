import { mkdtemp, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import User from "../models/User";
import { authenticateAdmin } from "../middleware/authRoles";
import { authenticateToken, usesDemoSigningKey } from "../middleware/authenticateToken";
import { CatalogError, importAudio, maxAudioBytes, maxImageBytes, youtubeVideoUrl } from "../catalog/media";
import { maxArtists, readArtistPublication, readPublication } from "../catalog/input";
import { catalogOptions, publishArtist, publishTrack } from "../catalog/publish";

const router = Router();
router.use(authenticateToken, authenticateAdmin);

function errorResponse(res: Response, error: unknown) {
  if (res.destroyed || res.headersSent) return;
  if (error instanceof CatalogError) {
    res.status(error.status).json({ error: error.message });
  } else if (error instanceof multer.MulterError) {
    const tooLarge = error.code.startsWith("LIMIT_");
    res.status(tooLarge ? 413 : 400).json({ error: "File troppo grandi o caricamento non valido." });
  } else {
    // Provider errors may contain connection details and request metadata.
    console.error("Catalog operation failed:", (error as { name?: string })?.name ?? "Error");
    res.status(502).json({ error: "Operazione non riuscita. Verifica i servizi del catalogo e riprova." });
  }
}

router.use(async (req, res, next) => {
  try {
    const claimedUser = (req as Request & { user: { id: number } }).user;
    const user = await User.findByPk(claimedUser.id);
    if (user?.role !== "admin") throw new CatalogError(403, "Accesso riservato agli amministratori.");
    res.locals.catalogAdmin = user;
    next();
  } catch (error) {
    errorResponse(res, error);
  }
});

router.get("/options", async (_req, res) => {
  try {
    res.json(await catalogOptions());
  } catch (error) {
    errorResponse(res, error);
  }
});

router.post("/import", async (req, res) => {
  const controller = new AbortController();
  const disconnect = () => controller.abort();
  res.once("close", disconnect);
  let directory: string | undefined;
  try {
    const url = youtubeVideoUrl(req.body?.url);
    directory = await mkdtemp(join(tmpdir(), "voidtracks-import-"));
    const path = await importAudio(url, directory, controller.signal);
    res.type("audio/mpeg").set("Cache-Control", "no-store");
    await pipeline(createReadStream(path), res);
  } catch (error) {
    errorResponse(res, error);
  } finally {
    res.off("close", disconnect);
    if (directory) await rm(directory, { recursive: true, force: true });
  }
});

let publishing = false;

function handlePublication(
  fields: string[], fileSize: number, save: (req: Request, files: Map<string, string>) => Promise<unknown>,
) {
  return async (req: Request, res: Response) => {
    let directory: string | undefined;
    let locked = false;
    try {
      if (!process.env.CATALOG_DATABASE_URL || !process.env.CATALOG_R2_ENDPOINT ||
          !process.env.CATALOG_R2_ACCESS_KEY_ID || !process.env.CATALOG_R2_SECRET_ACCESS_KEY) {
        throw new CatalogError(503, "Configura Supabase e Cloudflare R2 per abilitare la pubblicazione.");
      }
      const user: User = res.locals.catalogAdmin;
      if (usesDemoSigningKey() || await bcrypt.compare("password0", user.password_hash)) {
        throw new CatalogError(503, "Per pubblicare configura una coppia di chiavi JWT privata e sostituisci la password admin di esempio.");
      }
      if (publishing) throw new CatalogError(429, "È già in corso una pubblicazione.");
      publishing = locked = true;

      directory = await mkdtemp(join(tmpdir(), "voidtracks-publish-"));
      const parser = multer({
        dest: directory,
        limits: { fileSize, files: fields.length, fields: 1, fieldSize: 32_768 },
      }).fields(fields.map((name) => ({ name, maxCount: 1 })));
      await new Promise<void>((resolve, reject) => parser(req, res, (error: unknown) => error ? reject(error) : resolve()));
      const files = Object.entries(req.files || {}) as [string, Express.Multer.File[]][];
      await req.app.locals.catalogStartup;
      const record = await save(req, new Map(files.map(([name, [file]]) => [name, file.path])));
      res.status(201).json(record);
    } catch (error) {
      errorResponse(res, error);
    } finally {
      if (locked) publishing = false;
      if (directory) await rm(directory, { recursive: true, force: true });
    }
  };
}

router.post("/tracks", handlePublication(
  ["audio", "cover", ...Array.from({ length: maxArtists }, (_, index) => `profile_${index}`)],
  maxAudioBytes,
  (req, files) => publishTrack(readPublication(req.body?.track), files),
));

router.post("/artists", handlePublication(
  ["photo"],
  maxImageBytes,
  (req, files) => publishArtist(readArtistPublication(req.body?.artist), files.get("photo")),
));

export default router;
