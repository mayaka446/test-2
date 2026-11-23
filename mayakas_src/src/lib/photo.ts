// Photos are stored as text inside the database, so no separate file hosting is needed.
const MAX_PHOTO_CHARS = 1_400_000; // roughly a 1 MB image

export class PhotoError extends Error {}

export function validatePhoto(photo: string | null | undefined): string | undefined {
  if (!photo) return undefined;
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(photo)) {
    throw new PhotoError("Photo must be a PNG, JPG or WEBP image");
  }
  if (photo.length > MAX_PHOTO_CHARS) {
    throw new PhotoError("Photo is too large. Please use an image under 1 MB");
  }
  return photo;
}

// Runs in the browser: turns a chosen file into the text form the server expects.
export function readPhotoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new PhotoError("Could not read the photo"));
    reader.readAsDataURL(file);
  });
}
