import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";
let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor() {
  if (!extractor) {
    console.log("Downloading embedding model (first run only)...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Model ready.");
  }
  return extractor;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
export async function embedChunks(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await embedText(text));
  }
  return embeddings;
}
