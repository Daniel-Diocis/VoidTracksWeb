import { validateAuthInput } from "../../src/middleware/authMiddleware";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

describe("validateAuthInput middleware", () => {
  it("restituisce 400 se username e password mancano o sono troppo corti", async () => {
    const req = {
      body: { username: "ab", password: "123" } // troppo corti
    } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;

    const next = jest.fn();

    // Esegui solo i validator (popolano gli errori)
    await validateAuthInput[0](req, res, jest.fn());
    await validateAuthInput[1](req, res, jest.fn());

    // Esegui il middleware di verifica errori
    await validateAuthInput[2](req, res, next);

    expect(status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      errors: expect.any(Array)
    });

    // Questo è corretto: il controllo vero avviene solo qui
    expect(next).not.toHaveBeenCalled();
  });

  it("chiama next() se i dati sono validi", async () => {
    const req = {
      body: { username: "validuser", password: "securepassword" }
    } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;

    const next = jest.fn();

    // Esegui tutti i middleware
    await validateAuthInput[0](req, res, jest.fn());
    await validateAuthInput[1](req, res, jest.fn());
    await validateAuthInput[2](req, res, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});