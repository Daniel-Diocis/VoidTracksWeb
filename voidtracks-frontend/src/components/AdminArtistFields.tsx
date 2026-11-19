import { useFilePreview } from "../hooks/useFilePreview";
import { catalogImageTypes, catalogInputClass } from "../utils/adminCatalog";

export type ArtistProfileDraft = {
  genre: string;
  country: string;
  description: string;
  photo?: File;
};

type Props = {
  artist: ArtistProfileDraft;
  onChange: (fields: Partial<ArtistProfileDraft>) => void;
};

export default function AdminArtistFields({ artist, onChange }: Props) {
  const photo = useFilePreview(artist.photo);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>Genere
        <input className={catalogInputClass} required maxLength={100} value={artist.genre}
          onChange={(event) => onChange({ genre: event.target.value })} />
      </label>
      <label>Paese di origine
        <input className={catalogInputClass} required maxLength={100} value={artist.country}
          onChange={(event) => onChange({ country: event.target.value })} />
      </label>
      <label className="sm:col-span-2">Descrizione
        <textarea className={catalogInputClass} required maxLength={255} rows={3} value={artist.description}
          onChange={(event) => onChange({ description: event.target.value })} />
      </label>
      <div className="flex flex-wrap items-start gap-4 sm:col-span-2">
        <label className="min-w-48 flex-1">Foto artista
          <input className={catalogInputClass} type="file" required={!artist.photo} accept={catalogImageTypes}
            onChange={(event) => onChange({ photo: event.target.files?.[0] })} />
          <span className="mt-1 block text-sm text-zinc-400">JPEG, PNG o WebP, fino a 8 MB.</span>
          {artist.photo && <span className="mt-1 block break-all text-sm text-zinc-300">{artist.photo.name}</span>}
        </label>
        {photo && <img className="size-24 rounded-lg object-cover" src={photo} alt="Anteprima quadrata della foto artista" />}
      </div>
    </div>
  );
}
