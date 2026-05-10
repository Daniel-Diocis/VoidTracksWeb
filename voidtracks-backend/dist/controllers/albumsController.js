"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAlbums = listAlbums;
exports.getAlbumTracks = getAlbumTracks;
const Track_1 = __importDefault(require("../models/Track"));
/**
 * Restituisce tutti gli album distinti ricavati dal campo `album` dei brani.
 */
async function listAlbums(req, res, next) {
    try {
        const tracks = await Track_1.default.findAll({
            attributes: ["album", "artista", "cover_path"],
            order: [["album", "ASC"]],
        });
        const albumsMap = new Map();
        tracks.forEach((track) => {
            if (!albumsMap.has(track.album)) {
                albumsMap.set(track.album, {
                    album: track.album,
                    artista: track.artista,
                    cover_path: track.cover_path,
                });
            }
        });
        res.json(Array.from(albumsMap.values()));
    }
    catch (error) {
        next(error);
    }
}
/**
 * Restituisce tutti i brani appartenenti a un album.
 */
async function getAlbumTracks(req, res, next) {
    try {
        const albumName = decodeURIComponent(req.params.albumName);
        const tracks = await Track_1.default.findAll({
            where: { album: albumName },
            order: [["titolo", "ASC"]],
        });
        res.json({
            album: albumName,
            tracks,
        });
    }
    catch (error) {
        next(error);
    }
}
