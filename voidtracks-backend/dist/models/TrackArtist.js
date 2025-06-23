"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../db/sequelize");
const sequelize = (0, sequelize_2.getSequelizeInstance)();
class TrackArtist extends sequelize_1.Model {
}
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
    timestamps: false, // di solito join table non ha timestamp
});
exports.default = TrackArtist;
