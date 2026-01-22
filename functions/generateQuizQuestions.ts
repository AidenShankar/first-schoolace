import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            contextType, 
            topic, 
            url, 
            file_url, 
            num_questions, 
            question_type, 
            difficulty 
        } = await req.json();

        let prompt = `You are an expert curriculum developer. Generate quiz questions based on the provided context.
            
            **Requirements:**
            - Number of Questions: ${num_questions}
            - Question Type: ${question_type}
            - Difficulty: ${difficulty}

            **IMPORTANT:** 
            - For multiple choice questions, you MUST provide exactly 4 written answer options (A, B, C, D) with complete text for each option.
            - For true-false questions, correct_answer should be "A" (True) or "B" (False).
            - For free-response questions, options should be empty or null, and correct_answer should be a sample correct answer or key points.
            
            Generate exactly ${num_questions} well-written questions. Each question should be clear and educational.
            
            Output format should be a JSON object with this exact structure:
            {
              "questions": [
                {
                  "question_text": "Question text here",
                  "question_type": "${question_type}",
                  "options": {
                    "A": "Option 1",
                    "B": "Option 2", 
                    "C": "Option 3",
                    "D": "Option 4"
                  },
                  "correct_answer": "C"
                }
              ]
            }`;

        let payload = {
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
                                question_type: { type: "string", enum: ["multiple-choice", "true-false", "free-response"] },
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

        if (contextType === 'topic' && topic) {
            payload.prompt += `\n\nTopic/Context: ${topic}`;
            payload.add_context_from_internet = true;
        } else if (contextType === 'url' && url) {
            payload.prompt += `\n\nContext URL: ${url}`;
            payload.add_context_from_internet = true;
        } else if (contextType === 'file' && file_url) {
            payload.file_urls = [file_url];
            payload.add_context_from_internet = false; 
            payload.prompt += `\n\nContext: Use the uploaded file content to generate questions.`;
        } else {
             return Response.json({ error: 'Missing context' }, { status: 400 });
        }

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM(payload);

        // Parse if string (though InvokeLLM with schema returns object)
        const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;

        return Response.json(parsedResult);

    } catch (error) {
        console.error("Generate Quiz Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});