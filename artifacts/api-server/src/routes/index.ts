import { Router, type IRouter } from "express";
import healthRouter from "./health";
import memoriesRouter from "./memories";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(memoriesRouter);
router.use(statsRouter);

export default router;
