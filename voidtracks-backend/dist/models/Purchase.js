"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize per rappresentare un acquisto di un brano da parte di un utente.
 *
 * - Include riferimenti alle entità `User` e `Track`.
 * - Ogni riga rappresenta un download autorizzato e limitato nel tempo.
 * - L’attributo `download_token` consente l’accesso sicuro e temporaneo al file.
 * - Il flag `used_flag` impedisce download multipli non autorizzati.
 */
class Purchase extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Purchase` con Sequelize.
 *
 * - Definisce i campi, vincoli, chiavi esterne e indici.
 * - Non utilizza i timestamp `createdAt` e `updatedAt`.
 */
Purchase.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    track_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "tracks", key: "id" },
        onDelete: "CASCADE",
    },
    purchased_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    valid_until: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    used_flag: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    costo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    download_token: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
}, {
    tableName: "purchases",
    sequelize,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["user_id", "track_id"], // impedisce acquisti duplicati dello stesso brano
        },
        {
            unique: true,
            fields: ["download_token"], // assicura che ogni token sia unico per il download
        },
    ],
});
exports.default = Purchase;
