import { authenticateToken } from "../../src/middleware/authenticateToken";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";

jest.mock("fs");
jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const fakePublicKey = "FAKE_PUBLIC_KEY";

  beforeEach(() => {
    req = {
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    // Simula lettura della chiave pubblica da file
    (fs.readFileSync as jest.Mock).mockReturnValue(fakePublicKey);
  });

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

  it("restituisce 401 se il token è non valido", () => {
    req.headers = { authorization: "Bearer invalid.token" };

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

  it("chiama next() se il token è valido", () => {
    req.headers = { authorization: "Bearer valid.token" };

    const mockPayload = { id: 1, username: "user", role: "user", tokens: 10 };

    (jwt.verify as jest.Mock).mockImplementation((_, __, ___, callback) => {
      callback(null, mockPayload);
    });

    authenticateToken(req as Request, res as Response, next);

    expect((req as any).user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});