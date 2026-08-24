import { CHUNK_SIZE, CHUNK_OVERLAP } from "../../config/env.js";

export function chunkText(text: string): string[]{
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const chunks : string[] = [];  //final chunks
    let current = "";  //current working chunks

    for(const para of paragraphs){
        if(current.length + para.length <= CHUNK_SIZE){
            current += (current ? "\n\n" : "") + para;
        }else{
            if(current) chunks.push(current);
            const overlap = current.slice(-CHUNK_OVERLAP);
            current = overlap ? overlap + "\n\n" + para : para;
        }
    }
    if(current) chunks.push(current);

    return chunks;
}