// src/workers/loop.ts
// Runs tick() forever with a pause between runs, and shuts down cleanly on Ctrl+C or SIGTERM.
import prisma, { errInfo } from "./db";

export async function runLoop(name: string, tick: () => Promise<unknown>, everyMs = 60_000) {
  let stop = false;
  let wake: (() => void) | null = null;

  const shutdown = () => {
    stop = true;
    wake?.(); // cut the sleep short; a tick already running is allowed to finish
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`${name} started`);

  while (!stop) {
    try {
      await tick();
    } catch (e) {
      // Never log the error object: it can contain query arguments.
      console.error(`${name} tick failed`, errInfo(e));
    }
    if (stop) break;
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, everyMs);
      wake = () => {
        clearTimeout(t);
        resolve();
      };
    });
  }

  await prisma.$disconnect();
  console.log(`${name} stopped`);
}
