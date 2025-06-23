"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize per rappresentare un brano musicale.
 *
 * - Estende `Model` di Sequelize con tipi forti.
 * - Include metodi per gestire le associazioni con `Artist` (many-to-many).
 */
class Track extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Track` con Sequelize.
 *
 * - Definisce i campi della tabella `tracks`.
 * - Gestisce i timestamp `created_at` e `updated_at`.
 */
Track.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    titolo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    artista: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    album: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    music_path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cover_path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    costo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
    tableName: "tracks",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = Track;
