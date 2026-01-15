import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, subject, max_points } = await req.json();

        if (!description) {
            return Response.json({ error: 'Description is required' }, { status: 400 });
        }

        const prompt = `
        You are an expert educational consultant.
        Create detailed grading instructions for an assignment.
        
        Assignment Details:
        Title: ${title}
        Subject: ${subject}
        Max Points: ${max_points}
        Description: ${description}
        
        Please provide:
        1. A detailed instruction for grading.
        2. A clear rubric with point allocations.
        3. Key points to look for in student submissions.
        4. Specific grading criteria.
        
        Format the output as clear, plain text paragraphs and simple lists.
        Do NOT use markdown tables, headers (###), or complex visual formatting.
        The goal is to produce a dense, easy-to-read block of text that serves as a system instruction for an AI grader.
        Do not include any conversational filler (like "Here are the instructions..."). Just the content.
        `;

        // Use the SDK to call the integration
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
        });

        return Response.json({ instructions: response });

    } catch (error) {
        console.error("Error generating instructions:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});