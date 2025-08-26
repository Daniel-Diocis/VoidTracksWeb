// Importa il middleware da testare
import { authenticateToken } from "../../src/middleware/authenticateToken";

// Tipi di Express per la tipizzazione delle funzioni middleware
import { Request, Response, NextFunction } from "express";

// Importa librerie per la gestione dei token e del filesystem
import jwt from "jsonwebtoken";
import fs from "fs";

// Mock delle dipendenze esterne per isolare i test
jest.mock("fs");
jest.mock("jsonwebtoken");

/**
 * Test suite per il middleware `authenticateToken`.
 * Verifica che il middleware gestisca correttamente:
 * - assenza del token
 * - token non valido
 * - token valido
 */
describe("authenticateToken middleware", () => {
  // Oggetti simulati per la richiesta, la risposta e la funzione next()
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  // Chiave pubblica fittizia usata nei test
  const fakePublicKey = "FAKE_PUBLIC_KEY";

  /**
   * Eseguito prima di ogni test.
   * Inizializza request e response mocking e simula la lettura della chiave pubblica.
   */
  beforeEach(() => {
    req = {
      headers: {}
    };

    // Mock delle funzioni di risposta
    res = {
      status: jest.fn().mockReturnThis(), // Permette il chaining (es. res.status(401).json(...))
      json: jest.fn()
    };

    next = jest.fn();

    // Simula la lettura della chiave pubblica dal filesystem
    (fs.readFileSync as jest.Mock).mockReturnValue(fakePublicKey);
  });

  /**
   * Caso di test: token assente.
   * Verifica che venga restituito uno status HTTP 401 con messaggio di errore.
   */
  it("restituisce 401 se il token è assente", () => {
    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Token mancante")
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Caso di test: token presente ma non valido.
   * Simula una verifica fallita da parte di `jwt.verify` e verifica la risposta 401.
   */
  it("restituisce 401 se il token è non valido", () => {
    req.headers = { authorization: "Bearer invalid.token" };

    // Simula un errore nella verifica del token
    (jwt.verify as jest.Mock).mockImplementation((_, __, ___, callback) => {
      callback(new Error("Invalid token"), null);
    });

    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Token non valido")
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Caso di test: token valido.
   * Simula una verifica corretta del token e verifica che venga chiamato `next()`.
   */
  it("chiama next() se il token è valido", () => {
    req.headers = { authorization: "Bearer valid.token" };

    const mockPayload = { id: 1, username: "user", role: "user", tokens: 10 };

    // Simula una verifica corretta del token
    (jwt.verify as jest.Mock).mockImplementation((_, __, ___, callback) => {
      callback(null, mockPayload);
    });

    authenticateToken(req as Request, res as Response, next);

    // Verifica che il payload venga assegnato alla request
    expect((req as any).user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});