import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Bindings } from './s3';
import { registerRoutes } from './routes';

export const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

registerRoutes(app);
