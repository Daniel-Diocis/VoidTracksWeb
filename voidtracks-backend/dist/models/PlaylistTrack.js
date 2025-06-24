"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize che rappresenta un brano all'interno di una playlist.
 *
 * - Contiene anche il flag `is_favorite` per indicare se il brano è preferito.
 * - Relazionato a `Playlist` e `Track` tramite chiavi esterne.
 * - Ogni combinazione `playlist_id` + `track_id` è unica, per evitare duplicati.
 */
class PlaylistTrack extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `PlaylistTrack` con Sequelize.
 *
 * - Rappresenta la tabella pivot many-to-many `playlist_tracks`.
 * - Impone un vincolo di unicità sulla coppia `playlist_id` + `track_id`.
 */
PlaylistTrack.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    playlist_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "playlists", key: "id" },
        onDelete: "CASCADE",
    },
    track_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "tracks", key: "id" },
        onDelete: "CASCADE",
    },
    is_favorite: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: "playlist_tracks",
    sequelize,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["playlist_id", "track_id"],
        },
    ],
});
exports.default = PlaylistTrack;
