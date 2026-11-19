import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryTypes, Sequelize, Transaction } from "sequelize";
import { Artist, Track, sequelize } from "../db";
import { ArtistInput, musicKey, objectName, PublicationInput } from "./input";
import { CatalogError, createStorage, squareJpeg, uploadMedia, validateMp3 } from "./media";

interface CatalogArtist {
  id: string;
  nome: string;
  genere: string | null;
  paese: string | null;
  descrizione: string | null;
  profile_path: string;
}

interface CatalogTrack {
  id: string;
  titolo: string;
  album: string;
  artista: string;
  music_path: string;
  cover_path: string;
  costo: number;
}

let catalogDb: Sequelize | undefined;

function getCatalogDb() {
  if (catalogDb) return catalogDb;
  const url = process.env.CATALOG_DATABASE_URL;
  if (!url) throw new CatalogError(503, "Configurazione Supabase in scrittura mancante.");
  const target = new URL(url);
  const supabaseHost = target.hostname.endsWith(".supabase.com") || target.hostname.endsWith(".supabase.co");
  const dialectOptions: Record<string, unknown> = { connectionTimeoutMillis: 8_000 };
  if (supabaseHost) {
    // Sequelize can replace driver TLS options with settings from the URI.
    for (const setting of ["ssl", "sslmode", "sslrootcert", "sslcert", "sslkey"]) {
      target.searchParams.delete(setting);
    }
    dialectOptions.ssl = {
      ca: readFileSync(join(__dirname, "../../certs/supabase-root-2021.crt"), "utf8"),
      rejectUnauthorized: true,
    };
  }
  return catalogDb = new Sequelize(target.href, {
    dialect: "postgres",
    logging: false,
    pool: { max: 2 },
    dialectOptions,
  });
}

export async function catalogOptions() {
  const [artists, tracks] = await Promise.all([
    Artist.findAll({ attributes: ["id", "nome"], order: [["nome", "ASC"]], raw: true }),
    Track.findAll({ attributes: ["album", "cover_path", "artista"], raw: true, order: [["album", "ASC"]] }),
  ]);
  const releases = new Map<string, { album: string; coverPath: string; artists: string[] }>();
  for (const track of tracks) {
    if (!track.album || !track.cover_path) continue;
    const key = JSON.stringify([track.album, track.cover_path]);
    const names = track.artista.split(",").map((name) => name.trim()).filter(Boolean);
    const existing = releases.get(key);
    if (existing) existing.artists = [...new Set([...existing.artists, ...names])];
    else releases.set(key, { album: track.album, coverPath: track.cover_path, artists: names });
  }
  return { artists, releases: [...releases.values()] };
}

function catalogTransaction<T>(db: Sequelize, write: (transaction: Transaction) => Promise<T>) {
  return db.transaction(async (transaction) => {
    // Serialize artist and track publications so both paths check the same catalog state.
    await db.query("SELECT pg_advisory_xact_lock(829314506)", { transaction });
    return write(transaction);
  });
}

function newArtist(artist: ArtistInput, id: string): CatalogArtist {
  if (!artist.genre || !artist.country || !artist.description) {
    throw new CatalogError(400, `Compila genere, paese e descrizione per «${artist.name}».`);
  }
  return {
    id, nome: artist.name, genere: artist.genre, paese: artist.country, descrizione: artist.description,
    profile_path: `${objectName(artist.name)}.jpg`,
  };
}

async function insertArtist(db: Sequelize, transaction: Transaction, artist: CatalogArtist) {
  await db.query(
    `INSERT INTO public.artisti (id, nome, genere, paese, descrizione, profile_path)
     VALUES ($id, $nome, $genere, $paese, $descrizione, $profile_path)`,
    { bind: { ...artist }, transaction },
  );
}

function projectArtist(artist: CatalogArtist, transaction?: Transaction) {
  return Artist.upsert({
    ...artist,
    genere: artist.genere ?? undefined,
    paese: artist.paese ?? undefined,
    descrizione: artist.descrizione ?? undefined,
  }, { transaction });
}

export async function publishArtist(input: ArtistInput & { id: string }, photo?: string) {
  if (!photo) throw new CatalogError(400, "Carica una foto per l’artista.");
  const artist = newArtist(input, input.id);
  const jpeg = await squareJpeg(photo);
  const db = getCatalogDb();
  const storage = createStorage();
  try {
    await catalogTransaction(db, async (transaction) => {
      const conflicts = await db.query<CatalogArtist>(
        `SELECT id, nome, genere, paese, descrizione, profile_path
         FROM public.artisti WHERE id = $id OR lower(btrim(nome)) = lower($nome)`,
        { bind: { id: artist.id, nome: artist.nome }, transaction, type: QueryTypes.SELECT },
      );
      const [existing] = conflicts;
      if (existing && (conflicts.length > 1 ||
          (Object.keys(artist) as (keyof CatalogArtist)[]).some((key) => existing[key] !== artist[key]))) {
        throw new CatalogError(409, "Esiste già un artista con questo nome.");
      }
      await uploadMedia(storage, "profile", artist.profile_path, jpeg);
      if (!existing) await insertArtist(db, transaction, artist);
    });
  } finally {
    storage.destroy();
  }

  try {
    await projectArtist(artist);
  } catch {
    throw new CatalogError(503, "Artista salvato su Supabase. Premi Salva artista di nuovo per aggiornare la copia locale.");
  }
  return artist;
}

async function resolveArtists(input: PublicationInput, files: Map<string, string>, db: Sequelize, transaction: Transaction) {
  const artists: CatalogArtist[] = [];
  const photos: { artist: CatalogArtist; path: string }[] = [];

  for (const [index, artist] of input.artists.entries()) {
    const [existing] = await db.query<CatalogArtist>(
      artist.id
        ? "SELECT * FROM public.artisti WHERE id = $value"
        : "SELECT * FROM public.artisti WHERE lower(btrim(nome)) = lower($value) ORDER BY id LIMIT 1",
      { bind: { value: artist.id ?? artist.name }, transaction, type: QueryTypes.SELECT },
    );
    if (existing) {
      artists.push(existing);
      continue;
    }
    if (artist.id) throw new CatalogError(409, `L’artista «${artist.name}» non è più nel catalogo.`);

    const photo = files.get(`profile_${index}`);
    if (!photo) throw new CatalogError(400, `Carica una foto per «${artist.name}».`);
    const record = newArtist(artist, randomUUID());
    artists.push(record);
    photos.push({ artist: record, path: photo });
  }
  return { artists, photos };
}

async function projectPublication(track: CatalogTrack, artists: CatalogArtist[]) {
  await sequelize.transaction(async (transaction) => {
    for (const artist of artists) {
      await projectArtist(artist, transaction);
    }
    await Track.upsert(track, { transaction });
    const recordedTrack = await Track.findByPk(track.id, { transaction, rejectOnEmpty: true });
    await recordedTrack.setArtists(artists.map(({ id }) => id), { transaction });
  });
}

export async function publishTrack(input: PublicationInput, files: Map<string, string>) {
  const db = getCatalogDb();
  const storage = createStorage();
  try {
    const audio = files.get("audio");
    if (!audio) throw new CatalogError(400, "Prepara o carica un file MP3.");
    await validateMp3(audio);

    const publication = await catalogTransaction(db, async (transaction) => {
      const { artists, photos } = await resolveArtists(input, files, db, transaction);
      const names = artists.map(({ nome }) => nome.trim());
      if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
        throw new CatalogError(400, "Ogni artista può essere selezionato una sola volta.");
      }
      const artistCredits = names.join(", ");
      if (artistCredits.length > 100 || names.some((name) => name.includes(","))) {
        throw new CatalogError(400, "I crediti degli artisti non sono compatibili con il catalogo (massimo 100 caratteri complessivi).");
      }

      const musicPath = musicKey(input.title, names);
      const coverPath = input.coverPath || `${objectName(`${names[0]} - ${input.album}`)}.jpg`;
      const track: CatalogTrack = {
        id: input.id, titolo: input.title, album: input.album, artista: artistCredits,
        music_path: musicPath, cover_path: coverPath, costo: input.cost,
      };

      const conflicts = await db.query<CatalogTrack>(
        `SELECT id, titolo, album, artista, music_path, cover_path, costo
         FROM public.brani
         WHERE id = $id OR music_path = $music_path OR
           (lower(titolo) = lower($titolo) AND lower(artista) = lower($artista) AND lower(album) = lower($album))`,
        { bind: { ...track }, transaction, type: QueryTypes.SELECT },
      );
      const sameRecord = conflicts.find(({ id }) => id === input.id);
      if (sameRecord && (Object.keys(track) as (keyof CatalogTrack)[]).every((key) => sameRecord[key] === track[key])) {
        await uploadMedia(storage, "music", musicPath, audio);
        return { track: sameRecord, artists };
      }
      if (conflicts.length) throw new CatalogError(409, "Il brano risulta già pubblicato oppure il nome dell’MP3 è già utilizzato.");

      let cover: string | undefined;
      if (input.coverPath) {
        const [existing] = await db.query<{ cover_path: string }>(
          "SELECT cover_path FROM public.brani WHERE album = $album AND cover_path = $path LIMIT 1",
          { bind: { album: input.album, path: input.coverPath }, transaction, type: QueryTypes.SELECT },
        );
        if (!existing) throw new CatalogError(409, "La copertina selezionata non è più associata a questo album.");
      } else {
        const coverFile = files.get("cover");
        if (!coverFile) throw new CatalogError(400, "Carica la copertina oppure selezionane una dal catalogo.");
        cover = await squareJpeg(coverFile);
      }

      // Validate and convert every image before creating any public storage objects.
      for (const photo of photos) photo.path = await squareJpeg(photo.path);
      if (cover) await uploadMedia(storage, "cover", coverPath, cover);
      for (const { artist, path } of photos) await uploadMedia(storage, "profile", artist.profile_path, path);
      await uploadMedia(storage, "music", musicPath, audio);

      for (const { artist } of photos) {
        await insertArtist(db, transaction, artist);
      }
      await db.query(
        `INSERT INTO public.brani (id, titolo, artista, album, music_path, cover_path, costo)
         VALUES ($id, $titolo, $artista, $album, $music_path, $cover_path, $costo)`,
        { bind: { ...track }, transaction },
      );
      return { track, artists };
    });

    try {
      await projectPublication(publication.track, publication.artists);
    } catch {
      throw new CatalogError(503, "Brano salvato su Supabase. Premi Pubblica di nuovo per aggiornare la copia locale.");
    }
    return publication.track;
  } finally {
    storage.destroy();
  }
}
