import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { default: app } = await import('../artifacts/api-server/dist/index.mjs');
  app(req, res);
}
