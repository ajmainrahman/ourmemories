import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import memoriesRouter from "./memories";
import statsRouter from "./stats";
import lettersRouter from "./letters";
import repliesRouter from "./replies";
import bucketListRouter from "./bucketList";
import milestonesRouter from "./milestones";
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
