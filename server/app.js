import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.js";
import router from "./routers/index.js";

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

export default app;
