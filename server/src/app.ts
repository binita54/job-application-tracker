import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Prisma } from '@prisma/client';
import { NotFoundError, errorHandler } from './errors.js';
import { prisma } from './prisma.js';
import { applicationCreateSchema, applicationQuerySchema, applicationUpdateSchema } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(',') ?? true
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  // Get dashboard statistics - total applications, counts by status
  app.get('/stats', async (_request, response, next) => {
    try {
      const total = await prisma.application.count();
      const byStatus = await prisma.application.groupBy({
        by: ['status'],
        _count: true
      });
      response.json({ total, byStatus });
    } catch (error) {
      next(error);
    }
  });

  app.get('/applications', async (request, response, next) => {
    try {
      const query = applicationQuerySchema.parse(request.query);
      const where: Prisma.ApplicationWhereInput = {};

      if (query.status) {
        where.status = query.status;
      }

      if (query.search) {
        where.OR = [
          { companyName: { contains: query.search, mode: 'insensitive' } },
          { jobTitle: { contains: query.search, mode: 'insensitive' } }
        ];
      }

      const skip = (query.page - 1) * query.limit;
      const [items, total] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy: [{ appliedDate: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: query.limit
        }),
        prisma.application.count({ where })
      ]);

      response.json({
        items,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/applications/:id', async (request, response, next) => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: request.params.id }
      });

      if (!application) {
        throw new NotFoundError('Application not found.');
      }

      response.json(application);
    } catch (error) {
      next(error);
    }
  });

  app.post('/applications', async (request, response, next) => {
    try {
      const data = applicationCreateSchema.parse(request.body);
      const application = await prisma.application.create({ data });
      response.status(201).json(application);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/applications/:id', async (request, response, next) => {
    try {
      const data = applicationUpdateSchema.parse(request.body);
      const application = await prisma.application.update({
        where: { id: request.params.id },
        data
      });

      response.json(application);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/applications/:id', async (request, response, next) => {
    try {
      await prisma.application.delete({
        where: { id: request.params.id }
      });

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  const clientPath = path.resolve(__dirname, '../../dist-client');
  app.use(express.static(clientPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(clientPath, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
