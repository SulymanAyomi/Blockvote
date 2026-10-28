// src/workers/run-publisher.ts
import { tick } from "./publisher";
import { runLoop } from "./loop";

void runLoop("publisher", tick, 60_000);
