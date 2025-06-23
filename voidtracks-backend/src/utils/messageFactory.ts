import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export class MessageFactory {
  getStatusMessage(res: Response, statusCode: number, message?: string) {
    const statusKey = Object.keys(StatusCodes).find(
      key => StatusCodes[key as keyof typeof StatusCodes] === statusCode
    ) as keyof typeof ReasonPhrases;

    const reasonPhrase = ReasonPhrases[statusKey] || "Errore";
    const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;

    return res.status(statusCode).json({ error: errorMessage });
  }
}