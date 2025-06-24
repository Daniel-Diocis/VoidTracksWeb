"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `TrackArtist` per rappresentare la relazione many-to-many
 * tra brani (`Track`) e artisti (`Artist`).
 *
 * - Ogni riga collega un brano a un artista.
 * - Utilizza `track_id` e `artist_id` come chiave primaria composta.
 * - La tabella è una join table senza timestamp.
 */
class TrackArtist extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `TrackArtist`.
 *
 * - Mappa la tabella `track_artists`.
 * - Definisce vincoli di integrità referenziale verso `tracks` e `artists`.
 */
TrackArtist.init({
    track_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "tracks",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    artist_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "artists",
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    tableName: "track_artists",
    sequelize,
    timestamps: false, // Le tabelle pivot non richiedono timestamp
});
exports.default = TrackArtist;
