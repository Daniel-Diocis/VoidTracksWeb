"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `Request`.
 *
 * - Mappa la tabella `requests` del database.
 * - Rappresenta una richiesta di aggiunta brano inviata da un utente.
 */
class Request extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Request`.
 *
 * - Definisce i campi, i vincoli e i tipi ENUM.
 * - Gestisce i timestamp `created_at` e `updated_at`.
 */
Request.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    brano: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    artista: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("waiting", "satisfied", "rejected"),
        allowNull: false,
        defaultValue: "waiting",
    },
    tokens: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "updated_at",
    },
}, {
    tableName: "requests",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = Request;
