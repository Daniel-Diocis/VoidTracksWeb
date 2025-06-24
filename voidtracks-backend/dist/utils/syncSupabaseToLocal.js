"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTracksFromSupabase = syncTracksFromSupabase;
exports.syncArtistsFromSupabase = syncArtistsFromSupabase;
exports.syncTrackArtistsFromSupabase = syncTrackArtistsFromSupabase;
const axios_1 = __importDefault(require("axios"));
const Track_1 = __importDefault(require("../models/Track"));
const Artist_1 = __importDefault(require("../models/Artist"));
const sequelize_1 = require("sequelize");
/**
 * Scarica i brani da Supabase e li sincronizza con il database locale.
 *
 * - Aggiorna i brani locali se `updated_at` è diverso.
 * - Inserisce nuovi brani se non esistono nel DB locale.
 * - Rimuove i brani locali non più presenti su Supabase.
 *
 * @returns Array contenente i brani nuovi o aggiornati.
 * @throws In caso di errore nella comunicazione con Supabase o nel DB locale.
 */
async function syncTracksFromSupabase() {
    try {
        const response = await axios_1.default.get(`${process.env.SUPABASE_URL}/rest/v1/brani`, {
            headers: {
                apikey: process.env.SUPABASE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
            },
        });
        const data = response.data;
        const localTracks = await Track_1.default.findAll();
        const supaTrackIds = new Set(data.map((t) => t.id));
        const updatedOrNewTracks = [];
        for (const supaTrack of data) {
            const track = localTracks.find((t) => t.id === supaTrack.id);
            if (track) {
                const localUpdated = track.updatedAt ? track.updatedAt.getTime() : 0;
                const supaUpdated = new Date(supaTrack.updated_at).getTime();
                if (localUpdated !== supaUpdated) {
                    await track.update({
                        titolo: supaTrack.titolo,
                        artista: supaTrack.artista,
                        album: supaTrack.album,
                        music_path: supaTrack.music_path,
                        cover_path: supaTrack.cover_path,
                        costo: supaTrack.costo,
                        updatedAt: new Date(supaTrack.updated_at),
                    }, { silent: true });
                    await track.reload();
                    updatedOrNewTracks.push(supaTrack);
                    console.log(`Aggiornato il brano ${supaTrack.titolo} (${supaTrack.id})`);
                    console.log(`Nuovo updatedAt dopo update: ${track.updatedAt}`);
                }
            }
            else {
                await Track_1.default.create({
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
                updatedOrNewTracks.push(supaTrack);
                console.log(`Inserito il nuovo brano ${supaTrack.titolo} (${supaTrack.id})`);
            }
        }
        for (const localTrack of localTracks) {
            if (!supaTrackIds.has(localTrack.id)) {
                await localTrack.destroy();
                console.log(`Rimosso il brano ${localTrack.titolo} (${localTrack.id}) non più presente su Supabase`);
            }
        }
        console.log(`Sincronizzati ${data.length} brani da Supabase`);
        return updatedOrNewTracks;
    }
    catch (error) {
        console.error("Errore sincronizzazione Supabase:", error);
        throw error;
    }
}
/**
 * Scarica gli artisti da Supabase e li sincronizza con il database locale.
 *
 * - Aggiorna gli artisti locali se `updated_at` è diverso.
 * - Inserisce nuovi artisti non ancora presenti.
 * - Rimuove quelli che non esistono più su Supabase.
 *
 * @throws In caso di errore nella richiesta o nel salvataggio locale.
 */
async function syncArtistsFromSupabase() {
    try {
        const response = await axios_1.default.get(`${process.env.SUPABASE_URL}/rest/v1/artisti`, {
            headers: {
                apikey: process.env.SUPABASE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
            },
        });
        const data = response.data;
        const localArtists = await Artist_1.default.findAll();
        const supaArtistIds = new Set(data.map((a) => a.id));
        for (const supaArtist of data) {
            const artist = localArtists.find((a) => a.id === supaArtist.id);
            if (artist) {
                const localUpdated = artist.updatedAt ? artist.updatedAt.getTime() : 0;
                const supaUpdated = new Date(supaArtist.updated_at).getTime();
                if (localUpdated !== supaUpdated) {
                    await artist.update({
                        nome: supaArtist.nome,
                        genere: supaArtist.genere,
                        paese: supaArtist.paese,
                        descrizione: supaArtist.descrizione,
                        profile_path: supaArtist.profile_path,
                        updatedAt: new Date(supaArtist.updated_at),
                    }, { silent: true });
                    await artist.reload();
                    console.log(`Aggiornato artista ${supaArtist.nome} (${supaArtist.id})`);
                }
            }
            else {
                await Artist_1.default.create({
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
        for (const localArtist of localArtists) {
            if (!supaArtistIds.has(localArtist.id)) {
                await localArtist.destroy();
                console.log(`Rimosso artista ${localArtist.nome} (${localArtist.id}) non più presente su Supabase`);
            }
        }
        console.log(`Sincronizzati ${data.length} artisti da Supabase`);
    }
    catch (error) {
        console.error("Errore sincronizzazione artisti Supabase:", error);
        throw error;
    }
}
/**
 * Associa ogni brano sincronizzato agli artisti locali corrispondenti.
 *
 * - Effettua lo split dei nomi degli artisti per ogni brano.
 * - Trova gli artisti corrispondenti nel DB locale usando `ILIKE`.
 * - Pulisce le associazioni precedenti e aggiorna quelle corrette.
 *
 * @param tracksData Array di brani sincronizzati da Supabase.
 */
async function syncTrackArtistsFromSupabase(tracksData) {
    for (const supaTrack of tracksData) {
        const track = await Track_1.default.findByPk(supaTrack.id);
        if (!track)
            continue;
        const artistNames = supaTrack.artista.split(",").map((a) => a.trim().toLowerCase());
        const artists = await Artist_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: artistNames.map((name) => ({
                    nome: { [sequelize_1.Op.iLike]: name }
                }))
            }
        });
        await track.setArtists([]);
        await track.addArtists(artists);
        console.log(`Sincronizzate associazioni artisti per il brano: ${track.titolo} (${track.id})`);
    }
    console.log(`Sincronizzazione track-artists completata per ${tracksData.length} brani.`);
}
