import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import AdminArtistFields from "../components/AdminArtistFields";
import type { ArtistProfileDraft } from "../components/AdminArtistFields";
import { useAuth } from "../hooks/useAuth";
import { catalogApiUrl, catalogInputClass, checkCatalogResponse, publicationId } from "../utils/adminCatalog";

const primaryClass = "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50";
const secondaryClass = "rounded-lg border border-zinc-600 px-3 py-2 text-sm text-white hover:bg-zinc-700";

function emptyProfile(): ArtistProfileDraft {
  return { genre: "", country: "", description: "" };
}

export default function AdminAddArtist() {
  const { token } = useAuth();
  const [id, setId] = useState(publicationId);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ nome: string } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile.photo || saving) return;
    setError("");
    setSaving(true);

    const { genre, country, description, photo } = profile;
    const data = new FormData();
    data.set("artist", JSON.stringify({ id, name, genre, country, description }));
    data.set("photo", photo);

    try {
      const response = await fetch(`${catalogApiUrl}/artists`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      await checkCatalogResponse(response, "Impossibile salvare l’artista.");
      setSaved(await response.json());
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setId(publicationId());
    setName("");
    setProfile(emptyProfile());
    setSaved(null);
    setError("");
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 pb-12 text-white">
      <h1 className="text-3xl font-bold">Aggiungi artista</h1>
      {saved ? (
        <div className="space-y-4 rounded-xl border border-green-800 bg-zinc-900 p-5">
          <p role="status"><strong>{saved.nome}</strong> è disponibile nel catalogo.</p>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/admin/tracks/new?artist=${encodeURIComponent(saved.nome)}`} className={primaryClass}>Aggiungi un brano</Link>
            <Link to={`/artist/${encodeURIComponent(saved.nome)}`} className={secondaryClass}>Apri profilo</Link>
            <button type="button" className={secondaryClass} onClick={reset}>Aggiungi un altro artista</button>
          </div>
        </div>
      ) : (
        <form className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5" onSubmit={save}>
          <fieldset className="space-y-4" disabled={saving}>
            <label>Nome artista
              <input className={catalogInputClass} required maxLength={100} value={name}
                onChange={(event) => setName(event.target.value)} />
            </label>
            <AdminArtistFields artist={profile} onChange={(fields) => setProfile((current) => ({ ...current, ...fields }))} />
          </fieldset>
          {error && <p className="rounded-lg bg-red-900/40 p-3 text-red-200" role="alert">{error}</p>}
          <button type="submit" disabled={saving || !profile.photo} className={primaryClass}>
            {saving ? "Salvataggio in corso…" : "Salva artista"}
          </button>
        </form>
      )}
    </section>
  );
}
