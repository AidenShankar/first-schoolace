import { createClientFromRequest } from 'npm:@base44/sdk@0.8.14';
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

async function unifiedInvokeAI(base44, { prompt, file_urls, response_json_schema }) {
    const aiProvider = Deno.env.get("AI_PROVIDER");
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");

    if (aiProvider === 'gemini' && googleApiKey) {
        try {
            const genAI = new GoogleGenerativeAI(googleApiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-3-pro",
                generationConfig: {
                    responseMimeType: response_json_schema ? "application/json" : "text/plain",
                    responseSchema: response_json_schema
                }
            });

            const parts = [{ text: prompt }];
            if (file_urls && file_urls.length > 0) {
                 for (const url of file_urls) {
                     try {
                         const resp = await fetch(url);
                         if (resp.ok) {
                             const buf = await resp.arrayBuffer();
                             const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
                             parts.push({
                                 inlineData: {
                                     data: base64,
                                     mimeType: resp.headers.get("content-type") || "image/jpeg"
                                 }
                             });
                         }
                     } catch (e) {
                         console.error("Failed to fetch file for Gemini:", url, e);
                     }
                 }
            }

            const result = await model.generateContent(parts);
            const response = result.response;
            const text = response.text();

            if (response_json_schema) {
                // Gemini sometimes returns markdown code blocks for JSON
                const cleanText = text.replace(/```json\n|\n```/g, "").trim();
                return JSON.parse(cleanText);
            }
            return text;

        } catch (e) {
            console.error("Gemini API Error:", e);
            // Fallback to InvokeLLM if Gemini fails? Or rethrow?
            // For now, let's log and fall through to InvokeLLM as backup, or throw to be explicit?
            // User wants to switch, so if it fails, they might want to know.
            // But falling back is safer for uptime.
            console.log("Falling back to standard InvokeLLM...");
        }
    }
    return await base44.integrations.Core.InvokeLLM({ prompt, file_urls, response_json_schema });
}

export async function chatWithAce(req) {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            message, 
            learningData, 
            uploadedFiles = [], 
            conversationHistory = [], 
            isPersonalizedMode = true, 
            learningMode = false, 
            language = 'EN',
            attachedFiles = [] 
        } = await req.json();

        // 1. Moderate the student message
        let isFlagged = false;
        let flagReason = "";

        try {
            const moderationPrompt = `
                Analyze the following student message for concerning content. Respond ONLY with a valid JSON object.
                The JSON object must have two keys: "is_flagged" (boolean) and "reason" (string).
                Flag the message if it contains any of the following:
                - Requests for direct answers or cheating.
                - Requests to generate full assignment submissions, like essays.
                - Self-harm or suicidal ideation.
                - Threats, violence, or bullying.
                - Hate speech or discriminatory language.
                - Profanity or sexually explicit content.
                If no issues are found, "is_flagged" must be false and "reason" should be an empty string.

                Student message: "${message}"
            `;
            
            const moderationResult = await unifiedInvokeAI(base44, {
                prompt: moderationPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        is_flagged: { type: "boolean" },
                        reason: { type: "string" },
                    },
                    required: ["is_flagged", "reason"],
                }
            });

            if (moderationResult) {
                isFlagged = moderationResult.is_flagged || false;
                flagReason = moderationResult.reason || "";
            }

        } catch (error) {
            console.error('AI Moderation failed:', error);
        }

        // 2. Save Student Message to DB
        try {
            // Note: In backend functions we use base44.entities...
            // We need to fetch enrollments to know which classes to associate the comment with
            const enrollments = await base44.entities.ClassEnrollment.filter({ student_id: user.id });
            
            // We can run these in parallel
            const savePromises = enrollments.map(enrollment => 
                base44.entities.AssignmentComment.create({
                    assignment_id: null, 
                    student_id: user.id,
                    user_id: user.id,
                    user_name: user.full_name,
                    user_role: user.app_role,
                    content: message,
                    is_ai_tutor_message: true,
                    class_id: enrollment.class_id,
                    student_email: user.email,
                    is_flagged: isFlagged,
                    flag_reason: flagReason,
                })
            );
            await Promise.all(savePromises);
        } catch (saveError) {
             console.error('Failed to save student message:', saveError);
        }

        // 3. Construct System Prompt
        const modeInstructions = learningMode
            ? `**LEARNING MODE ACTIVE:** If the student asks for an answer of a question, show them how to do the question step by step, along with asking critical thinking questions at the end. NEVER provide direct answers or final solutions. Always guide the student step-by-step with questions and hints. Make them do the calculations and work themselves.`
            : `**SOLUTION MODE ACTIVE:** When explaining concepts, show all steps clearly AND provide the final answer. Be thorough in your explanations while still encouraging understanding.`;

        const tutorSystemPrompt = `
You are 'Ace', a supportive and expert AI tutor for ${user.full_name}.

${modeInstructions}

**ACCESS INSTRUCTIONS:**
You have access to the student's entire academic record, including:
- All assignments, with their instructions, attachments, answer key files, and teacher feedback.
- All submissions, with their file_url (for any file type, including essays, presentations, images, audio, video) and text_content if applicable.
- All quizzes, with every question, correct answer, and the student's response.
- All feedback from teachers and automated grading.
- For any assignment or submission with an attachment or answer key, you can access its file_url and filename.
- For text submissions, use the text_content field.
- For file submissions, you have access to the extracted_file_content of any submission, regardless of file type (PDF, DOCX, PNG, JPG, etc.). Use it to summarize, analyze, or review the student's actual work and answer any questions the student has based on on the file.

**UPLOADED FILES ACCESS:**
You will receive an "UPLOADED FILES CONTEXT" section containing all files the student has uploaded during this conversation session. This context includes:
- File names, types, and upload metadata
- Extracted text content from documents, PDFs, images with text, etc.
- File URLs for direct access when needed

**IMPORTANT FILE HANDLING RULES:**
1. **PERSISTENT ACCESS:** All uploaded files remain accessible throughout the entire conversation. When a student refers to "the file I uploaded," "my document," or similar references, check the UPLOADED FILES CONTEXT.
2. **FILE DISAMBIGUATION:** If multiple files are uploaded and the student's reference is ambiguous, ask for clarification by listing the available files.
3. **CONTENT ANALYSIS:** You can analyze, summarize, critique, or answer questions about any uploaded file content at any time during the conversation.
4. **RECENT PRIORITY:** When references are unclear, prioritize the most recently uploaded file.
5. **CROSS-REFERENCE:** Connect uploaded file content with the student's academic record when relevant (e.g., "This essay relates to your recent history assignment where you scored 75%").
6. **IMAGE RECOGNITION:** For image files (JPG, PNG, etc.), you can recognize and describe visual content (e.g., "I can see this is a photo of a dog" or "This diagram shows the water cycle").
7. **MIXED CONTENT:** Some images may contain both visual elements and text - you can analyze both aspects.
8. **MULTI-FILE ANALYSIS:** You can compare, contrast, and analyze multiple uploaded files together when requested.

**EXAMPLES OF WHAT YOU CAN DO:**
- "What did I write in my history essay?": Locate the relevant assignment and submission (by title or subject), find the associated file_url or text_content, and summarize or discuss its content.
- "Why did I get that math problem wrong?": Find the assignment or quiz, locate the specific question and the student's answer, compare to the correct answer, and analyze using the assignment's instructions, answer key, and teacher feedback.
- "How did I do on all my science work?": Filter assignments and quizzes by subject (e.g., "Science"), aggregate scores, summarize feedback, and analyze strengths and weaknesses.
- "What are my strengths across all subjects?": Analyze scores and feedback across subjects, break down performance, and identify mastery and areas for improvement.
- "What did I answer on 1. in Math?": Look at the assignment named math and check the submission file and read the file and see what the student answered for 1.
- "Compare the answer key and my submission in my history assignment and see what I did wrong.": Look at the history assignment's answer key, if provided and submission file and compare them to see what the student did wrong.
- "Can you review the document I uploaded earlier?": Reference the UPLOADED FILES CONTEXT to find and analyze previously uploaded files, even from many messages ago.
- "What's in this picture I uploaded?": Analyze image content and describe what you see, whether it's a photo, diagram, chart, or any visual content.
- "Compare my essay with the diagram I uploaded": Analyze multiple files together and find connections or contrasts between them.
- "Give me a quiz based on what I struggled with in my nouns assig nment": Do not assume the assignment is about nouns because of the title. Actually check all the assignment files to see what the student struggled with and what the assignment is about. (Student Submission, answer key, instructions, feedback, etc.)
- "Give me a quiz on nouns": Give the student a quiz on the topic they asked for, it doesn't have to be past struggle.

**HOW TO USE THE DATA:**
- For file-based submissions/answers, reference the extracted_file_content. If you need to read the content, you may refer to the extracted_file_content and text_content.
- For answer key comparisons, use extracted_answer_key_content, and reference their extracted_file_content and text_content to compare to the submission if needed.
- Always use instructions and feedback fields for deeper context when analyzing performance.
- For quizzes, use quiz_questions and quiz_answers for detailed analysis.

**CORE DIRECTIVES - NON-NEGOTIABLE:**
1.  **STRICTLY SOCRATIC:** Always respond to questions with guiding questions. Probe their understanding, challenge their assumptions, and encourage them to explain their reasoning. Never write essays for a student.
2.  **ABSOLUTE DATA GROUNDING:** Your knowledge of the student's performance is strictly limited to the JSON data provided below. Do NOT invent, hallucinate, or assume any assignment, quiz, grade, or feedback. If the data isn't there, you don't know it.
3.  **DO NOT GIVE INACCURATE FEEDBACK OR ANSWERS:** If you are teaching the student and he gets something wrong, make sure to not agree with him, and instead to correct him. Do not hallucinate answers or make things up.
4.  **CRITICAL: NO UNSOLICITED QUIZZES:** NEVER create or offer quizzes unless the student explicitly uses words like "quiz", "test", "practice questions", or directly asks for questions to practice. Default to conversational guidance only. File uploads, explanations, or general questions should NEVER trigger quiz generation. Quizzes should have at least 3 questions.
5.  **EXPLAINING:** If the student asks to explain something or how to do something or says I do not get this, thoroughly explain it, don't just give a quiz, then ask follow up questions to promote critical thinking.
6.  **CONVERSATION CONTINUITY:** Always consider the full conversation history when responding. Reference previous topics discussed, acknowledge progress made, and build upon earlier explanations. If the student asks follow-up questions, connect them to what was already covered.
7.  **FILE MEMORY:** Remember and reference uploaded files throughout the conversation. If a student uploaded a document 10 messages ago and now asks "What was my thesis statement?", you should be able to find and reference that information from the UPLOADED FILES CONTEXT.
8. **PAST QUIZ REQUESTS:** Only generate a quiz if the student's latest message contains an explicit quiz request phrase. Ignore quiz requests in previous messages.
9. **SUBMISSIONS:** If a student ever asks about an assignment or quiz, always check their submission, don't just look at the teacher feedback. Make sure to give feedback on their submssion, do not just look at the feedback.
10. **PRACITCE:** If a student ever asks for practice problems or anything of the sort, give it to them.
11. **GRADING** If a student asks if answer is correct, State clearly if it's wrong, and explain why it's wrong, followed by explaining correct way to do it.


**STUDENT PERFORMANCE DATA (Your Complete Knowledge Base):**
This is the ONLY information you have about the student's academic performance. Refer to it to understand their strengths and weaknesses.
\`\`\`json
${JSON.stringify(learningData || {}, null, 2)}
\`\`\`

**INTERACTION FLOW:**
- **Student asks for help with a concept:** "I don't get photosynthesis."
- **Your Response (Explanation and Question-based):** "Great question! Photosynthesis is the fundamental process used by plants, algae, and some bacteria to convert light energy into chemical energy, producing carbohydrates (sugars) and oxygen from water and carbon dioxide. This process is vital for life on Earth, as it produces the food that sustains most ecosystems and releases the oxygen that animals and humans need to breathe. What type of plants do you think use photosynthesis?"
- **Student asks about a specific bad grade:** "Why did I get the Nouns Quiz wrong?"
- **Your Response (Data-driven & Socratic):** "Let's look at that. I see you answered '[student's answer]' for the question '[question text]'. The correct answer was '[correct answer]'. Can you walk me through your thinking on why you chose your answer? What makes the correct answer a better fit?"
- **Student references uploaded file:** "Can you look at my essay from earlier?" or "What did I write about climate change?"
- **Your Response (File-aware):** Check the UPLOADED FILES CONTEXT, locate the relevant file, and respond based on its content: "Looking at your essay 'Climate Change Impact.docx' that you uploaded, I can see you focused on [specific content from file]. What made you choose this particular angle for your argument?"
- **Student uploads image:** "What's in this picture?" or "Can you help me understand this diagram?"
- **Your Response (Image-aware):** Analyze the visual content: "I can see this is a diagram showing the water cycle. I notice it has labels for evaporation, condensation, and precipitation. Which part of this process do you think is most important for understanding how weather patterns form?"
- **Student asks about an assignment:** Check the student assignment submission "Why did I get a 90/100 on my nouns assignment?
- **Your Response(Tailored to the assignment submission, not the assignment title. For example, an assignment can be named nouns but be about history)
- **Student asks about an assignment(Always check submission):** Why did I get a 14/20 on historical thinking?
- **Your Response(If a student asks about an assignment, make sure to always check the submission the student submitted, not just the feedback. Make sure to give feedback on their submssion, do not just look at the feedback.)

**QUIZ GENERATION (ONLY When Explicitly Requested):**
CRITICAL WARNING: DO NOT GENERATE QUIZZES UNLESS EXPLICITLY REQUESTED

ONLY generate quizzes when the student uses these EXACT phrases or similar explicit requests:
- "give me a quiz" / "quiz me" / "I want a quiz"
- "can I take a practice quiz" / "practice quiz"
- "test me on this" / "give me a test" / "practice test"
- "ask me questions" / "give me questions" / "practice questions"
- "can you quiz me" / "I want to practice with questions"

When a quiz IS explicitly requested, use this exact JSON format:
\`\`\`json
{
  "content": "Here's a practice quiz on [Topic] as you requested!",
  "quiz": {
    "title": "Practice Quiz: [Topic]",
    "questions": [
      {
        "question": "Question text based on a concept they struggled with?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_answer": "Correct Option"
      }
    ]
  }
}
\`\`\`

**DEFAULT RESPONSE STYLE:**
Your default response should ALWAYS be conversational, using Socratic questioning to guide learning.

NEVER suggest quizzes, offer to create them, or ask if the student wants practice questions unless they explicitly request it first.

If the student asks you to explain something, or asks you how to do something, or says that he doesn't get it, explain the topic thoroughly and give the answer, before asking follow up critical thinking questions.

When files are uploaded, analyze and discuss their content conversationally - do NOT offer quizzes based on the file content.

If a student ever asks for a quiz, just give it to them, do not ask them questions before giving the quiz.

Your goal is to be a powerful thinking partner through conversation and questions.

If a student ever asks about an assignment or quiz, always check their submission, don't just look at the teacher feedback. Make sure to give feedback on their submssion, do not just look at the feedback.
`;

        const MATH_RULES = `
BEFORE YOU WRITE YOUR RESPONSE, CHECK EVERY SINGLE WORD FOR MATH CONTENT.

**GOLDEN RULE:** If it's a number, variable, equation, or contains ANY mathematical notation → WRAP IT IN DOLLAR SIGNS

**YOU MUST FORMAT:**
✓ Single variables: $x$, $y$, $a$, $n$
✓ Numbers in equations: $3$, $42$, $2x$
✓ Simple expressions: $x + 1$, $3a^2$
✓ Complex expressions: $3a^2 + 3x^2 + 6ax$
✓ Fractions with backslashes: $\\\\frac{3}{ax}$, $\\\\frac{3x}{a^2x}$
✓ Parenthetical expressions: $\\\\left( \\\\frac{3}{ax} + \\\\frac{3x}{a^2x} \\\\right)$
✓ Exponents: $x^2$, $a^{2x}$, $e^{2\\\\pi i}$
✓ EVERYTHING with LaTeX backslashes: They NEED dollar signs!

**WRONG vs CORRECT - STUDY THESE:**
wrong "the expression ( \\frac{3}{ax} + \\frac{3x}{a^2x} + \\frac{7x}{x+a} )"
correct "the expression $\\\\left( \\\\frac{3}{ax} + \\\\frac{3x}{a^2x} + \\\\frac{7x}{x+a} \\\\right)$"

wrong "you wrote ( \\frac{3a^2 + 3x^2 + 6ax + 7a^2x^2}{a^2x(x+a)} )"
correct "you wrote $\\\\left( \\\\frac{3a^2 + 3x^2 + 6ax + 7a^2x^2}{a^2x(x+a)} \\\\right)$"

wrong "The denominator is a^2x(x+a)"
correct "The denominator is $a^2x(x+a)$"

wrong "3a^2 + 3x^2"
correct "$3a^2 + 3x^2$"

wrong "In your final expression, you wrote ( \\frac{3a^2 + 3x^2}"
correct "In your final expression, you wrote $\\\\left( \\\\frac{3a^2 + 3x^2} \\\\right.$"

**SPECIAL ATTENTION FOR IMAGES:**
When analyzing uploaded images containing math:
- Extract the mathematical expressions you see
- IMMEDIATELY wrap them in dollar signs when referencing them
- Use proper LaTeX formatting with double backslashes
- Example: If image shows "x²+1", write it as "$x^2 + 1$" in your response

**LaTeX Commands (DOUBLE backslashes required):**
- $\\\\frac{num}{den}$ for fractions
- $\\\\left( ... \\\\right)$ for parentheses
- $\\\\sqrt{x}$ for square roots
- $x^{power}$ for exponents
- $x_{subscript}$ for subscripts

TRIPLE-CHECK YOUR RESPONSE: Before finalizing, scan for ANY mathematical notation and ensure it's wrapped in $ or $$.

Please respond to the student's latest message, maintaining full conversation context and file access.`;

        let fullPrompt = "";
        
        // Helper to format history
        const formatHistory = (msgs) => {
             return msgs
                .filter(msg => msg.role !== 'system')
                .map(msg => {
                    const role = msg.role === 'assistant' ? 'Tutor' : 'Student';
                    let content = msg.content;
                    if (msg.fileInfos && msg.fileInfos.length > 0) {
                        content += `\n[Files attached: ${msg.fileInfos.map(f => `${f.name} (${f.type})`).join(', ')}]`;
                        // Note: Backend might not have extracted content if not passed in fileInfos
                        // The frontend passes fileInfos which includes extractedContent
                        msg.fileInfos.forEach(fileInfo => {
                             if (fileInfo.extractedContent && !fileInfo.error) {
                                 const truncatedContent = fileInfo.extractedContent.length > 1500 
                                     ? fileInfo.extractedContent.substring(0, 1500) + '...[truncated]'
                                     : fileInfo.extractedContent;
                                 content += `\nFile content from ${fileInfo.name}: ${truncatedContent}`;
                             }
                        });
                    }
                    return `${role}: ${content}`;
                })
                .join('\n\n');
        };

        const formattedHistory = formatHistory(conversationHistory);

        // Helper to create uploaded files context
        const createUploadedFilesContext = (files) => {
            if (!files || files.length === 0) return '';
            return files.map(file => {
                let fileContext = `- File: ${file.name} (${file.type || 'unknown type'})`;
                fileContext += `\n  Upload ID: ${file.id}`;
                fileContext += `\n  Uploaded: ${new Date(file.uploadedAt).toLocaleString()}`;
                if (file.error) {
                    fileContext += `\n  Status: Content extraction failed`;
                } else if (file.extractedContent) {
                    const contentPreview = file.extractedContent.length > 3000 
                        ? file.extractedContent.substring(0, 3000) + '...[truncated - full content available upon request]'
                        : file.extractedContent;
                    fileContext += `\n  Content: ${contentPreview}`;
                }
                return fileContext;
            }).join('\n\n');
        };

        if (isPersonalizedMode) {
            const uploadedFilesContext = createUploadedFilesContext(uploadedFiles);
            fullPrompt = `${tutorSystemPrompt}

UPLOADED FILES CONTEXT:
${uploadedFilesContext || 'No files have been uploaded yet.'}

CONVERSATION HISTORY:
${formattedHistory}

INSTRUCTIONS FOR FILE REFERENCES:
- You have access to all uploaded files throughout this entire conversation
- When a student references "the file I uploaded" or asks about file content, refer to the UPLOADED FILES CONTEXT above
- If multiple files are available and the reference is ambiguous, ask for clarification
- Always prioritize the most recently uploaded file when references are unclear
- You can analyze, summarize, or answer questions about any uploaded file content at any time

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
        } else {
            const basicPrompt = "You are a helpful, friendly AI assistant. You can answer general questions, help with homework, and provide explanations. You DO NOT have access to the student's specific assignments, quizzes, or files. If the user asks about them, politely explain that you cannot access their personal data in this mode.";
            
            fullPrompt = `${basicPrompt}

CONVERSATION HISTORY:
${formattedHistory}

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
        }

        const allFileUrls = isPersonalizedMode ? uploadedFiles
            .filter(file => file.file_url && !file.error)
            .map(file => file.file_url) : [];
        
        // 4. Call AI Tutor
        const response = await unifiedInvokeAI(base44, {
            prompt: fullPrompt,
            file_urls: allFileUrls.length > 0 ? allFileUrls : undefined,
            response_json_schema: {
                type: "object",
                properties: {
                    content: { type: "string" },
                    quiz: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        question: { type: "string" },
                                        options: { type: "array", items: { type: "string" } },
                                        correct_answer: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                },
                required: ["content"]
            }
        });

        let finalContent = response.content;
        let finalQuiz = response.quiz;

        // 5. Handle Translation (if needed)
        if (language !== 'EN') {
            const langNames = { ES: 'Spanish', ZH: 'Chinese', KO: 'Korean', FR: 'French' };
            const targetLang = langNames[language] || 'English';
            
            const translationPrompt = `Translate the following AI tutor response to ${targetLang}. Keep all mathematical expressions (anything in $ or $$ delimiters) EXACTLY as they are - do not translate or modify them. Only translate the natural language text around them.

Response to translate:
${response.content}`;

            const translatedResponse = await unifiedInvokeAI(base44, { prompt: translationPrompt });
            finalContent = translatedResponse;

            if (response.quiz && Array.isArray(response.quiz.questions) && response.quiz.questions.length > 0) {
                const quizTranslationPrompt = `Translate the following quiz to ${targetLang}. Keep all mathematical expressions (anything in $ or $$ delimiters) EXACTLY as they are. Return the result as a valid JSON object with the same structure.

Quiz to translate:
${JSON.stringify(response.quiz)}`;

                const translatedQuiz = await unifiedInvokeAI(base44, { 
                    prompt: quizTranslationPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        question: { type: "string" },
                                        options: { type: "array", items: { type: "string" } },
                                        correct_answer: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                });
                finalQuiz = translatedQuiz;
            }
        }

        // 6. Save AI Response to DB
        try {
            const enrollments = await base44.entities.ClassEnrollment.filter({ student_id: user.id });
             const savePromises = enrollments.map(enrollment => 
                 base44.entities.AssignmentComment.create({
                    assignment_id: null, 
                    student_id: user.id,
                    user_id: "ai_tutor", 
                    user_name: "AI Tutor",
                    user_role: "teacher", 
                    content: finalContent,
                    is_ai_tutor_message: true,
                    class_id: enrollment.class_id,
                    student_email: user.email,
                    is_flagged: false, 
                    flag_reason: "",
                })
            );
            await Promise.all(savePromises);
        } catch (error) {
             console.error('Failed to save AI Tutor response:', error);
        }

        return Response.json({
            content: finalContent,
            quiz: finalQuiz
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
Deno.serve(chatWithAce);