import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Buffer } from 'node:buffer';
import pdf from 'npm:pdf-parse@1.1.1';
import mammoth from 'npm:mammoth@1.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { contextType, topic, url, file_url, file_name, num_questions, question_type, difficulty } = await req.json();

        let prompt = `You are an expert curriculum developer. Generate quiz questions based on the provided context.
            
            **Requirements:**
            - Number of Questions: ${num_questions}
            - Question Type: ${question_type}
            - Difficulty: ${difficulty}

            **IMPORTANT:** 
            - YOU MUST GENERATE QUESTIONS OF TYPE: "${question_type}" ONLY. Do not mix types.
            - For multiple choice questions (question_type="multiple-choice"), you MUST provide exactly 4 written answer options (A, B, C, D) with complete text for each option. The "options" object MUST NOT be null.
            - For true-false questions (question_type="true-false"), correct_answer should be "A" (True) or "B" (False).
            - For free-response questions (question_type="free-response"), options should be empty or null, and correct_answer should be a sample correct answer or key points.
            
            Generate exactly ${num_questions} well-written questions. Each question should be clear and educational.
            
            Output format should be a JSON object with this exact structure:
            {
              "questions": [
                {
                  "question_text": "What is the capital of France?",
                  "question_type": "multiple-choice",
                  "options": {
                    "A": "London",
                    "B": "Berlin", 
                    "C": "Paris",
                    "D": "Madrid"
                  },
                  "correct_answer": "C"
                }
              ]
            }
        `;

        let llmPayload = {
            prompt: prompt,
            add_context_from_internet: false,
            file_urls: [],
            response_json_schema: {
                type: "object",
                properties: {
                    questions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question_text: { type: "string" },
                                question_type: { type: "string", enum: [question_type] },
                                options: { 
                                    type: "object",
                                    properties: {
                                        "A": { type: "string" },
                                        "B": { type: "string" },
                                        "C": { type: "string" },
                                        "D": { type: "string" }
                                    },
                                    nullable: true
                                },
                                correct_answer: { type: "string" }
                            },
                            required: ["question_text", "question_type", "correct_answer"]
                        }
                    }
                },
                required: ["questions"]
            }
        };

        // Handle context
        if (contextType === 'topic' && topic) {
            llmPayload.prompt += `\n\nTopic/Context: ${topic}`;
            llmPayload.add_context_from_internet = true;
        } else if (contextType === 'url' && url) {
            llmPayload.prompt += `\n\nContext URL: ${url}`;
            llmPayload.add_context_from_internet = true;
        } else if (contextType === 'file' && file_url) {
            
            let textExtracted = false;
            
            try {
                // Try to extract text content to avoid large file processing timeout
                const lowerName = (file_name || '').toLowerCase();
                const isPdf = lowerName.endsWith('.pdf');
                const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');
                const isTxt = lowerName.endsWith('.txt');
                
                if (isPdf || isDocx || isTxt) {
                    console.log(`Attempting to extract text from ${lowerName}`);
                    const fileRes = await fetch(file_url);
                    if (!fileRes.ok) throw new Error("Failed to fetch file");
                    const arrayBuffer = await fileRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    let extractedText = '';
                    
                    if (isPdf) {
                        const data = await pdf(buffer);
                        extractedText = data.text;
                    } else if (isDocx) {
                        const result = await mammoth.extractRawText({ buffer: buffer });
                        extractedText = result.value;
                    } else if (isTxt) {
                        extractedText = buffer.toString('utf-8');
                    }
                    
                    if (extractedText && extractedText.trim().length > 0) {
                        // Truncate to ~150k characters to be safe with context windows and processing
                        const maxLength = 150000;
                        if (extractedText.length > maxLength) {
                            extractedText = extractedText.substring(0, maxLength) + "\n...[Content Truncated due to size]...";
                        }
                        
                        llmPayload.prompt += `\n\nContext Content (Extracted from file):\n${extractedText}`;
                        // Explicitly disable internet context when we have text content
                        llmPayload.add_context_from_internet = false; 
                        textExtracted = true;
                        console.log("Text extraction successful, length:", extractedText.length);
                    }
                }
            } catch (e) {
                console.error("Text extraction failed, falling back to file_urls:", e);
            }
            
            if (!textExtracted) {
                // Fallback for images or if extraction failed
                llmPayload.file_urls.push(file_url);
                llmPayload.add_context_from_internet = false; 
                llmPayload.prompt += `\n\nContext: Use the uploaded file content to generate questions.`;
            }
            
        } else {
             return Response.json({ error: 'Missing context for generation' }, { status: 400 });
        }

        const result = await base44.integrations.Core.InvokeLLM(llmPayload);

        return Response.json(result);

    } catch (error) {
        console.error("Error generating quiz:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});