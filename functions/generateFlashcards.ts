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

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { file_url, text: userText, file_name } = await req.json();
        
        let extractedText = "";

        if (file_url) {
            console.log(`Downloading file: ${file_name}`);
            const fileRes = await fetch(file_url);
            if (!fileRes.ok) throw new Error("Failed to download file");
            
            const arrayBuffer = await fileRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const lowerName = (file_name || "").toLowerCase();

            try {
                if (lowerName.endsWith(".docx")) {
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    extractedText = result.value;
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
                        extractedText += content.replace(/<[^>]+>/g, " ") + "\n";
                    }
                } else if (lowerName.endsWith(".pdf")) {
                    const data = await pdf(buffer);
                    extractedText = data.text;
                } else {
                    extractedText = new TextDecoder().decode(arrayBuffer);
                }
            } catch (extractError) {
                console.error("Text extraction failed:", extractError);
                extractedText = `(Text extraction failed for ${file_name})`;
            }
        }

        const combinedText = (userText || "") + "\n\n" + extractedText;
        
        // Use a chunking strategy to process large texts thoroughly
        // Limit total processed text to avoid excessive costs/timeouts (e.g. 300k chars)
        const textToProcess = combinedText.slice(0, 300000);
        
        if (!textToProcess.trim() || textToProcess.trim().length < 10) {
             return Response.json({ error: "No text could be extracted." }, { status: 400 });
        }

        // Chunk size optimized for context window vs granularity - increased overlap for better context
        const chunks = chunkText(textToProcess, 12000, 2000); 
        console.log(`Processing ${chunks.length} chunks...`);

        // Process all chunks in parallel (with reasonable limit)
        // Note: For very large files, we might process more than 10 chunks if needed, but let's cap at 15 to be safe on timeouts
        const promises = chunks.slice(0, 15).map(async (chunk, index) => {
            try {
                const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are an expert AI tutor tasked with creating a massive, exhaustive study set from unstructured source material.
                    
                    GOAL: Extract EVERY single piece of information, no matter how small, into a flashcard. Aim for maximum coverage.
                    
                    INSTRUCTIONS:
                    1. Read the text deeply. It is unstructured and may not be formatted nicely. You must Reason and Synthesize.
                    2. Identify every concept, fact, date, person, formula, vocabulary word, and relationship.
                    3. Create a distinct flashcard for each one.
                    4. If the text mentions a list of 10 items, create 10 separate cards.
                    5. Use your GENERAL KNOWLEDGE to flesh out definitions if the text is brief, but ensuring the core fact from the text is preserved.
                    6. Do NOT summarize. Do NOT skip "minor" details. Capture everything.
                    7. If a sentence implies a question, turn it into a Term (Question) and Definition (Answer).
                    
                    This is segment ${index + 1} of a larger file. Treat it as a dense source of truth.
                    GENERATE AS MANY CARDS AS POSSIBLE from this text segment (aim for 20-50+ if the text supports it).
                    
                    Text Segment:
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