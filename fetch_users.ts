import fs from "fs";
import path from "path";

async function main() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.log("No firebase-applet-config.json found");
      return;
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const projectId = firebaseConfig.projectId;
    const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users`;
    console.log(`Fetching from REST API: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error response: ${response.status} ${response.statusText}\n${text}`);
      return;
    }
    
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
