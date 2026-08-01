let cache = null;
let promise = null;

export async function loadEmbeddings() {
  if (cache) return cache;
  if (promise) return promise;

  if (typeof window === "undefined") {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    promise = readFile(join(process.cwd(), "public/tool-embeddings.json"), "utf8").then(JSON.parse);
  } else {
    promise = fetch("/tool-embeddings.json").then((r) => r.json());
  }

  cache = await promise;
  return cache;
}
