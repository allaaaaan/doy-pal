const fs = require("fs");
const path = require("path");

// Create a basic canvas-based icon
function generateIcon(size, outputPath) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = "white";
  ctx.font = `bold ${size / 3}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DP", size / 2, size / 2);

  // Convert to buffer and save
  const dataUrl = canvas.toDataURL("image/png");
  const data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(data, "base64");

  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated icon: ${outputPath}`);
}

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
generateIcon(192, path.join(iconsDir, "icon-192x192.png"));
generateIcon(512, path.join(iconsDir, "icon-512x512.png"));

console.log("Icon generation complete!");
