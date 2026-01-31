import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from "npm:jszip@3.10.1";
import mammoth from "npm:mammoth@1.6.0";
import pdf from "npm:pdf-parse@1.1.1";
import { Buffer } from "node:buffer";

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
                    // Find slide XML files
                    const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml/));
                    // Sort by slide number
                    slideFiles.sort((a, b) => {
                        const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
                        const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
                        return numA - numB;
                    });
                    
                    for (const slide of slideFiles) {
                        const content = await zip.file(slide).async("string");
                        // Remove XML tags
                        const plain = content.replace(/<[^>]+>/g, " ");
                        extractedText += plain + "\n";
                    }
                } else if (lowerName.endsWith(".pdf")) {
                    const data = await pdf(buffer);
                    extractedText = data.text;
                } else {
                    // Try plain text for others
                    extractedText = new TextDecoder().decode(arrayBuffer);
                }
            } catch (extractError) {
                console.error("Text extraction failed:", extractError);
                // Fallback: If extraction fails (e.g. encrypted PDF), we might proceed with just userText
                // or try to inform user. But let's log and continue with what we have.
                extractedText = `(Text extraction failed for ${file_name})`;
            }
        }

        const combinedText = (userText || "") + "\n\n" + extractedText;
        
        // Truncate to avoid massive token usage (approx 50k tokens)
        const finalText = combinedText.slice(0, 200000); 

        if (!finalText.trim() || finalText.trim().length < 10) {
             return Response.json({ error: "No text could be extracted from the file. Please try converting it to text or copy-pasting the content." }, { status: 400 });
        }

        console.log("Extracted text length:", finalText.length);

        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
             prompt: `Extract flashcards from the following text. Return ONLY a JSON object with a key "cards" containing an array of objects with "term" and "definition" keys.
             Create comprehensive flashcards that cover the key concepts found in the text.
             
             Text:
             ${finalText}`,
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

        return Response.json(llmRes);

    } catch (error) {
        console.error("Generate Flashcards Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});