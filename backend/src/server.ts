import "dotenv/config"; // loads backend/.env into process.env — must run before config/env.ts is read
import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import { loadStore } from "./services/vectorstore/store.js";
import documentsRouter from "./routes/documents.routes.js";
import chatRouter from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import contradictionsRouter from "./routes/contradictions.routes.js";
import { loadContradictions } from "./services/contradiction/store.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/documents", documentsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/contradictions", contradictionsRouter);

app.use(errorHandler);

await loadStore();
await loadContradictions();
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`),
);
