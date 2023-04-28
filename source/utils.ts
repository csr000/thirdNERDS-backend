import HttpStatusCodes from "http-status-codes";
import { Response } from "express";

export const SERVER_ERROR = (res: Response, err: Error) => {
  writelog(err.message);
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
};

export const writelog = (...log: unknown[]) => {
  const isProduction = false;
  isProduction ? null : console.log(...log);
};
