import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Buffer } from 'node:buffer';
import pdf from 'npm:pdf-parse@1.1.1';
import mammoth from 'npm:mammoth@1.6.0';

async function extractTextFromFile(fileUrl, fileName) {
    if (!fileUrl || !fileName) return null;
    
    try {
        const lowerName = fileName.toLowerCase();
        const isPdf = lowerName.endsWith('.pdf');
        const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');
        const isTxt = lowerName.endsWith('.txt');
        
        if (!isPdf && !isDocx && !isTxt) return null;

        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) return null;
        
        const arrayBuffer = await fileRes.arrayBuffer();
        
        // Check size - if > 20MB, return specific error or null to signal manual review
        if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
             throw new Error("File too large for AI grading (max 20MB)");
        }

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
        
        // Truncate if too long (approx 150k chars)
        if (extractedText.length > 150000) {
            extractedText = extractedText.substring(0, 150000) + "\n...[Content Truncated]...";
        }
        
        return extractedText;

    } catch (e) {
        console.error(`Extraction failed for ${fileName}:`, e);
        throw e; // Re-throw to handle specific errors like size
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { submission, assignment } = await req.json();

        // 1. Extract Student Submission Content
        let fileContent = 'File content could not be extracted.';
        
        if (submission.submission_type === "text" && submission.text_content) {
            fileContent = submission.text_content;
        } else {
            const fileName = submission.file_name.toLowerCase();
            // Video/Audio check
            if (fileName.endsWith('.mp3') || fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.m4a')) {
                 return Response.json({ 
                    status: 'manual_review', 
                    reason: "This is a video/audio file that requires manual review by your teacher." 
                });
            }

            if (!submission.file_url || submission.file_url.startsWith('blob:')) {
                return Response.json({ 
                    status: 'manual_review', 
                    reason: "File processing error. This submission requires manual review." 
                });
            }

            try {
                const text = await extractTextFromFile(submission.file_url, submission.file_name);
                if (text) {
                    fileContent = text;
                } else {
                    // Could not extract text (maybe image or unsupported format)
                     return Response.json({ 
                        status: 'manual_review', 
                        reason: "This file format or content requires manual review." 
                    });
                }
            } catch (e) {
                if (e.message.includes("File too large")) {
                     return Response.json({ 
                        status: 'manual_review', 
                        reason: "File is larger than 20MB and requires manual review." 
                    });
                }
                // Fallback to manual review on extraction error
                 return Response.json({ 
                    status: 'manual_review', 
                    reason: "File content extraction failed. Manual review required." 
                });
            }
        }

        // 2. Extract Answer Key Content (if exists)
        let answerKeyContent = 'No answer key provided.';
        if (assignment.answer_key_url && !assignment.answer_key_url.startsWith('blob:')) {
             try {
                const keyText = await extractTextFromFile(assignment.answer_key_url, assignment.answer_key_filename || 'key.docx');
                if (keyText) answerKeyContent = keyText;
            } catch (e) {
                console.warn("Answer key extraction failed:", e);
            }
        }

        // 3. Construct Prompt
        const prompt = `
        You are an expert academic grader. Your task is to grade a student's work with absolute precision and accuracy based on a specific leniency level.

        **GRADING TASK CONTEXT:**
        - **Student's Name:** ${submission.student_name}
        - **Assignment Title:** ${assignment.title}
        - **Teacher's Instructions:** ${assignment.instructions}
        - **Maximum Points:** ${assignment.max_points}
        - **Grading Leniency:** ${assignment.leniency || 'Neutral'}. Interpret this as follows:
            - **Strict:** Be exacting. No partial credit unless explicitly stated in instructions. Minor errors are penalized. The final grade must precisely reflect the number of correct answers.
            - **Neutral:** Grade fairly based on the instructions. Award partial credit where it makes sense. The final grade should be a balanced reflection of the student's work.
            - **Lenient:** Focus on understanding and effort. Be generous with partial credit. Minor errors should not significantly impact the grade.

        - **Answer Key:** ${answerKeyContent}
        - **Student Submission:** ${fileContent}

        **CRITICAL RULES:**
        - **Address the student directly by their name, ${submission.student_name}, in your feedback.**
        - If a student's answer matches the correct answer, it is CORRECT. Never say an answer is wrong when it matches the correct answer.
        - Be precise in your calculations.
        - If you cannot clearly read the submission, state that clearly in your feedback.
        - Provide constructive feedback that helps the student learn.
        - **If the grade is lower than the maximum points (${assignment.max_points}) or less than 100%, you MUST explicitly state what was missing or incorrect to achieve full marks. Structure the feedback as "Good Feedback" (what they did well) followed by "Gap Feedback" (what was missing/wrong) to help them close the gap.**

        Output your response as JSON with:
        - grade: numerical score (0 to ${assignment.max_points})
        - feedback: detailed explanation of what was correct/incorrect, starting with the student's name (e.g., "${submission.student_name}, you did a great job on...").
        `;

        // 4. Invoke LLM
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    grade: { type: "number" },
                    feedback: { type: "string" }
                },
                required: ["grade", "feedback"]
            }
        });

        return Response.json({
            status: 'success',
            grade: llmResponse.grade,
            feedback: llmResponse.feedback
        });

    } catch (error) {
        console.error("Error in gradeSubmission:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});