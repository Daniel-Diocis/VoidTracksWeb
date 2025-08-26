// Importa i tipi di Express necessari per la tipizzazione
import { Request, Response } from "express";

// Middleware da testare
import { checkUserCredentials } from "../../src/middleware/authMiddleware";

// Messaggi di errore centralizzati
import { ErrorMessages } from "../../src/utils/errorMessages";

// Modello utente e libreria per la verifica degli hash di password
import User from "../../src/models/User";
import bcrypt from "bcryptjs";

// Mock dei moduli esterni per isolare il comportamento del middleware
jest.mock("../../src/models/User");
jest.mock("bcryptjs");

/**
 * Test suite per il middleware `checkUserCredentials`.
 *
 * Verifica che il middleware:
 * - restituisca errore se l'utente non esiste
 * - restituisca errore se la password è errata
 * - consenta il proseguimento della richiesta se le credenziali sono corrette
 */
describe("checkUserCredentials middleware", () => {
  /**
   * Caso di test: l'utente non esiste nel database.
   * Atteso: ritorno di status 401 con errore, `next()` non deve essere chiamato.
   */
  it("restituisce 401 se l'utente non esiste", async () => {
    const req = { body: { username: "nonExistent", password: "pass" } } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    // Simula assenza dell'utente nel database
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await checkUserCredentials(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.INVALID_CREDENTIALS.status);
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Caso di test: utente trovato ma password non corretta.
   * Atteso: ritorno di status 401 con errore, `next()` non deve essere chiamato.
   */
  it("restituisce 401 se la password non è valida", async () => {
    const req = { body: { username: "user", password: "wrongPass" } } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    // Simula utente presente
    (User.findOne as jest.Mock).mockResolvedValue({ username: "user", password_hash: "hash" });

    // Simula fallimento del confronto della password
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await checkUserCredentials(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.INVALID_CREDENTIALS.status);
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Caso di test: credenziali corrette.
   * Atteso: `req.userRecord` popolato con l'utente e `next()` chiamato.
   */
  it("chiama next() se le credenziali sono valide", async () => {
    const req = { body: { username: "user", password: "rightPass" } } as any;

    const res = {} as Response;
    const next = jest.fn();

    const fakeUser = { id: 1, username: "user", password_hash: "hash" };

    // Simula utente trovato
    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);

    // Simula password corretta
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await checkUserCredentials(req, res, next);

    expect(req.userRecord).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});