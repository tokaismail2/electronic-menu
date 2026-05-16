import axios from "axios";

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "trading-app";
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "57d093e4-101d-4551-81125946ab66-1bef-429b";
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || "https://storage.bunnycdn.com";


export async function uploadToBunny(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "foods"
): Promise<string> {
  const url = `${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${folder}/${fileName}`;
  console.log("Uploading to:", url);

  await axios.put(url, fileBuffer, {
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/octet-stream",
    },
    maxBodyLength: Infinity,
  });

  return `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${folder}/${fileName}`;
}

export async function deleteFromBunny(
  fileName: string,
  folder: string
): Promise<void> {
  const url = `${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${folder}/${fileName}`;
  console.log("Deleting from:", url);

  await axios.delete(url, {
    headers: {
      AccessKey: BUNNY_API_KEY,
    },
  });
}
