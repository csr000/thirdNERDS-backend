import HttpStatusCodes from "http-status-codes";
import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const SERVER_ERROR = (res: Response, err: Error) => {
  !isProduction && console.error(err.message);
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
};

export const writelog = (...log: unknown[]) => {
  !isProduction && console.log(...log);
};
