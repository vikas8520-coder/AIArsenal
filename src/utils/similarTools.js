import embeddings from "../data/tool-embeddings.json";

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function findSimilarTools(toolId, topK = 5) {
  const source = embeddings[toolId];
  if (!source) return [];

  const scores = [];
  for (const [id, vec] of Object.entries(embeddings)) {
    if (id === toolId) continue;
    scores.push({ id, score: cosineSimilarity(source, vec) });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}
