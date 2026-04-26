import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import memoriesRouter from "./memories.js";
import statsRouter from "./stats.js";
import lettersRouter from "./letters.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(memoriesRouter);
router.use(statsRouter);
router.use(lettersRouter);

export default router;
