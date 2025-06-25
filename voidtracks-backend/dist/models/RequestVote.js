"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `RequestVote`.
 *
 * - Mappa la tabella `request_votes` del database.
 * - Tiene traccia dei voti degli utenti su richieste specifiche.
 * - Utilizza una chiave primaria composta da `user_id` e `request_id`.
 */
class RequestVote extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `RequestVote`.
 *
 * - Definisce i due campi della chiave primaria composta.
 * - Nessun timestamp viene registrato.
 */
RequestVote.init({
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    request_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
}, {
    tableName: "request_votes",
    sequelize,
    timestamps: false,
});
exports.default = RequestVote;
