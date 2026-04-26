import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import("../artifacts/api-server/dist/vercel.mjs");
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
