"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rechargeTokens = rechargeTokens;
const http_status_codes_1 = require("http-status-codes");
const messageFactory_1 = require("../utils/messageFactory");
const User_1 = __importDefault(require("../models/User"));
const factory = new messageFactory_1.MessageFactory();
async function rechargeTokens(req, res) {
    const { username, tokens } = req.body;
    if (!username ||
        typeof username !== "string" ||
        typeof tokens !== "number" ||
        tokens < 0) {
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Username valido e numero di token ≥ 0 richiesto");
    }
    try {
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Utente non trovato");
        }
        user.tokens = tokens;
        await user.save();
        return res.json({
            message: `Ricarica completata per ${user.username}`,
            tokens: user.tokens,
        });
    }
    catch (err) {
        console.error("Errore ricarica token:", err);
        return factory.getStatusMessage(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante la ricarica");
    }
}
