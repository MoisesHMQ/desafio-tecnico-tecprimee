import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (handler: AsyncRoute): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};

