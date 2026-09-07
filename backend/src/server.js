import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { startScheduler } from "./jobs/scheduler.js";

if (await connectDatabase()) {
  console.log("Data");
}
app.listen(env.port, () =>
  console.log(`[server] API listening on http://localhost:${env.port}`),
);
startScheduler();
