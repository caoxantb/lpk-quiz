import express from "express";
import {
  getAllQuestionsByTest,
  getQuestionById,
} from "../controllers/index.js";

const router = new express.Router();

router.route("/tests/:test").get(getAllQuestionsByTest);
router.route("/questions/:id").get(getQuestionById);

export default router;
