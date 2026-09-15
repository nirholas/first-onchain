const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const TARGET_DATA_URI_BYTES = 3_250;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected file is not a decodable image."));
    image.src = source;
  });
}

export async function optimizeImageArtifact(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a PNG, JPEG, WebP, or SVG image.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Images must be 8 MB or smaller before optimization.");

  const original = await readAsDataUrl(file);
  if (new TextEncoder().encode(original).byteLength <= TARGET_DATA_URI_BYTES || file.type === "image/svg+xml") return original;

  const image = await loadImage(original);
  let scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("This browser cannot optimize images locally.");

  let best = original;
  for (let pass = 0; pass < 12; pass++) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    best = canvas.toDataURL("image/webp", Math.max(.28, .84 - pass * .05));
    if (new TextEncoder().encode(best).byteLength <= TARGET_DATA_URI_BYTES) return best;
    scale *= .82;
  }
  return best;
}
