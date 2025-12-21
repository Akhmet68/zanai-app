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

// Типы expo-file-system у тебя почему-то “не видят” documentDirectory/cacheDirectory,
// поэтому работаем через any — это норм для Expo Go
const FS: any = FileSystem;

function getWritableDir(): string | null {
  return (FS.cacheDirectory as string | undefined) ?? (FS.documentDirectory as string | undefined) ?? null;
}

function joinPath(dir: string, file: string) {
  const d = dir.endsWith("/") ? dir : `${dir}/`;
  return `${d}${file}`;
}

async function ensureFileUri(uri: string, fileName: string): Promise<{ fileUri: string; shouldCleanup: boolean }> {
  const isWeird =
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://");

  if (!isWeird) return { fileUri: uri, shouldCleanup: false };

  const baseDir = getWritableDir();
  if (!baseDir) throw new Error("Нет доступной директории для временных файлов (expo-file-system).");

  const dest = joinPath(baseDir, `${Date.now()}_${safeName(fileName)}`);

  // На Android content:// часто ломает fetch(blob), поэтому копируем в file://
  await FS.copyAsync({ from: uri, to: dest });

  return { fileUri: dest, shouldCleanup: true };
}

async function uriToBlob(uri: string): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onerror = () => reject(new Error("Не удалось прочитать файл (XHR)."));
    xhr.onload = () => resolve(xhr.response);
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

export async function uploadUriToStorage(params: {
  uid: string;
  uri: string;
  folder: "chat-images" | "chat-files" | "chat-audio";
  fileName?: string;
  contentType?: string;
}) {
  const { uid, folder } = params;

  const ext = guessExtFromMime(params.contentType);
  const baseName = params.fileName ? safeName(params.fileName) : `file_${Date.now()}${ext}`;
  const path = `users/${uid}/${folder}/${Date.now()}_${baseName}`;

  const { fileUri, shouldCleanup } = await ensureFileUri(params.uri, baseName);

  let blob: Blob | null = null;

  try {
    blob = await uriToBlob(fileUri);

    const r = ref(storage, path);
    await uploadBytes(r, blob, params.contentType ? { contentType: params.contentType } : undefined);

    const url = await getDownloadURL(r);

    let size: number | undefined;
    try {
      const info: any = await FS.getInfoAsync(fileUri);
      if (info?.exists && typeof info?.size === "number") size = info.size;
    } catch {}

    return { url, path, name: baseName, size };
  } finally {
    try {
      (blob as any)?.close?.();
    } catch {}

    if (shouldCleanup) {
      try {
        await FS.deleteAsync(fileUri, { idempotent: true });
      } catch {}
    }
  }
}
