import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadAvatar(uid: string, localUri: string) {
  const avatarRef = ref(storage, `avatars/${uid}.jpg`);

  const resp = await fetch(localUri);
  const blob = await resp.blob();

  await uploadBytes(avatarRef, blob, { contentType: "image/jpeg" });

  const url = await getDownloadURL(avatarRef);
  return url;
}
