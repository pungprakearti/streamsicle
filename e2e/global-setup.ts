import { execSync } from "child_process";
import path from "path";

export default async function globalSetup() {
  const scriptPath = path.join(__dirname, "setup-test-db.sh");
  execSync(`bash ${scriptPath}`, { stdio: "inherit" });
}
