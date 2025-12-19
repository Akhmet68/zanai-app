import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import * as FileSystem from "expo-file-system";

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

function guessExtFromMime(mime?: string) {
  if (!mime) return "";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("pdf")) return ".pdf";
  if (mime.includes("m4a")) return ".m4a";
  if (mime.includes("mp3")) return ".mp3";
  if (mime.includes("aac")) return ".aac";
  return "";
}

export async function uploadUriToStorage(params: {
  uid: string;
  uri: string;
  folder: "chat-images" | "chat-files" | "chat-audio";
  fileName?: string;
  contentType?: string;
}) {
  const { uid, uri, folder } = params;

  const ext = guessExtFromMime(params.contentType);
  const baseName = params.fileName ? safeName(params.fileName) : `file_${Date.now()}${ext}`;
  const path = `users/${uid}/${folder}/${Date.now()}_${baseName}`;

  const resp = await fetch(uri);
  const blob = await resp.blob();

  const r = ref(storage, path);
  await uploadBytes(r, blob, params.contentType ? { contentType: params.contentType } : undefined);

  const url = await getDownloadURL(r);

  let size: number | undefined;
  try {
    const info: any = await FileSystem.getInfoAsync(uri);
    if (info?.exists && typeof info?.size === "number") size = info.size;
  } catch {}

  return { url, path, name: baseName, size };
}
