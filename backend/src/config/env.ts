// Central place for config values. Nothing fancy for part 1 —
// just the constants other files need, with sane defaults.

export const PORT = process.env.PORT || 3001;
export const UPLOAD_DIR = "uploads"; // where multer writes raw files
export const DATA_FILE = "data/store.json"; // where the vector store persists to disk

export const CHUNK_SIZE = 800; // characters per chunk
export const CHUNK_OVERLAP = 150; // characters shared between consecutive chunks
