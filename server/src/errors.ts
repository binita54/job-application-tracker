import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class NotFoundError extends Error {
  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Validation failed.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof NotFoundError) {
    return response.status(404).json({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return response.status(404).json({ message: 'Application not found.' });
  }

  console.error(error);
  return response.status(500).json({ message: 'Unexpected server error.' });
}
