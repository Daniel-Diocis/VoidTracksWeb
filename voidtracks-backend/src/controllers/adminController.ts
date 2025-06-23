import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";

const factory = new MessageFactory();

export async function rechargeTokens(req: Request, res: Response) {
  const { username, tokens } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    typeof tokens !== "number" ||
    tokens < 0
  ) {
    return factory.getStatusMessage(res, StatusCodes.BAD_REQUEST, "Username valido e numero di token ≥ 0 richiesto");
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return factory.getStatusMessage(res, StatusCodes.NOT_FOUND, "Utente non trovato");
    }

    user.tokens = tokens;
    await user.save();

    return res.json({
      message: `Ricarica completata per ${user.username}`,
      tokens: user.tokens,
    });
  } catch (err) {
    console.error("Errore ricarica token:", err);
    return factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore server durante la ricarica");
  }
}