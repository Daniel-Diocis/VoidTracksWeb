"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `Playlist`.
 *
 * Rappresenta una playlist personalizzata creata da un utente del sistema.
 * Ogni playlist è identificata da un nome ed è associata a un utente (`user_id`).
 *
 * La playlist può contenere più brani, gestiti tramite la tabella ponte `PlaylistTrack`.
 */
class Playlist extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Playlist` con Sequelize.
 *
 * - Mappa i campi della tabella `playlists`.
 * - Include chiave esterna verso `users`.
 * - Abilita i timestamp `createdAt` e `updatedAt`.
 */
Playlist.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    nome: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "playlists",
    sequelize,
    timestamps: true,
});
exports.default = Playlist;
