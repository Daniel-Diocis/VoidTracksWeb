import { CatalogError } from "./media";

export interface ArtistInput {
  id?: string;
  name: string;
  genre: string;
  country: string;
  description: string;
}

export interface PublicationInput {
  id: string;
  title: string;
  album: string;
  coverPath: string;
  cost: number;
  artists: ArtistInput[];
}

export const maxArtists = 10;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function objectName(value: string): string {
  const key = value.normalize("NFKD").replace(/\p{M}+/gu, "")
    .replace(/[’‘]/g, "'").replace(/[“”]/g, "'")
    .replace(/[<>:"/\\|?*#%\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ").trim().replace(/^[. ]+|[. ]+$/g, "");
  if (!key || Buffer.byteLength(key) > 255) {
    throw new CatalogError(400, "Controlla il nome del file generato. È vuoto o troppo lungo.");
  }
  return key;
}

export function musicKey(title: string, names: string[]): string {
  const [main, ...guests] = names;
  const credits = guests.length ? ` ft. ${guests.join(", ")}` : "";
  return `${objectName(`${main} - ${title}${credits}`)}.mp3`;
}

function field(value: unknown, label: string, max: number, required = false) {
  if (value == null && !required) return "";
  if (typeof value !== "string" || (required && !value.trim()) || value.trim().length > max || value.includes("\0")) {
    throw new CatalogError(400, `Controlla il campo ${label} (massimo ${max} caratteri).`);
  }
  return value.trim();
}

function readJson(raw: unknown, message: string): unknown {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new CatalogError(400, message);
  }
}

function readArtist(raw: unknown): ArtistInput {
  const item = raw as Partial<ArtistInput>;
  if (!item || (item.id !== undefined && (typeof item.id !== "string" || !uuid.test(item.id)))) {
    throw new CatalogError(400, "Seleziona un artista valido.");
  }
  const name = field(item.name, "nome artista", 100, true);
  if (name.includes(",")) throw new CatalogError(400, "Usa una scheda separata per ogni artista.");
  return {
    id: item.id?.toLowerCase(), name,
    genre: field(item.genre, "genere", 100),
    country: field(item.country, "paese", 100),
    description: field(item.description, "descrizione", 255),
  };
}

export function readArtistPublication(raw: unknown): ArtistInput & { id: string } {
  const artist = readArtist(readJson(raw, "Dati dell’artista non validi."));
  if (!artist.id) throw new CatalogError(400, "Identificativo dell’artista mancante.");
  return { ...artist, id: artist.id };
}

export function readPublication(raw: unknown): PublicationInput {
  const input = readJson(raw, "Dati del brano non validi.") as Partial<PublicationInput>;

  if (!input || typeof input.id !== "string" || !uuid.test(input.id) ||
      !Array.isArray(input.artists) || input.artists.length < 1 || input.artists.length > maxArtists) {
    throw new CatalogError(400, "Seleziona un artista principale e al massimo nove ospiti.");
  }
  const cost = input.cost ?? 1;
  if (!Number.isSafeInteger(cost) || cost < 0 || cost > 2_147_483_647) {
    throw new CatalogError(400, "Il costo deve essere un numero intero non negativo.");
  }

  return {
    id: input.id.toLowerCase(), title: field(input.title, "titolo", 100, true),
    album: field(input.album, "album o singolo", 100, true),
    coverPath: field(input.coverPath, "copertina esistente", 255),
    artists: input.artists.map(readArtist), cost,
  };
}
