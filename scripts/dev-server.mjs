import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Accept common preview-host flags while running the native Next.js dev server.
const supplied = process.argv.slice(2);
const args = ["dev", "--webpack"];
let hasHost = false;
for (const argument of supplied) {
  if (argument === "--strictPort") continue;
  if (argument === "--host" || argument === "--hostname") {
    args.push("--hostname");
    hasHost = true;
  } else {
    args.push(argument);
  }
}
if (!hasHost) args.push("--hostname", "0.0.0.0");
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [next, ...args], {
  stdio: "inherit",
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1" },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", () => { process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 0; });
