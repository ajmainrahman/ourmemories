import { Router, type IRouter } from "express";
import healthRouter from "./health";
import memoriesRouter from "./memories";
import statsRouter from "./stats";
import lettersRouter from "./letters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(memoriesRouter);
router.use(statsRouter);
router.use(lettersRouter);

export default router;
