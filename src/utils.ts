import { existsSync, readFileSync } from "fs";

export function isRunningInDocker() {
  // 1. The “/.dockerenv” sentinel file
  if (existsSync("/.dockerenv")) return true;

  // 2. cgroup data often embeds “docker” or “kubepods”
  try {
    const cgroup = readFileSync("/proc/1/cgroup", "utf8");
    if (cgroup.includes("docker") || cgroup.includes("kubepods")) {
      return true;
    }
  } catch (err) {
    // unreadable or missing → assume “not”
  }

  return false;
}
