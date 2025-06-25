import { Request, Response } from "express";
import { checkUserCredentials } from "../../src/middleware/authMiddleware";
import { ErrorMessages } from "../../src/utils/errorMessages";
import User from "../../src/models/User";
import bcrypt from "bcryptjs";

jest.mock("../../src/models/User");
jest.mock("bcryptjs");

describe("checkUserCredentials middleware", () => {
  it("restituisce 401 se l'utente non esiste", async () => {
    const req = { body: { username: "nonExistent", password: "pass" } } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await checkUserCredentials(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.INVALID_CREDENTIALS.status);
    expect(next).not.toHaveBeenCalled();
  });

  it("restituisce 401 se la password non è valida", async () => {
    const req = { body: { username: "user", password: "wrongPass" } } as Request;

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    (User.findOne as jest.Mock).mockResolvedValue({ username: "user", password_hash: "hash" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await checkUserCredentials(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.INVALID_CREDENTIALS.status);
    expect(next).not.toHaveBeenCalled();
  });

  it("chiama next() se le credenziali sono valide", async () => {
    const req = { body: { username: "user", password: "rightPass" } } as any;

    const res = {} as Response;
    const next = jest.fn();

    const fakeUser = { id: 1, username: "user", password_hash: "hash" };

    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await checkUserCredentials(req, res, next);

    expect(req.userRecord).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});