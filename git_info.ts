import { execSync } from "child_process";

try {
  console.log("=== GIT STATUS ===");
  console.log(execSync("git status", { encoding: "utf-8" }));
  
  console.log("=== GIT LOG ===");
  console.log(execSync("git log -n 10 --oneline", { encoding: "utf-8" }));
} catch (error: any) {
  console.error("Error executing git command:", error.message || error);
}
