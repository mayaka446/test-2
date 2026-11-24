// Photos are resized in the browser, then stored as text in the database.
const MAX_PHOTO_CHARS = 1_400_000; // about 1 MB of text after encoding
const MAX_SIDE_PX = 1200;
const JPEG_QUALITY = 0.85;

export class PhotoError extends Error {}

// Server side: accepts only the JPEG/PNG/WEBP data the browser step produces.
export function validatePhoto(photo: string | null | undefined): string | undefined {
  if (!photo) return undefined;
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(photo)) {
    throw new PhotoError("Photo could not be processed. Please try another image.");
  }
  if (photo.length > MAX_PHOTO_CHARS) {
    throw new PhotoError("Photo is still too large after resizing. Please try another image.");
  }
  return photo;
}

// Browser side: accepts any image the device can show, resizes it, and returns a JPEG data URL.
export function readPhotoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE_PX / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new PhotoError("Could not process the photo on this device."));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoError("This photo format is not supported on this device. Try saving it as JPG or PNG."));
    };
    img.src = url;
  });
}
