import type { Request, Response } from 'express';
import app from '../server';

// Vercel Serverless Function entry point
export default function handler(req: Request, res: Response) {
  // Normalize URL for serverless routing
  if (req.url && !req.url.startsWith('/api') && req.url.includes('/courier/')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
