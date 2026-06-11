import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

export function loadProjectEnv(importMetaUrl) {
  const scriptFile = fileURLToPath(importMetaUrl);
  const scriptDir = path.dirname(scriptFile);
  const rootDir = path.resolve(scriptDir, "..");
  const rootEnvPath = path.resolve(rootDir, ".env");
  const legacyEnvPath = path.resolve(scriptDir, ".env");

  dotenv.config({ path: rootEnvPath });

  // Backward compatibility: only fill gaps from the legacy scripts/.env file.
  if (fs.existsSync(legacyEnvPath)) {
    dotenv.config({ path: legacyEnvPath });
  }

  return {
    rootDir,
    rootEnvPath,
    legacyEnvPath,
  };
}
