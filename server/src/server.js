import app from "./app.js";
import { env, validateServerConfig } from "./config/env.js";

validateServerConfig();

const server = app.listen(env.port, () => {
  console.log(`VoiceOrder API running on http://localhost:${env.port}`);
});

function shutDown(signal) {
  console.log(`${signal} received. Shutting down VoiceOrder API.`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));
