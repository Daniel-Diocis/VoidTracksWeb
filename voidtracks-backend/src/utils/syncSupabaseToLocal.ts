import axios from "axios";
import Track from "../models/Track";

interface SupabaseTrack {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  music_path: string;
  cover_path: string;
  costo: number;
  created_at: string;
  updated_at: string;
}

export async function syncTracksFromSupabase() {
  try {
    const response = await axios.get<SupabaseTrack[]>(
      `${process.env.SUPABASE_URL}/rest/v1/brani`,
      {
        headers: {
          apikey: process.env.SUPABASE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_KEY!}`,
        },
      }
    );

    const data = response.data;

    // Prendi tutti i brani locali
    const localTracks = await Track.findAll();

    // Mappa gli id dei brani Supabase per controllo pulizia
    const supaTrackIds = new Set(data.map((t) => t.id));

    // Aggiorna o inserisci i brani
    for (const supaTrack of data) {
      const track = localTracks.find((t) => t.id === supaTrack.id);

      if (track) {
        const localUpdated = track.updatedAt ? track.updatedAt.getTime() : 0;
        const supaUpdated = new Date(supaTrack.updated_at).getTime();

        if (localUpdated !== supaUpdated) {
          await track.update(
            {
              titolo: supaTrack.titolo,
              artista: supaTrack.artista,
              album: supaTrack.album,
              music_path: supaTrack.music_path,
              cover_path: supaTrack.cover_path,
              costo: supaTrack.costo,
              updatedAt: new Date(supaTrack.updated_at),
            },
            { silent: true }
          );
          await track.reload(); // ricarica i dati dal DB
          console.log(
            `Aggiornato il brano ${supaTrack.titolo} (${supaTrack.id})`
          );
          console.log(`Nuovo updatedAt dopo update: ${track.updatedAt}`);
        }
      } else {
        await Track.create({
          id: supaTrack.id,
          titolo: supaTrack.titolo,
          artista: supaTrack.artista,
          album: supaTrack.album,
          music_path: supaTrack.music_path,
          cover_path: supaTrack.cover_path,
          costo: supaTrack.costo,
          createdAt: new Date(supaTrack.created_at),
          updatedAt: new Date(supaTrack.updated_at),
        });
        console.log(
          `Inserito il nuovo brano ${supaTrack.titolo} (${supaTrack.id})`
        );
      }
    }

    for (const localTrack of localTracks) {
      if (!supaTrackIds.has(localTrack.id)) {
        await localTrack.destroy();
        console.log(
          `Rimosso il brano ${localTrack.titolo} (${localTrack.id}) non più presente su Supabase`
        );
      }
    }

    console.log(`Sincronizzati ${data.length} brani da Supabase`);
  } catch (error) {
    console.error("Errore sincronizzazione Supabase:", error);
    throw error;
  }
}
