import { createClientFromRequest } from 'npm:@base44/sdk@0.8.11';

export default Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const comments = await base44.asServiceRole.entities.AssignmentComment.filter({
            is_ai_tutor_message: true
        }, "-created_date", 1000); 
        
        const recentStats = comments.filter(c => {
            const createdDate = new Date(c.created_date);
            return createdDate >= twoWeeksAgo && c.user_id !== 'ai_tutor';
        });

        return Response.json({
            count: recentStats.length,
            total_fetched: comments.length,
            oldest_fetched: comments.length > 0 ? comments[comments.length - 1].created_date : null
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});