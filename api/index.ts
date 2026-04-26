import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import("../artifacts/api-server/src/app.js");
    app(req, res);
  } catch (err: any) {
    console.error("STARTUP ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
