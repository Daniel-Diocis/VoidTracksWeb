"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `Artist`.
 *
 * Rappresenta un artista musicale memorizzato nel sistema.
 * Ogni artista può essere associato a uno o più brani (`Track`) tramite relazione N:N.
 *
 * Gli artisti possono includere:
 * - Nome, genere musicale e paese di origine
 * - Descrizione testuale (biografia)
 * - Immagine del profilo (path)
 *
 * I dati possono essere sincronizzati da una sorgente esterna come Supabase.
 */
class Artist extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Artist` con Sequelize.
 */
Artist.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    nome: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    genere: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    paese: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    descrizione: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    profile_path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
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
    tableName: "artists",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = Artist;
