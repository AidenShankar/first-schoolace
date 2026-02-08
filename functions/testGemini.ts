import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

Deno.serve(async (req) => {
    try {
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        
        // List models manually
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleApiKey}`);
        const data = await response.json();
        
        // Filter for names containing "gemini"
        const models = data.models ? data.models.map(m => m.name) : [];
        const geminiModels = models.filter(n => n.includes("gemini"));

        return Response.json({ models: geminiModels, full: data });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});