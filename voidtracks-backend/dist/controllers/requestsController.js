"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unvoteRequest = exports.voteRequest = exports.createRequest = exports.getAllRequests = void 0;
const db_1 = require("../db");
const getAllRequests = async (_req, res) => {
    const requests = await db_1.Request.findAll({
        include: [{ model: db_1.RequestVote, as: "votes" }],
    });
    const data = requests
        .map((r) => {
        var _a;
        return ({
            id: r.id,
            brano: r.brano,
            artista: r.artista,
            status: r.status,
            tokens: r.tokens,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            voti: ((_a = r.votes) === null || _a === void 0 ? void 0 : _a.length) || 0
        });
    })
        .sort((a, b) => b.voti - a.voti);
    res.json(data);
};
exports.getAllRequests = getAllRequests;
const createRequest = async (req, res) => {
    const user = res.locals.user;
    const { brano, artista } = req.body;
    const newRequest = await db_1.Request.create({ brano, artista, user_id: user.id });
    await user.update({ tokens: user.tokens - 3 });
    res.status(201).json(newRequest);
};
exports.createRequest = createRequest;
const voteRequest = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const requestId = Number(req.params.id);
    await db_1.RequestVote.create({ user_id: userId, request_id: requestId });
    res.status(201).json({ message: "Voto aggiunto" });
};
exports.voteRequest = voteRequest;
const unvoteRequest = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const requestId = Number(req.params.id);
    await db_1.RequestVote.destroy({ where: { user_id: userId, request_id: requestId } });
    res.json({ message: "Voto rimosso" });
};
exports.unvoteRequest = unvoteRequest;
