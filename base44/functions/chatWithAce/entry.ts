import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function chatWithAce(req) {
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
        } = await req.json();

        // 1. Moderation — fire-and-forget, do NOT await (saves ~1-2s per request)
        const moderationAndSave = async () => {
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
                
                const moderationResult = await base44.integrations.Core.InvokeLLM({
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

                const isFlagged = moderationResult?.is_flagged || false;
                const flagReason = moderationResult?.reason || "";

                const enrollments = await base44.entities.ClassEnrollment.filter({ student_id: user.id });
                await Promise.all(enrollments.map(enrollment => 
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
                ));
            } catch (e) {
                console.error('Background moderation/save failed:', e);
            }
        };

        // Fire and forget — don't block the main response
        moderationAndSave();

        // 2. Construct System Prompt
        const modeInstructions = learningMode
            ? `**LEARNING MODE ACTIVE:** If the student asks for an answer of a question, show them how to do the question step by step, along with asking critical thinking questions at the end. NEVER provide direct answers or final solutions. Always guide the student step-by-step with questions and hints. Make them do the calculations and work themselves.`
            : `**SOLUTION MODE ACTIVE:** When explaining concepts, show all steps clearly AND provide the final answer. Be thorough in your explanations while still encouraging understanding.`;

        const tutorSystemPrompt = `
You are 'Ace', a supportive and expert AI tutor for ${user.full_name}.

${modeInstructions}

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
5. **IMAGE RECOGNITION:** For image files (JPG, PNG, etc.), you can recognize and describe visual content.
6. **MULTI-FILE ANALYSIS:** You can compare, contrast, and analyze multiple uploaded files together when requested.

**CORE DIRECTIVES - NON-NEGOTIABLE:**
1.  **BALANCED TEACHING:** For simple, direct questions (e.g. "what is 3+3?", "what's the capital of France?", "what does X mean?"), give the direct answer first, then optionally add a brief follow-up to deepen understanding.
2.  **DO NOT GIVE INACCURATE FEEDBACK OR ANSWERS:** If you are teaching the student and they get something wrong, correct them clearly. Do not hallucinate answers or make things up.
3.  **EXPLAINING:** If the student asks to explain something or doesn't understand, thoroughly explain it with the answer, then ask follow up questions to promote critical thinking.
4.  **CONVERSATION CONTINUITY:** Always consider the full conversation history when responding. Reference previous topics discussed and build upon earlier explanations.
5.  **FILE MEMORY:** Remember and reference uploaded files throughout the conversation.
6.  **GRADING:** If a student asks if an answer is correct, state clearly if it's right or wrong, explain why, and show the correct approach.
7.  **PRACTICE:** If a student asks for practice problems, give them in text form (no interactive quizzes).

**DEFAULT RESPONSE STYLE:**
Your default response should ALWAYS be conversational.
Your goal is to be a powerful thinking partner through conversation and questions.
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

**LaTeX Commands (DOUBLE backslashes required):**
- $\\\\frac{num}{den}$ for fractions
- $\\\\left( ... \\\\right)$ for parentheses
- $\\\\sqrt{x}$ for square roots
- $x^{power}$ for exponents
- $x_{subscript}$ for subscripts

TRIPLE-CHECK YOUR RESPONSE: Before finalizing, scan for ANY mathematical notation and ensure it's wrapped in $ or $$.

Please respond to the student's latest message, maintaining full conversation context and file access.`;

        const formatHistory = (msgs) => {
            return msgs
                .filter(msg => msg.role !== 'system')
                .map(msg => {
                    const role = msg.role === 'assistant' ? 'Tutor' : 'Student';
                    let content = msg.content;
                    if (msg.fileInfos && msg.fileInfos.length > 0) {
                        content += `\n[Files attached: ${msg.fileInfos.map(f => `${f.name} (${f.type})`).join(', ')}]`;
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

        const formattedHistory = formatHistory(conversationHistory);

        let fullPrompt = "";

        if (isPersonalizedMode) {
            const uploadedFilesContext = createUploadedFilesContext(uploadedFiles);
            fullPrompt = `${tutorSystemPrompt}

UPLOADED FILES CONTEXT:
${uploadedFilesContext || 'No files have been uploaded yet.'}

CONVERSATION HISTORY:
${formattedHistory}

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
        } else {
            const basicPrompt = "You are 'Ace', a helpful, friendly AI tutor. You can answer general questions, help with homework, and provide explanations. Be conversational and encouraging. Use Socratic questioning to guide students to answers rather than just giving them.";
            
            fullPrompt = `${basicPrompt}

CONVERSATION HISTORY:
${formattedHistory}

⚠️⚠️⚠️ CRITICAL MATH FORMATTING RULE - ABSOLUTELY MANDATORY ⚠️⚠️⚠️
${MATH_RULES}`;
        }

        const allFileUrls = isPersonalizedMode ? uploadedFiles
            .filter(file => file.file_url && !file.error)
            .map(file => file.file_url) : [];
        
        // 3. Call AI Tutor — simple string response (no JSON schema = faster)
        const finalContent = await base44.integrations.Core.InvokeLLM({
            prompt: fullPrompt,
            file_urls: allFileUrls.length > 0 ? allFileUrls : undefined,
        });

        // QUIZ GENERATION CODE — PRESERVED FOR FUTURE RESTORATION
        // To re-enable: change InvokeLLM above to use response_json_schema below,
        // change finalContent to response.content, restore finalQuiz = response.quiz,
        // and restore the quiz return field.
        //
        // response_json_schema: {
        //     type: "object",
        //     properties: {
        //         content: { type: "string" },
        //         quiz: {
        //             type: "object",
        //             properties: {
        //                 title: { type: "string" },
        //                 questions: {
        //                     type: "array",
        //                     items: {
        //                         type: "object",
        //                         properties: {
        //                             question: { type: "string" },
        //                             options: { type: "array", items: { type: "string" } },
        //                             correct_answer: { type: "string" }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     required: ["content"]
        // }

        // 4. Handle Translation (if needed)
        let translatedContent = finalContent;
        if (language !== 'EN') {
            const langNames = { ES: 'Spanish', ZH: 'Chinese', KO: 'Korean', FR: 'French' };
            const targetLang = langNames[language] || 'English';
            
            const translationPrompt = `Translate the following AI tutor response to ${targetLang}. Keep all mathematical expressions (anything in $ or $$ delimiters) EXACTLY as they are - do not translate or modify them. Only translate the natural language text around them.

Response to translate:
${finalContent}`;

            translatedContent = await base44.integrations.Core.InvokeLLM({ prompt: translationPrompt });
        }

        // 5. Save AI Response to DB — fire-and-forget
        (async () => {
            try {
                const enrollments = await base44.entities.ClassEnrollment.filter({ student_id: user.id });
                await Promise.all(enrollments.map(enrollment => 
                    base44.entities.AssignmentComment.create({
                        assignment_id: null, 
                        student_id: user.id,
                        user_id: "ai_tutor", 
                        user_name: "AI Tutor",
                        user_role: "teacher", 
                        content: translatedContent,
                        is_ai_tutor_message: true,
                        class_id: enrollment.class_id,
                        student_email: user.email,
                        is_flagged: false, 
                        flag_reason: "",
                    })
                ));
            } catch (error) {
                console.error('Failed to save AI Tutor response:', error);
            }
        })();

        return Response.json({ content: translatedContent });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

Deno.serve(chatWithAce);