import { showHUD } from "@raycast/api";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// 예전 Script Command 버전과 같은 경로를 써서, 그 버전이 켜둔 caffeinate 도 끌 수 있게 한다
const PIDFILE = join(homedir(), ".cache", "raycast-caffeinate.pid");

function findRunningPid(): number | null {
  if (!existsSync(PIDFILE)) {
    return null;
  }
  const pid = Number.parseInt(readFileSync(PIDFILE, "utf8").trim(), 10);
  if (Number.isNaN(pid)) {
    return null;
  }
  try {
    // 재부팅 뒤 같은 PID 를 다른 프로세스가 받았을 수 있어 이름까지 확인한다
    const command = execFileSync("ps", ["-p", String(pid), "-o", "comm="], { encoding: "utf8" }).trim();
    return command.endsWith("caffeinate") ? pid : null;
  } catch {
    return null;
  }
}

export default async function Command() {
  const runningPid = findRunningPid();
  if (runningPid !== null) {
    process.kill(runningPid);
    rmSync(PIDFILE, { force: true });
    await showHUD("Caffeinate OFF");
    return;
  }

  // detached + unref: Raycast 가 커맨드 프로세스를 정리해도 caffeinate 는 계속 살아 있어야 한다
  const child = spawn("/usr/bin/caffeinate", ["-i"], { detached: true, stdio: "ignore" });
  child.unref();
  mkdirSync(dirname(PIDFILE), { recursive: true });
  writeFileSync(PIDFILE, String(child.pid));
  await showHUD("Caffeinate ON (화면은 꺼짐, 작업은 계속)");
}
