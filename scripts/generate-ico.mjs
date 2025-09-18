import { promises as fs } from "fs";
import path from "path";
import pngToIco from "png-to-ico";
import { PNG } from "pngjs";

const iconsDir = path.resolve("src-tauri", "icons");
const outputIco = path.join(iconsDir, "icon.ico");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Always create a guaranteed-valid fallback PNG, then convert it to ICO.
  const fallbackPng = path.join(iconsDir, "icon_fallback_256.png");
  const size = 256;
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (size * y + x) << 2;
      // Simple gradient background
      png.data[idx] = 36; // R
      png.data[idx + 1] = 99; // G
      png.data[idx + 2] = 235; // B
      png.data[idx + 3] = 255; // A
    }
  }
  await new Promise((resolve, reject) => {
    const chunks = [];
    png
      .pack()
      .on("data", (c) => chunks.push(c))
      .on("end", async () => {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(fallbackPng, buffer);
        resolve();
      })
      .on("error", reject);
  });

  const icoBuffer = await pngToIco([fallbackPng]);
  await fs.writeFile(outputIco, icoBuffer);
  console.log(`Wrote ICO: ${outputIco}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
