/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");

function main() {
  const pathList = [
    path.join(__dirname, `auth-jwt`),
    path.join(__dirname, `auth-jwt.pub`),
    path.join(__dirname, `firebaseConfig.prod.json`),
    path.join(__dirname, `firebaseConfig.json`),
  ];

  for (const filePath of pathList) {
    const content = fs.readFileSync(filePath, "utf8");

    const base64 = Buffer.from(content).toString("base64");

    console.log(`Base64 for File ${filePath}: ${base64}`);
  }
}

main();
