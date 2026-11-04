import { fork, spawn } from "child_process";
import path from "path";

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch (err) {
      console.log(`Probe failed: ${err.message} (${err.cause?.code || err.code})`);
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  return false;
}

function runScript(scriptPath, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("close", (code) => resolve(code));
  });
}

async function main() {
  const PORT = "3006";
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  const nextBin = path.resolve("node_modules/next/dist/bin/next");

  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = fork(nextBin, ["start", "-H", "127.0.0.1", "-p", PORT], {
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  server.stdout?.on("data", (d) => process.stdout.write(`[Next] ${d}`));
  server.stderr?.on("data", (d) => process.stderr.write(`[Next Err] ${d}`));

  try {
    const isReady = await waitForServer(BASE_URL);
    if (!isReady) {
      console.error(`Server failed to start on ${BASE_URL} within 20 seconds.`);
      server.kill();
      process.exit(1);
    }

    console.log(`\n✓ Server is ready at ${BASE_URL}\n`);

    console.log("==========================================================");
    console.log(" STEP 1: RUNNING EXISTING AUTOMATED TEST SUITE            ");
    console.log("==========================================================");
    const code1 = await runScript("scripts/test-suite.mjs", { TEST_BASE_URL: BASE_URL });

    console.log("\n==========================================================");
    console.log(" STEP 2: RUNNING NEW SECURITY REGRESSION TEST SUITE       ");
    console.log("==========================================================");
    const code2 = await runScript("scripts/security-regression-tests.mjs", { TEST_BASE_URL: BASE_URL });

    server.kill();

    if (code1 !== 0 || code2 !== 0) {
      console.error(`\nTest failure: Suite 1 exit: ${code1}, Suite 2 exit: ${code2}`);
      process.exit(1);
    }

    console.log("\n🎉 ALL TEST SUITES PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("Test execution error:", err);
    server.kill();
    process.exit(1);
  }
}

main();
