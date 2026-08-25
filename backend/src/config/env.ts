export const PORT = process.env.PORT || 3001;
export const UPLOAD_DIR = "uploads";
export const DATA_FILE = "data/store.json";

export const CHUNK_SIZE = 800;
export const CHUNK_OVERLAP = 150;

export const TOP_K = 5;

export const SIMILARITY_THRESHOLD = 0.75; // min similarity to be considered "same topic"
export const NEAR_DUPLICATE_CEILING = 0.98; // above this = likely identical text, not worth checking
export const CANDIDATE_TOP_K = 3; // how many cross-document matches to check per chunk

export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const GROQ_MODEL = "openai/gpt-oss-20b";

export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
export const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";


