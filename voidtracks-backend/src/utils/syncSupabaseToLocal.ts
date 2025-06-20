import axios from "axios";
import Track from "../models/Track";
import Artist from "../models/Artist";
import { Op } from "sequelize";

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

interface SupabaseArtist {
  id: string;
  nome: string;
  genere?: string;
  paese?: string;
  descrizione?: string;
  profile_path?: string;
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

    const updatedOrNewTracks: SupabaseTrack[] = [];

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
          updatedOrNewTracks.push(supaTrack); // traccia come aggiornato
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
        updatedOrNewTracks.push(supaTrack); // traccia come nuovo
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
    return updatedOrNewTracks; // Ritorna i brani aggiornati o nuovi
  } catch (error) {
    console.error("Errore sincronizzazione Supabase:", error);
    throw error;
  }
}

export async function syncArtistsFromSupabase() {
  try {
    const response = await axios.get<SupabaseArtist[]>(
      `${process.env.SUPABASE_URL}/rest/v1/artisti`,
      {
        headers: {
          apikey: process.env.SUPABASE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_KEY!}`,
        },
      }
    );

    const data = response.data;

    // Prendi tutti gli artisti locali
    const localArtists = await Artist.findAll();

    // Mappa gli id degli artisti Supabase per controllo pulizia
    const supaArtistIds = new Set(data.map((a) => a.id));

    // Aggiorna o inserisci gli artisti
    for (const supaArtist of data) {
      const artist = localArtists.find((a) => a.id === supaArtist.id);

      if (artist) {
        const localUpdated = artist.updatedAt ? artist.updatedAt.getTime() : 0;
        const supaUpdated = new Date(supaArtist.updated_at).getTime();

        if (localUpdated !== supaUpdated) {
          await artist.update(
            {
              nome: supaArtist.nome,
              genere: supaArtist.genere,
              paese: supaArtist.paese,
              descrizione: supaArtist.descrizione,
              profile_path: supaArtist.profile_path,
              updatedAt: new Date(supaArtist.updated_at),
            },
            { silent: true }
          );
          await artist.reload(); // ricarica i dati dal DB
          console.log(`Aggiornato artista ${supaArtist.nome} (${supaArtist.id})`);
        }
      } else {
        await Artist.create({
          id: supaArtist.id,
          nome: supaArtist.nome,
          genere: supaArtist.genere,
          paese: supaArtist.paese,
          descrizione: supaArtist.descrizione,
          profile_path: supaArtist.profile_path,
          createdAt: new Date(supaArtist.created_at),
          updatedAt: new Date(supaArtist.updated_at),
        });
        console.log(`Inserito nuovo artista ${supaArtist.nome} (${supaArtist.id})`);
      }
    }

    // Rimuovi gli artisti locali non più presenti su Supabase
    for (const localArtist of localArtists) {
      if (!supaArtistIds.has(localArtist.id)) {
        await localArtist.destroy();
        console.log(`Rimosso artista ${localArtist.nome} (${localArtist.id}) non più presente su Supabase`);
      }
    }

    console.log(`Sincronizzati ${data.length} artisti da Supabase`);
  } catch (error) {
    console.error("Errore sincronizzazione artisti Supabase:", error);
    throw error;
  }
}

export async function syncTrackArtistsFromSupabase(tracksData: any[]) {
  for (const supaTrack of tracksData) {
    // Trova il track locale
    const track = await Track.findByPk(supaTrack.id);
    if (!track) continue;

    // Split della stringa artisti
    const artistNames = supaTrack.artista.split(",").map((a: string) => a.trim().toLowerCase());

    // Trova gli artisti locali con nomi corrispondenti
    const artists = await Artist.findAll({
      where: {
        [Op.or]: artistNames.map((name: string) => ({
          nome: { [Op.iLike]: name }
        }))
      }
    });

    // Svuota le associazioni attuali per quel track
    await track.setArtists([]); // 'setArtists' è il metodo generato da belongsToMany

    // Associa i nuovi artisti
    await track.addArtists(artists);
    
    console.log(`Sincronizzate associazioni artisti per il brano: ${track.titolo} (${track.id})`);
  }
  console.log(`Sincronizzazione track-artists completata per ${tracksData.length} brani.`);
}