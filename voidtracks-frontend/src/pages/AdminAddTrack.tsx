import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminArtistFields from "../components/AdminArtistFields";
import type { ArtistProfileDraft } from "../components/AdminArtistFields";
import { useAuth } from "../hooks/useAuth";
import { useFilePreview } from "../hooks/useFilePreview";
import {
  catalogApiUrl, catalogImageTypes, catalogInputClass as inputClass, checkCatalogResponse, publicationId,
} from "../utils/adminCatalog";

type ArtistOption = { id: string; nome: string };
type Release = { album: string; coverPath: string; artists: string[] };
type ArtistDraft = ArtistProfileDraft & { name: string };
type CatalogOptions = { artists: ArtistOption[]; releases: Release[] };
type PublishedTrack = { titolo: string; music_path: string };

const coverUrl = import.meta.env.VITE_COVER_URL;
const primaryClass = "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50";
const secondaryClass = "rounded-lg border border-zinc-600 px-3 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50";

function blankArtist(): ArtistDraft {
  return { name: "", genre: "", country: "", description: "" };
}

function normalName(name: string) {
  return name.trim().toLowerCase();
}

function previewFilename(title: string, names: string[]) {
  const [main, ...guests] = names;
  if (!main || !title.trim()) return "";
  const credits = guests.length ? ` ft. ${guests.join(", ")}` : "";
  const base = `${main} - ${title.trim()}${credits}`.normalize("NFKD")
    .replace(/\p{M}+/gu, "").replace(/[’‘“”]/g, "'")
    // Keep this display in sync with objectName in the API.
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*#%\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ").trim().replace(/^[. ]+|[. ]+$/g, "");
  return `${base}.mp3`;
}

export default function AdminAddTrack() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [catalog, setCatalog] = useState<CatalogOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [cost, setCost] = useState("1");
  const [artists, setArtists] = useState(() => [{
    ...blankArtist(), name: searchParams.get("artist")?.slice(0, 100) ?? "",
  }]);
  const [coverChoice, setCoverChoice] = useState<string | null>(null);
  const [cover, setCover] = useState<File>();
  const [audio, setAudio] = useState<File>();
  const [source, setSource] = useState<"youtube" | "file">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState<PublishedTrack | null>(null);
  const [id, setId] = useState(publicationId);
  const audioPreview = useFilePreview(audio);
  const coverPreview = useFilePreview(cover);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    fetch(`${catalogApiUrl}/options`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
    }).then(async (response) => {
      await checkCatalogResponse(response, "Impossibile leggere il catalogo.");
      setCatalog(await response.json());
    }).catch((error: Error) => {
      if (error.name !== "AbortError") setOptionsError(error.message);
    });
    return () => controller.abort();
  }, [token, id]);

  const existingArtists = new Map(catalog?.artists.map((artist) => [normalName(artist.nome), artist]));
  const names = artists.map((artist) => existingArtists.get(normalName(artist.name))?.nome ?? artist.name.trim());
  const releases = catalog?.releases ?? [];
  const matchingReleases = releases.filter((release) => normalName(release.album) === normalName(album));
  const proposedRelease = matchingReleases.find((release) =>
    release.artists.some((name) => normalName(name) === normalName(names[0]))
  );
  const selectedCover = coverChoice ?? proposedRelease?.coverPath ?? "";
  const selectedRelease = matchingReleases.find((release) => release.coverPath === selectedCover);
  const filename = previewFilename(title, names.filter(Boolean));

  function updateArtist(index: number, fields: Partial<ArtistDraft>) {
    setArtists((current) => current.map((artist, position) => position === index ? { ...artist, ...fields } : artist));
    setPublished(null);
  }

  function moveArtist(index: number, direction: number) {
    setArtists((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
      return reordered;
    });
  }

  async function prepareAudio() {
    setError("");
    setAudio(undefined);
    setImporting(true);
    try {
      const response = await fetch(`${catalogApiUrl}/import`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      await checkCatalogResponse(response, "Impossibile preparare il file audio.");
      setAudio(new File([await response.blob()], "audio.mp3", { type: "audio/mpeg" }));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!audio || publishing || published) return;
    setError("");
    const data = new FormData();
    data.set("audio", audio);
    if (!selectedRelease && cover) data.set("cover", cover);
    data.set("track", JSON.stringify({
      id, title, album: selectedRelease?.album ?? album, cost: Number(cost),
      coverPath: selectedRelease?.coverPath ?? "",
      artists: artists.map(({ name, genre, country, description, photo }, index) => {
        const existing = existingArtists.get(normalName(name));
        if (!existing && photo) data.set(`profile_${index}`, photo);
        return { id: existing?.id, name: existing?.nome ?? name, genre, country, description };
      }),
    }));

    setPublishing(true);
    try {
      const response = await fetch(`${catalogApiUrl}/tracks`, { method: "POST", headers, body: data });
      await checkCatalogResponse(response, "Pubblicazione non riuscita.");
      setPublished(await response.json());
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  function reset() {
    setCatalog(null);
    setOptionsError("");
    setId(publicationId());
    setTitle("");
    setAlbum("");
    setCost("1");
    setArtists([blankArtist()]);
    setCover(undefined);
    setCoverChoice(null);
    setAudio(undefined);
    setYoutubeUrl("");
    setPublished(null);
    setError("");
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 pb-12 text-white">
      <h1 className="text-3xl font-bold">Aggiungi brano</h1>
      {optionsError && <p className="rounded-lg bg-red-900/40 p-3 text-red-200" role="alert">{optionsError}</p>}
      {!catalog && !optionsError && <p role="status" className="text-zinc-400">Caricamento catalogo…</p>}
      {published ? (
        <div className="space-y-3 rounded-xl border border-green-800 bg-zinc-900 p-5" role="status">
          <p><strong>{published.titolo}</strong> è disponibile nel catalogo.</p>
          <div className="flex flex-wrap gap-2">
            <Link className={secondaryClass} to={`/track/${encodeURIComponent(published.music_path)}`}>Apri brano</Link>
            <button type="button" onClick={reset} className={primaryClass}>Aggiungi un altro brano</button>
          </div>
        </div>
      ) : catalog && (
        <form className="space-y-5" onSubmit={publish}>
          <fieldset disabled={publishing || importing} className="space-y-5">
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="font-semibold">Audio</h2>
              <div className="flex flex-wrap gap-4">
                <label><input className="mr-2" type="radio" name="source" checked={source === "youtube"} onChange={() => { setSource("youtube"); setAudio(undefined); }} />Link YouTube</label>
                <label><input className="mr-2" type="radio" name="source" checked={source === "file"} onChange={() => { setSource("file"); setAudio(undefined); }} />File MP3</label>
              </div>
              {source === "youtube" ? (
                <div className="flex flex-wrap items-end gap-2">
                  <label className="min-w-52 flex-1">URL del video
                    <input className={inputClass} type="url" placeholder="https://www.youtube.com/watch?v=…" value={youtubeUrl}
                      onChange={(event) => { setYoutubeUrl(event.target.value); setAudio(undefined); }} />
                  </label>
                  <button type="button" className={secondaryClass} disabled={!youtubeUrl.trim()} onClick={prepareAudio}>
                    {importing ? "Preparazione in corso…" : "Prepara MP3"}
                  </button>
                </div>
              ) : (
                <label>File audio
                  <input className={inputClass} type="file" accept="audio/mpeg,.mp3"
                    onChange={(event) => setAudio(event.target.files?.[0])} />
                </label>
              )}
              {audioPreview && <audio controls preload="metadata" className="w-full" src={audioPreview} aria-label="Anteprima audio" />}
            </div>

            <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2">
              <label>Titolo<input className={inputClass} required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
              <label>Costo in token<input className={inputClass} required type="number" min={0} max={2147483647} step={1} value={cost} onChange={(event) => setCost(event.target.value)} /></label>
              <label className="sm:col-span-2">Album o singolo
                <input className={inputClass} required maxLength={100} list="catalog-albums" value={album}
                  onChange={(event) => { setAlbum(event.target.value); setCoverChoice(null); }} />
              </label>
              <datalist id="catalog-albums">{[...new Set(releases.map((release) => release.album))].map((name) => <option key={name} value={name} />)}</datalist>
              {matchingReleases.length > 0 && (
                <label className="sm:col-span-2">Copertina
                  <select className={inputClass} value={selectedCover} onChange={(event) => setCoverChoice(event.target.value)}>
                    <option value="">Carica una nuova copertina</option>
                    {matchingReleases.map((release) => <option key={release.coverPath} value={release.coverPath}>{release.coverPath}</option>)}
                  </select>
                </label>
              )}
              {selectedRelease ? (
                coverUrl && <img className="size-24 rounded-lg object-cover" alt="Copertina esistente" src={`${coverUrl}/${encodeURIComponent(selectedRelease.coverPath)}`} />
              ) : (
                <div className="sm:col-span-2">
                  <label>Nuova copertina
                    <input className={inputClass} type="file" required={!cover} accept={catalogImageTypes} onChange={(event) => setCover(event.target.files?.[0])} />
                  </label>
                  {coverPreview && <img className="mt-3 size-24 rounded-lg object-cover" src={coverPreview} alt="Anteprima quadrata della copertina" />}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div>
                <h2 className="font-semibold">Artisti</h2>
                <p className="mt-1 text-sm text-zinc-400">Digita il nome di un artista nuovo per compilare il suo profilo qui.</p>
              </div>
              <datalist id="catalog-artists">{catalog.artists.map((artist) => <option key={artist.id} value={artist.nome} />)}</datalist>
              {artists.map((artist, index) => {
                const isNew = Boolean(artist.name.trim()) && !existingArtists.has(normalName(artist.name));
                const label = index === 0 ? "Artista principale" : `Ospite ${index}`;
                return (
                  <div key={index} className="space-y-3 border-t border-zinc-800 pt-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="min-w-48 flex-1">{label}
                        <input className={inputClass} list="catalog-artists" required maxLength={100}
                          value={artist.name} onChange={(event) => updateArtist(index, { name: event.target.value })} />
                      </label>
                      {index > 0 && <>
                        <button type="button" className={secondaryClass} aria-label={`Sposta ${label} prima`} onClick={() => moveArtist(index, -1)}>↑</button>
                        <button type="button" className={secondaryClass} aria-label={`Sposta ${label} dopo`} disabled={index === artists.length - 1} onClick={() => moveArtist(index, 1)}>↓</button>
                        <button type="button" className={secondaryClass} onClick={() => setArtists((current) => current.filter((_, position) => position !== index))}>Rimuovi</button>
                      </>}
                    </div>
                    {isNew && (
                      <div className="space-y-3 rounded-lg bg-zinc-800 p-4">
                        <h3 className="font-medium">Nuovo artista</h3>
                        <AdminArtistFields artist={artist} onChange={(fields) => updateArtist(index, fields)} />
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className={secondaryClass} disabled={artists.length >= 10} onClick={() => setArtists((current) => [...current, blankArtist()])}>Aggiungi ospite</button>
            </div>
          </fieldset>

          {error && <p className="rounded-lg bg-red-900/40 p-3 text-red-200" role="alert">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            {filename && <div className="min-w-0 break-words text-sm text-zinc-300"><span className="block text-zinc-400">Nome del file</span>{filename}</div>}
            <button className={primaryClass} disabled={!audio || importing || publishing} type="submit">
              {publishing ? "Pubblicazione in corso…" : "Pubblica"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
