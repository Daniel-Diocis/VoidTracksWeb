import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import { promisify } from "node:util";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { join } from "node:path";

const run = promisify(execFile);
export const maxAudioBytes = 25 * 1024 * 1024;
export const maxImageBytes = 8 * 1024 * 1024;

export class CatalogError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function youtubeVideoUrl(input: unknown): string {
  if (typeof input !== "string" || input.length > 2048) {
    throw new CatalogError(400, "Inserisci l’URL di un video YouTube.");
  }

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new CatalogError(400, "Inserisci l’URL di un video YouTube.");
  }

  const segments = url.pathname.split("/");
  const youtubeHosts = ["www.youtube.com", "youtube.com", "m.youtube.com", "music.youtube.com"];
  let id: string | null = null;
  if (url.protocol === "https:" && !url.username && !url.password && !url.port) {
    if (url.hostname === "youtu.be") id = segments[1];
    if (youtubeHosts.includes(url.hostname)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      if (["shorts", "live"].includes(segments[1])) id = segments[2];
    }
  }

  if (!id || !/^[\w-]{11}$/.test(id)) {
    throw new CatalogError(400, "Usa il link HTTPS di un singolo video YouTube.");
  }
  return `https://www.youtube.com/watch?v=${id}`;
}

let importing = false;

export async function importAudio(url: string, directory: string, signal: AbortSignal) {
  if (importing) throw new CatalogError(429, "È già in corso un’importazione audio.");
  importing = true;
  try {
    await run("yt-dlp", [
      "--ignore-config", "--no-playlist", "--no-progress", "--no-cache-dir", "--js-runtimes", "node",
      "--socket-timeout", "15", "--retries", "1", "--fragment-retries", "1",
      "--match-filter", "duration <= 900 & !is_live",
      "--max-filesize", String(maxAudioBytes), "-f", "bestaudio/best",
      "-x", "--audio-format", "mp3", "-o", join(directory, "audio.%(ext)s"), "--", url,
    ], {
      cwd: directory, signal, timeout: 100_000, maxBuffer: 256 * 1024,
      env: { PATH: process.env.PATH, XDG_CACHE_HOME: directory },
    });
    const audio = join(directory, "audio.mp3");
    await validateMp3(audio);
    return audio;
  } catch (error) {
    if (error instanceof CatalogError) throw error;
    throw new CatalogError(422, "Importazione non riuscita. Riprova con un video fino a 15 minuti o carica un MP3.");
  } finally {
    importing = false;
  }
}

export async function validateMp3(path: string) {
  const { size } = await stat(path);
  if (size > maxAudioBytes) throw new CatalogError(413, "L’MP3 può pesare al massimo 25 MB.");
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error", "-f", "mp3", "-select_streams", "a:0",
      "-show_entries", "stream=codec_name", "-of", "csv=p=0", path,
    ], { timeout: 8_000, maxBuffer: 16_384, env: { PATH: process.env.PATH } });
    if (stdout.trim() === "mp3") return;
  } catch {
    // Respond with the same validation message for malformed and unreadable audio.
  }
  throw new CatalogError(400, "Il file audio deve essere un MP3 valido.");
}

export async function squareJpeg(path: string) {
  const file = await open(path);
  const header = Buffer.alloc(12);
  try {
    if ((await file.stat()).size > maxImageBytes) {
      throw new CatalogError(413, "Ogni immagine può pesare al massimo 8 MB.");
    }
    await file.read(header, 0, header.length, 0);
  } finally {
    await file.close();
  }

  let format: string;
  if (header.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) format = "jpeg_pipe";
  else if (header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) format = "png_pipe";
  else if (header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8) === "WEBP") format = "webp_pipe";
  else throw new CatalogError(400, "Carica un’immagine JPEG, PNG o WebP.");

  const result = `${path}.jpg`;
  try {
    await run("ffmpeg", [
      "-nostdin", "-hide_banner", "-loglevel", "error", "-threads", "1",
      "-f", format, "-i", path, "-filter_threads", "1",
      "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=600:600,setsar=1",
      "-frames:v", "1", "-q:v", "3", "-y", result,
    ], { timeout: 15_000, maxBuffer: 32_768, env: { PATH: process.env.PATH } });
    return result;
  } catch {
    throw new CatalogError(400, "Impossibile elaborare l’immagine. Prova con un altro file.");
  }
}

type Bucket = "music" | "cover" | "profile";

export function createStorage() {
  const endpoint = process.env.CATALOG_R2_ENDPOINT;
  const accessKeyId = process.env.CATALOG_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CATALOG_R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new CatalogError(503, "Configurazione R2 del catalogo mancante.");
  }
  return new S3Client({
    endpoint, region: "auto", forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export async function uploadMedia(client: S3Client, bucket: Bucket, key: string, path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  const sha256 = hash.digest("hex");
  const { size } = await stat(path);
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: createReadStream(path), ContentLength: size,
      ContentType: bucket === "music" ? "audio/mpeg" : "image/jpeg",
      IfNoneMatch: "*", Metadata: { sha256 },
    }), { abortSignal: AbortSignal.timeout(45_000) });
  } catch (error) {
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 412) throw error;
    const current = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }), {
      abortSignal: AbortSignal.timeout(10_000),
    });
    if (current.Metadata?.sha256 !== sha256) {
      throw new CatalogError(409, `Esiste già un file diverso in ${bucket} con il nome «${key}».`);
    }
  }
}
