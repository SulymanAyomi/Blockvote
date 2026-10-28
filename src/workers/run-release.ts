// src/workers/run-release.ts
import { tick } from "./release-worker";
import { runLoop } from "./loop";

void runLoop("release-worker", tick, 60_000);
