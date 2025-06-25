"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
/**
 * Modello Sequelize `RequestVote`.
 * Tiene traccia dei voti espressi dagli utenti sulle richieste di brani.
 */
class RequestVote extends sequelize_1.Model {
}
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
