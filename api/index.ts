export default async function handler(req: any, res: any) {
  try {
    // @ts-ignore
    const { default: app } = await import("../artifacts/api-server/dist/app.mjs");
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
