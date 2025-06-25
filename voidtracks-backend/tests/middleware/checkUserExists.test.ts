import { checkUserExists } from "../../src/middleware/authMiddleware";
import User from "../../src/models/User";
import { Request, Response } from "express";
import { ErrorMessages } from "../../src/utils/errorMessages";

jest.mock("../../src/models/User");

describe("checkUserExists middleware", () => {
  it("restituisce 409 se lo username esiste già", async () => {
    const req = { body: { username: "existingUser" } } as Request;

    const status = jest.fn(() => ({ json: jest.fn() }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

    await checkUserExists(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.USERNAME_ALREADY_EXISTS.status);
    expect(next).not.toHaveBeenCalled();
  });

  it("chiama next() se lo username non esiste", async () => {
    const req = { body: { username: "newUser" } } as Request;

    const res = {} as Response;
    const next = jest.fn();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await checkUserExists(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});