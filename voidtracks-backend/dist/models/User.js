"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `User`.
 *
 * Mappa la tabella `users` del database e gestisce:
 * - autenticazione (tramite `username` e `password_hash`)
 * - autorizzazione (tramite `role`)
 * - meccanismo dei token
 */
class User extends sequelize_1.Model {
}
/**
 * Inizializzazione del modello `User` con Sequelize.
 *
 * - Imposta i vincoli sui campi (es. obbligatorietà, default, univocità)
 * - Utilizza i timestamp `created_at` e `updated_at` con alias
 */
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tokens: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    role: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "user",
    },
    lastTokenBonusDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        field: "last_token_bonus_date",
    },
}, {
    tableName: "users",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
exports.default = User;
