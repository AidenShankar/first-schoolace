import { createClientFromRequest } from 'npm:@base44/sdk@0.8.11';

export default Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Calculate date 2 weeks ago
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        // Fetch all comments (we might need pagination if there are many, but let's try fetching a large batch)
        // SDK list/filter usually has a limit. Let's try to fetch enough.
        // Or we can just fetch recent ones using sort.
        
        const comments = await base44.asServiceRole.entities.AssignmentComment.filter({
            is_ai_tutor_message: true
        }, "-created_date", 1000); // Fetch 1000 most recent AI tutor messages
        
        const recentStats = comments.filter(c => {
            const createdDate = new Date(c.created_date);
            return createdDate >= twoWeeksAgo && c.user_id !== 'ai_tutor';
        });

        return Response.json({
            count: recentStats.length,
            total_fetched: comments.length,
            since: twoWeeksAgo.toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});