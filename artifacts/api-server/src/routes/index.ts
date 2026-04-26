import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import memoriesRouter from "./memories.js";
import statsRouter from "./stats.js";
import lettersRouter from "./letters.js";
import repliesRouter from "./replies.js";
import bucketListRouter from "./bucketList.js";
import milestonesRouter from "./milestones.js";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);

router.use(requireAuth);
router.use(memoriesRouter);
router.use(statsRouter);
router.use(lettersRouter);
router.use(repliesRouter);
router.use(bucketListRouter);
router.use(milestonesRouter);

export default router;
