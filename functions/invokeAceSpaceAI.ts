import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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
                const cleanText = text.replace(/```json\n|\n```/g, "").trim();
                return JSON.parse(cleanText);
            }
            return text;

        } catch (e) {
            console.error("Gemini API Error:", e);
            console.log("Falling back to standard InvokeLLM...");
        }
    }
    return await base44.integrations.Core.InvokeLLM({ prompt, file_urls, response_json_schema });
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Basic auth check
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { space_id, user_message, message_id, language } = await req.json();

        if (!space_id || !user_message || !message_id) {
             return Response.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Verify user is a member of the space
        const membership = await base44.entities.AceSpaceMember.filter({
            space_id: space_id,
            student_id: user.id
        });

        if (membership.length === 0) {
            return Response.json({ error: 'You are not a member of this space' }, { status: 403 });
        }
        
        // 1. Fetch recent context from the space (last 10 messages)
        const recentMessages = await base44.entities.AceSpaceMessage.filter(
            { space_id: space_id }, 
            "-created_date", 
            10 
        );

        // Fetch ALL files in the space to give AI full context of shared resources
        const allFiles = await base44.entities.AceSpaceMessage.filter({
            space_id: space_id,
            type: 'file'
        });
        
        // Format file list for the prompt
        const fileContext = allFiles.length > 0 
            ? "Here is a list of ALL files shared in this space (name and url). You can refer to them if asked:\n" + 
              allFiles.map(f => `- [${f.file_name}](${f.file_url}) (uploaded by ${f.user_name})`).join('\n')
            : "No files have been shared in this space yet.";
        
        // Extract file URLs for the integration to process
        const fileUrls = allFiles.map(f => f.file_url).filter(url => url);

        // Sort chronologically for the LLM
        recentMessages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

        const conversationHistory = recentMessages.map(msg => ({
            role: msg.type === 'ai_response' ? 'assistant' : 'user',
            content: `${msg.user_name}: ${msg.content}`
        }));

        // 2. Invoke LLM
        const systemPrompt = `You are Ace AI, a helpful and collaborative AI assistant in a student group chat called "Ace Spaces". 
        Students share files, discuss projects, and ask for help. 
        Your goal is to assist the group, summarize content if asked, and facilitate learning.

        ${fileContext}

        Keep responses concise, friendly, and suitable for a chat interface.
        Current user asking: ${user.full_name}.

        CRITICAL INSTRUCTION: You MUST respond in ${language || 'English'}.
        Even if the conversation history is in other languages, your response to THIS interaction must be in ${language || 'English'}.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
        ];

        const response = await unifiedInvokeAI(base44, {
            prompt: JSON.stringify(messages),
            file_urls: fileUrls
        });

        const aiResponseContent = typeof response === 'string' ? response : JSON.stringify(response);

        // 3. Create AI Response Message
        await base44.asServiceRole.entities.AceSpaceMessage.create({
            space_id: space_id,
            user_id: null, // System/AI
            user_name: "Ace AI",
            content: aiResponseContent,
            type: "ai_response",
            related_message_id: message_id,
            created_date: new Date().toISOString()
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error("AceSpace AI Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});