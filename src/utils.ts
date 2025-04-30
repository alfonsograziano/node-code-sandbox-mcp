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

export function preprocessDependencies({
  dependencies,
  image,
}: {
  dependencies: Array<{ name: string; version: string }>;
  image?: string;
}): Record<string, string> {
  const dependenciesRecord: Record<string, string> = Object.fromEntries(
    dependencies.map(({ name, version }) => [name, version])
  );

  // This image has a pre-cached version of chartjs-node-canvas,
  // but we still need to explicitly declare it in package.json
  if (image?.includes("alfonsograziano/node-chartjs-canvas")) {
    dependenciesRecord["chartjs-node-canvas"] = "4.0.0";
  }

  return dependenciesRecord;
}
