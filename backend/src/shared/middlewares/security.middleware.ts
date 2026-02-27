import { NextFunction, Request, RequestHandler, Response } from "express";

export const securityHeaders: RequestHandler = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimit = (
  maxRequests: number,
  windowMs: number
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;

    if (current.count > maxRequests) {
      res.status(429).json({
        message: "Muitas tentativas. Tente novamente em instantes.",
        code: "TOO_MANY_REQUESTS",
      });
      return;
    }

    next();
  };
};

