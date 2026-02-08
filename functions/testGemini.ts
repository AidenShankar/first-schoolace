import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

async function unifiedInvokeAI(base44, { prompt, file_urls, response_json_schema }) {
    const aiProvider = Deno.env.get("AI_PROVIDER");
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");

    console.log(`[TestGemini] Provider: ${aiProvider}, HasKey: ${!!googleApiKey}`);

    if (aiProvider === 'gemini' && googleApiKey) {
        try {
            console.log(`[UnifiedInvokeAI] Attempting to use Gemini model: gemini-2.0-flash-exp`);
            const genAI = new GoogleGenerativeAI(googleApiKey);
            // LIST MODELS TEST
            /*
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
                // ...
            });
            */
           // Try to find if the model exists in the list (this is a hack to debug)
           // The SDK doesn't expose listModels directly on genAI instance usually, 
           // it's usually via a ModelService or similar, which might not be in this simple SDK usage.
           
           // Instead, let's try to force v1alpha which usually has the experimental models
           const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
                apiVersion: "v1alpha", // TRY ALPHA
                generationConfig: {
                    responseMimeType: response_json_schema ? "application/json" : "text/plain",
                    responseSchema: response_json_schema
                }
            });
            
            const parts = [{ text: prompt }];
            const result = await model.generateContent(parts);
            return result.response.text();

        } catch (e) {
            console.error("[UnifiedInvokeAI] Gemini API Failed:", e);
            console.log("[UnifiedInvokeAI] Falling back to standard InvokeLLM...");
            return `Gemini Failed: ${e.message}`;
        }
    }
    return "Gemini skipped (env vars not matching)";
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Skip auth for this test
        
        const { prompt = "Hello from test" } = await req.json().catch(() => ({}));
        
        const result = await unifiedInvokeAI(base44, { prompt });
        
        return Response.json({ result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});