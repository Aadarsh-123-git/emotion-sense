import { Router, type IRouter } from "express";
import healthRouter from "./health";
import emotionsRouter from "./emotions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(emotionsRouter);

export default router;
