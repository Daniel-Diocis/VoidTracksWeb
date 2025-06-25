import { Request, Response } from "express";
import { Request as RequestModel, RequestVote } from "../db";

export const getAllRequests = async (_req: Request, res: Response) => {
  const requests = await RequestModel.findAll({
    include: [{ model: RequestVote, as: "votes" }],
  });

    const data = requests
    .map((r) => ({
        id: r.id,
        brano: r.brano,
        artista: r.artista,
        status: r.status,
        tokens: r.tokens,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        voti: (r as any).votes?.length || 0
    }))
    .sort((a, b) => b.voti - a.voti);

  res.json(data);
};

export const createRequest = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { brano, artista } = req.body;

  const newRequest = await RequestModel.create({ brano, artista, user_id: user.id });
  await user.update({ tokens: user.tokens - 3 });

  res.status(201).json(newRequest);
};

export const voteRequest = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const requestId = Number(req.params.id);

  await RequestVote.create({ user_id: userId, request_id: requestId });
  res.status(201).json({ message: "Voto aggiunto" });
};

export const unvoteRequest = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const requestId = Number(req.params.id);

  await RequestVote.destroy({ where: { user_id: userId, request_id: requestId } });
  res.json({ message: "Voto rimosso" });
};