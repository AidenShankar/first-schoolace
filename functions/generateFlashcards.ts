import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from "npm:jszip@3.10.1";
import mammoth from "npm:mammoth@1.6.0";
import pdf from "npm:pdf-parse@1.1.1";
import { Buffer } from "node:buffer";

// Helper to chunk text
function chunkText(text, chunkSize = 15000, overlap = 1000) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

// Helper to extract text from a single file
async function extractTextFromFile(fileUrl, fileName) {
    if (!fileUrl) return "";
    
    console.log(`Downloading file: ${fileName}`);
    try {
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) throw new Error(`Failed to download file: ${fileName}`);
        
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const lowerName = (fileName || "").toLowerCase();
        let text = "";

        if (lowerName.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else if (lowerName.endsWith(".pptx")) {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml/));
            slideFiles.sort((a, b) => {
                const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
                const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
                return numA - numB;
            });
            for (const slide of slideFiles) {
                const content = await zip.file(slide).async("string");
                text += content.replace(/<[^>]+>/g, " ") + "\n";
            }
        } else if (lowerName.endsWith(".pdf")) {
            const data = await pdf(buffer);
            text = data.text;
        } else {
            text = new TextDecoder().decode(arrayBuffer);
        }
        
        return text + "\n\n";
    } catch (e) {
        console.error(`Error extracting text from ${fileName}:`, e);
        return `(Failed to extract text from ${fileName})\n\n`;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        // file_urls should be an array of objects: { url, name }
        const { file_urls, text: userText } = await req.json();
        
        let allExtractedText = "";

        // Handle multiple files if provided
        if (file_urls && Array.isArray(file_urls) && file_urls.length > 0) {
            console.log(`Processing ${file_urls.length} files...`);
            
            // Process files in parallel
            const extractionPromises = file_urls.map(file => 
                extractTextFromFile(file.url, file.name)
            );
            
            const results = await Promise.all(extractionPromises);
            allExtractedText = results.join("");
        } 
        // Backward compatibility for single file
        else if (req.body.file_url) {
             const { file_url, file_name } = await req.json();
             allExtractedText = await extractTextFromFile(file_url, file_name);
        }

        const combinedText = (userText || "") + "\n\n" + allExtractedText;
        
        // Use a chunking strategy to process large texts thoroughly
        // Limit total processed text to avoid excessive costs/timeouts (e.g. 500k chars for multiple files)
        const textToProcess = combinedText.slice(0, 500000);
        
        if (!textToProcess.trim() || textToProcess.trim().length < 10) {
             return Response.json({ error: "No text could be extracted." }, { status: 400 });
        }

        // Chunk size optimized for context window vs granularity
        const chunks = chunkText(textToProcess, 12000, 500); 
        console.log(`Processing ${chunks.length} chunks...`);

        // Process chunks in parallel (limit concurrency if needed, but 10 is usually fine for Deno Deploy)
        // Cap at 20 chunks to prevent timeout on huge sets
        const promises = chunks.slice(0, 20).map(async (chunk, index) => {
            try {
                const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are an expert tutor creating a comprehensive study set. 
                    Extract EVERY single distinct fact, definition, concept, and detail from the text below into a flashcard.
                    Do not summarize or skip details. Be exhaustive. 
                    If the text contains a list, create a card for every item.
                    If the text is dense, create many specific cards rather than few broad ones.
                    
                    Text Segment ${index + 1}:
                    ${chunk}`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            cards: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        term: { type: "string" },
                                        definition: { type: "string" }
                                    },
                                    required: ["term", "definition"]
                                }
                            }
                        },
                        required: ["cards"]
                    }
                });
                return res.cards || [];
            } catch (e) {
                console.error(`Error processing chunk ${index}:`, e);
                return [];
            }
        });

        const results = await Promise.all(promises);
        const allCards = results.flat();

        // Simple deduplication based on term
        const seenTerms = new Set();
        const uniqueCards = allCards.filter(card => {
            const normalized = card.term.toLowerCase().trim();
            if (seenTerms.has(normalized)) return false;
            seenTerms.add(normalized);
            return true;
        });

        console.log(`Generated ${uniqueCards.length} cards from ${chunks.length} chunks.`);

        return Response.json({ cards: uniqueCards });

    } catch (error) {
        console.error("Generate Flashcards Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});