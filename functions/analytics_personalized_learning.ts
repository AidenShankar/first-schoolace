import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Fetch comments
        // Note: limit 10000 to get enough data. If usage is huge, we might need pagination, but for now 10000 should be enough for "last week" if it's not super heavy.
        // We filter by created_date explicitly if possible, or fetch and filter.
        // SDK supports filter.
        
        // SUPER DEBUG: List everything
        const allComments = await base44.asServiceRole.entities.AssignmentComment.list('-created_date', 100);
        console.error(`TOTAL COMMENTS IN DB: ${allComments.length}`);
        if (allComments.length > 0) {
            console.error("SAMPLE COMMENT:", JSON.stringify(allComments[0]));
        }

        const comments = allComments.filter(c => c.is_ai_tutor_message === true);
        console.error(`FILTERED IN JS (is_ai_tutor_message=true): ${comments.length}`);
        
        const recentComments = comments.filter(c => new Date(c.created_date) >= sevenDaysAgo);
        console.error(`FILTERED RECENT: ${recentComments.length}`);
        
        const commentsToProcess = recentComments;
        
        const userSessions = {};
        
        // Group by student_id
        for (const comment of commentsToProcess) {
            const studentId = comment.student_id;
            if (!studentId) continue;
            
            if (!userSessions[studentId]) {
                userSessions[studentId] = [];
            }
            userSessions[studentId].push(new Date(comment.created_date));
        }
        
        const uniqueUsers = Object.keys(userSessions).length;
        let totalDurationAllUsers = 0;
        
        // Calculate duration for each user
        for (const studentId in userSessions) {
            const timestamps = userSessions[studentId].sort((a, b) => a - b);
            let userDuration = 0;
            
            if (timestamps.length === 0) continue;
            
            let sessionStart = timestamps[0];
            let lastTime = timestamps[0];
            
            for (let i = 1; i < timestamps.length; i++) {
                const currentTime = timestamps[i];
                const gapMinutes = (currentTime - lastTime) / (1000 * 60);
                
                if (gapMinutes > 30) {
                    // End previous session
                    let sessionLength = (lastTime - sessionStart) / (1000 * 60); // minutes
                    if (sessionLength < 1) sessionLength = 1; // Minimum 1 minute per session
                    userDuration += sessionLength;
                    
                    // Start new session
                    sessionStart = currentTime;
                }
                lastTime = currentTime;
            }
            
            // Add last session
            let lastSessionLength = (lastTime - sessionStart) / (1000 * 60);
            if (lastSessionLength < 1) lastSessionLength = 1;
            userDuration += lastSessionLength;
            
            totalDurationAllUsers += userDuration;
        }
        
        const averageDuration = uniqueUsers > 0 ? totalDurationAllUsers / uniqueUsers : 0;
        
        return Response.json({
            unique_users: uniqueUsers,
            average_duration_minutes: Math.round(averageDuration * 10) / 10,
            debug: {
                total_comments_in_db: allComments.length,
                filtered_ai_tutor: comments.length,
                filtered_recent: recentComments.length,
                sample_comment: allComments.length > 0 ? allComments[0] : null
            }
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});