import crypto from "crypto";
import { getOpenAIClient } from "./openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const STUB_DIMENSIONS = 1536;

export const usingRealEmbeddings = () => Boolean(process.env.OPENAI_API_KEY);

// Deterministic unit vector derived from the text itself. Identical text always
// yields an identical vector and different text yields a different one, so
// cosine similarity stays meaningful enough to exercise search end to end
// without calling a paid API.
const stubEmbedding = (text: string): number[] => {
  const vector: number[] = [];
  let seed = crypto.createHash("sha256").update(text).digest();

  while (vector.length < STUB_DIMENSIONS) {
    for (let i = 0; i + 4 <= seed.length && vector.length < STUB_DIMENSIONS; i += 4) {
      vector.push(seed.readUInt32BE(i) / 0xffffffff - 0.5);
    }
    seed = crypto.createHash("sha256").update(seed).digest();
  }

  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!usingRealEmbeddings()) {
    return stubEmbedding(text);
  }

  const response = await getOpenAIClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
};

export const chunkText = (
  text: string,
  chunkSize = 1000,
  overlapSize = 200,
): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    if (end === text.length) break;
    start = end - overlapSize;
  }

  return chunks;
};
