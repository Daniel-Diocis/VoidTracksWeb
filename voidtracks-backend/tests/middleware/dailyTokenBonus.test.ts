import { Request, Response } from "express";
import { dailyTokenBonus } from "../../src/middleware/authMiddleware";
import { ErrorMessages } from "../../src/utils/errorMessages";
import User from "../../src/models/User";
import { toZonedTime, format } from "date-fns-tz";

jest.mock("../../src/models/User");

describe("dailyTokenBonus middleware", () => {
  const timeZone = "Europe/Rome";

  it("restituisce 401 se req.user è mancante", async () => {
    const req = {} as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    await dailyTokenBonus(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.NOT_AUTHENTICATED_USER.status);
    expect(json).toHaveBeenCalledWith({
    error: `Unauthorized: ${ErrorMessages.NOT_AUTHENTICATED_USER.message}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("restituisce 404 se l'utente non esiste nel database", async () => {
    const req = { user: { id: 999 } } as any;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as unknown as Response;
    const next = jest.fn();

    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await dailyTokenBonus(req, res, next);

    expect(status).toHaveBeenCalledWith(ErrorMessages.USER_NOT_FOUND.status);
    expect(json).toHaveBeenCalledWith({
    error: `Not Found: ${ErrorMessages.USER_NOT_FOUND.message}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("non assegna bonus se già ricevuto oggi", async () => {
    const today = format(toZonedTime(new Date(), timeZone), "yyyy-MM-dd");

    const mockUser = {
      id: 1,
      tokens: 5,
      lastTokenBonusDate: new Date(),
      save: jest.fn(),
    };

    const req = { user: { id: 1 } } as any;
    const res = {} as Response;
    const next = jest.fn();

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    await dailyTokenBonus(req, res, next);

    expect(mockUser.save).not.toHaveBeenCalled();
    expect(req.userRecord).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("assegna bonus se non ricevuto oggi", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockUser = {
      id: 1,
      tokens: 3,
      lastTokenBonusDate: yesterday,
      save: jest.fn(),
    };

    const req = { user: { id: 1 } } as any;
    const res = {} as Response;
    const next = jest.fn();

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    await dailyTokenBonus(req, res, next);

    expect(mockUser.tokens).toBe(4);
    expect(mockUser.lastTokenBonusDate).toBeInstanceOf(Date);
    expect(mockUser.save).toHaveBeenCalled();
    expect(req.userRecord).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });
});