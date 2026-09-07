import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { startScheduler } from "./jobs/scheduler.js";

if (await connectDatabase()) {
  console.log("Data");
}

app.get("/", (req, res) => {
  res.send("Backend is up and running smoothly!");
});

app.listen(env.port, () =>
  console.log(`[server] API listening on http://localhost:${env.port}`),
);
startScheduler();
