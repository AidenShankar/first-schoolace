import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

const STANDARDS_DATA = {
  "NGSS (Science)": {
    "MS-LS1": [
      { code: "MS-LS1-1", description: "Conduct an investigation to provide evidence that living things are made of cells; either one cell or many different numbers and types of cells." },
      { code: "MS-LS1-2", description: "Develop and use a model to describe the function of a cell as a whole and ways parts of cells contribute to the function." },
      { code: "MS-LS1-3", description: "Use argument supported by evidence for how the body is a system of interacting subsystems composed of groups of cells." },
      { code: "MS-LS1-4", description: "Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively." },
      { code: "MS-LS1-5", description: "Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms." },
      { code: "MS-LS1-6", description: "Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms." },
      { code: "MS-LS1-7", description: "Develop a model to describe how food is rearranged through chemical reactions forming new molecules that support growth and/or release energy as this matter moves through an organism." },
      { code: "MS-LS1-8", description: "Gather and synthesize information that sensory receptors respond to stimuli by sending messages to the brain for immediate behavior or storage as memories." }
    ],
    "MS-LS2": [
      { code: "MS-LS2-1", description: "Analyze and interpret data to provide evidence for the effects of resource availability on organisms and populations of organisms in an ecosystem." },
      { code: "MS-LS2-2", description: "Construct an explanation that predicts patterns of interactions among organisms across multiple ecosystems." },
      { code: "MS-LS2-3", description: "Develop a model to describe the cycling of matter and flow of energy among living and nonliving parts of an ecosystem." },
      { code: "MS-LS2-4", description: "Construct an argument supported by empirical evidence that changes to physical or biological components of an ecosystem affect populations." },
      { code: "MS-LS2-5", description: "Evaluate competing design solutions for maintaining biodiversity and ecosystem services." }
    ],
    "MS-LS3": [
      { code: "MS-LS3-1", description: "Develop and use a model to describe why structural changes to genes (mutations) located on chromosomes may affect proteins and may result in harmful, beneficial, or neutral effects to the structure and function of the organism." },
      { code: "MS-LS3-2", description: "Develop and use a model to describe why asexual reproduction results in offspring with identical genetic information and sexual reproduction results in offspring with genetic variation." }
    ],
    "MS-LS4": [
      { code: "MS-LS4-1", description: "Analyze and interpret data for patterns in the fossil record that document the existence, diversity, extinction, and change of life forms throughout the history of life on Earth under the assumption that natural laws operate today as in the past." },
      { code: "MS-LS4-2", description: "Apply scientific ideas to construct an explanation for the anatomical similarities and differences among modern organisms and between modern and fossil organisms to infer evolutionary relationships." },
      { code: "MS-LS4-3", description: "Analyze displays of pictorial data to compare patterns of similarities in the embryological development across multiple species to identify relationships not evident in the fully formed anatomy." },
      { code: "MS-LS4-4", description: "Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals’ probability of surviving and reproducing in a specific environment." },
      { code: "MS-LS4-5", description: "Gather and synthesize information about the technologies that have changed the way humans influence the inheritance of desired traits in organisms." },
      { code: "MS-LS4-6", description: "Use mathematical representations to support explanations of how natural selection may lead to increases and decreases of specific traits in populations over time." }
    ]
  }
};

const getStandardDescription = (standardSet, code) => {
  const set = STANDARDS_DATA[standardSet];
  if (!set) return null;
  
  // Search through all categories (MS-LS1, MS-LS2, etc)
  for (const category in set) {
    const found = set[category].find(s => s.code === code);
    if (found) return found.description;
  }
  return null;
};

// Core grading logic function
async function gradeSingleSubmission(client, submissionId) {
    // Fetch submission
    const submissions = await client.entities.Submission.filter({ id: submissionId });
    if (submissions.length === 0) {
         throw new Error(`Submission not found: ${submissionId}`);
    }
    const submission = submissions[0];
    console.log(`Processing submission: ${submission.id} for assignment: ${submission.assignment_id}`);

    // Loop protection: Skip if already graded or in a terminal state
    const terminalStatuses = ["ai_graded", "manual_review", "graded", "released", "error"];
    if (terminalStatuses.includes(submission.grading_status)) {
        console.log(`Skipping grading for terminal status: ${submission.grading_status}`);
        return { skipped: true, reason: `Status is ${submission.grading_status}` };
    }

    // Fetch assignment
    const assignments = await client.entities.Assignment.filter({ id: submission.assignment_id });
    if (assignments.length === 0) {
        throw new Error(`Assignment not found: ${submission.assignment_id}`);
    }
    const assignment = assignments[0];

    if (!assignment.use_ai_grading) {
        console.log("AI grading disabled for this assignment.");
        return { skipped: true, reason: "AI grading disabled" };
    }

    // Update status to ai_grading (if not already set)
    if (submission.grading_status !== "ai_grading") {
        await client.entities.Submission.update(submission.id, { grading_status: "ai_grading" });
    }

    // Grading Logic
    let fileContent = 'File content could not be extracted.';
    
    // Handle text submissions differently
    if (submission.submission_type === "text" && submission.text_content) {
        fileContent = submission.text_content;
    } else {
        // Handle non-gradable file types
        const fileName = (submission.file_name || "").toLowerCase();
        if (fileName.endsWith('.mp3') || fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.m4a')) {
             await client.entities.Submission.update(submission.id, {
                grading_status: "manual_review",
                ai_feedback: "This is a video/audio file that requires manual review by your teacher."
            });
            console.log("Marked as manual_review (media file)");
            return { skipped: true, reason: "Marked for manual review (media file)" };
        }

        if (!submission.file_url || submission.file_url.startsWith('blob:')) {
             await client.entities.Submission.update(submission.id, {
                grading_status: "manual_review",
                ai_feedback: "File processing error. This submission requires manual review by your teacher."
            });
            console.log("Marked as manual_review (invalid file url)");
            return { skipped: true, reason: "Marked for manual review (invalid file url)" };
        }

        try {
            console.log(`Extracting data from file: ${submission.file_url}`);
            const extraction = await client.integrations.Core.ExtractDataFromUploadedFile({ 
                file_url: submission.file_url, 
                json_schema: { type: 'object', properties: { content: { type: 'string' } } } 
            });
            if (extraction.status === 'success' && extraction.output?.content) {
                fileContent = extraction.output.content;
                console.log("File extraction successful");
            } else {
                console.warn("File extraction returned no content or failed:", extraction);
            }
        } catch (e) { 
            console.error("File extraction failed:", e);
            await client.entities.Submission.update(submission.id, {
                grading_status: "manual_review",
                ai_feedback: "This file format requires manual review by your teacher."
            });
            return { skipped: true, reason: "Marked for manual review (extraction failed)" };
        }
    }

    let answerKeyContent = 'No answer key provided.';
    if (assignment.answer_key_url && !assignment.answer_key_url.startsWith('blob:')) {
        try {
            const keyExtraction = await client.integrations.Core.ExtractDataFromUploadedFile({ 
                file_url: assignment.answer_key_url, 
                json_schema: { type: 'object', properties: { content: { type: 'string' } } } 
            } );
            if (keyExtraction.status === 'success' && keyExtraction.output?.content) {
                answerKeyContent = keyExtraction.output.content;
            }
        } catch (e) { 
            console.error("Answer key extraction failed:", e);
        }
    }

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

${assignment.grading_standards?.selected_codes?.length > 0 ? `
**GRADING STANDARDS (NGSS):**
The teacher has selected specific standards to grade against. You have access to the full description of these standards below. You must evaluate the student's mastery of EACH of these specific standards:
${assignment.grading_standards.selected_codes.map(code => {
    const desc = getStandardDescription(assignment.grading_standards.standard_set, code) || "";
    return `- ${code} (${desc})`;
}).join('\n')}

**MANDATORY FEEDBACK REQUIREMENT:**
In your feedback response, you MUST explicitly address each selected standard individually.
For every standard listed above, type the standard code and specific feedback on how the student met or did not meet that specific standard.

Example format:
"Regarding [Standard Code]: You successfully demonstrated..."
"Regarding [Standard Code]: You missed the key concept of..."
` : ''}

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

    console.log("Invoking LLM for grading...");
    const result = await client.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                grade: { type: "number" },
                feedback: { type: "string" }
            },
            required: ["grade", "feedback"]
        }
    });
    console.log("LLM grading complete. Result:", JSON.stringify(result));

    await client.entities.Submission.update(submission.id, {
        ai_grade: result.grade,
        ai_feedback: result.feedback,
        grading_status: "ai_graded"
    });
    console.log("Submission updated with grade.");

    return { success: true, grade: result.grade, feedback: result.feedback };
}


Deno.serve(async (req) => {
    try {
        console.log("gradeSubmission function started");
        const base44 = createClientFromRequest(req);
        const client = base44.asServiceRole;
        
        let payload = {};
        try {
            payload = await req.json();
            console.log("Payload received:", JSON.stringify(payload));
        } catch (e) {
            console.error("Failed to parse payload:", e);
        }

        const { event } = payload;
        const submissionId = event?.entity_id || payload.submission_id;

        // MODE 1: Single Submission (Event or direct call)
        if (submissionId) {
            try {
                const result = await gradeSingleSubmission(client, submissionId);
                return Response.json(result);
            } catch (error) {
                console.error("Single grading failed:", error);
                
                // Try to update status if failed
                try {
                     await client.entities.Submission.update(submissionId, { 
                        grading_status: "manual_review", 
                        ai_feedback: `AI grading failed: ${error.message}`
                    });
                } catch(e) {}
                
                return Response.json({ error: error.message }, { status: 500 });
            }
        }

        // MODE 2: Bulk Pickup (Scheduled)
        // Find up to 5 oldest submissions stuck in 'ai_grading'
        // Sorting by created_date ASC to process oldest first
        const stuckSubmissions = await client.entities.Submission.filter({
            grading_status: "ai_grading"
        }, "created_date", 5);

        console.log(`Found ${stuckSubmissions.length} stuck submissions`);
        
        const results = [];
        for (const sub of stuckSubmissions) {
            try {
                const res = await gradeSingleSubmission(client, sub.id);
                results.push({ id: sub.id, status: 'success', result: res });
            } catch (e) {
                console.error(`Error processing stuck submission ${sub.id}:`, e);
                
                 // Update status to manual_review to prevent infinite retries of broken items
                try {
                     await client.entities.Submission.update(sub.id, { 
                        grading_status: "manual_review", 
                        ai_feedback: `AI grading failed (bulk): ${e.message}`
                    });
                } catch(updateErr) {}
                
                results.push({ id: sub.id, status: 'error', error: e.message });
            }
        }

        return Response.json({ message: "Bulk processing complete", results });

    } catch (error) {
        console.error("Handler error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});