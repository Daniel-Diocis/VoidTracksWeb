"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `Notification`.
 *
 * - Mappa la tabella `notifications`.
 * - Tiene traccia delle notifiche associate agli utenti.
 */
class Notification extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `Notification`.
 *
 * - Definisce i campi della tabella e i vincoli.
 * - Gestisce i timestamp `created_at` e `updated_at`.
 */
Notification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    seen: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = Notification;
