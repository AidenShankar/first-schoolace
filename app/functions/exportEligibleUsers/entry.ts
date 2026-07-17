import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch ALL users in batches
        const allUsers = [];
        let skip = 0;
        const batchSize = 50;
        
        while (true) {
            const batch = await base44.asServiceRole.entities.User.list('created_date', batchSize, skip);
            if (!batch || batch.length === 0) break;
            allUsers.push(...batch);
            skip += batchSize;
            if (batch.length < batchSize) break;
        }

        // Log first user to understand structure
        if (allUsers.length > 0) {
            console.log("Sample user keys:", JSON.stringify(Object.keys(allUsers[0])));
            console.log("Sample user data:", JSON.stringify(allUsers[0]));
        }

        // Include all users with valid emails
        const eligible = allUsers.filter(u => {
            const email = u.email || '';
            // Basic email validation
            return email.includes('@') && email.includes('.');
        });

        // Build CSV
        const csvHeader = 'Email,Full Name,Role,App Role,Created Date,Has Subscription';
        const csvRows = eligible.map(u => {
            const email = (u.email || '').replace(/,/g, ' ');
            const name = (u.full_name || '').replace(/,/g, ' ');
            const role = u.role || '';
            const appRole = u.app_role || u.data?.app_role || '';
            const created = u.created_date || '';
            const hasSub = (u.subscription_status === 'active' || u.data?.subscription_status === 'active') ? 'Yes' : 'No';
            return `${email},${name},${role},${appRole},${created},${hasSub}`;
        });

        const csv = [csvHeader, ...csvRows].join('\n');

        // Summary stats
        const totalUsers = allUsers.length;
        const verifiedCount = allUsers.filter(u => u.is_verified === true).length;
        const setupCompleteCount = allUsers.filter(u => u.setup_complete === true || u.data?.setup_complete === true).length;
        const eligibleCount = eligible.length;
        const teachers = eligible.filter(u => (u.app_role || u.data?.app_role) === 'teacher').length;
        const students = eligible.filter(u => (u.app_role || u.data?.app_role) === 'student').length;
        const admins = eligible.filter(u => (u.app_role || u.data?.app_role) === 'admin').length;

        return Response.json({
            summary: {
                total_users: totalUsers,
                verified_users: verifiedCount,
                setup_complete_users: setupCompleteCount,
                eligible_verified_and_setup: eligibleCount,
                breakdown: { teachers, students, admins },
            },
            csv_data: csv,
            eligible_list: eligible.map(u => ({
                email: u.email,
                full_name: u.full_name,
                app_role: u.app_role || u.data?.app_role,
                created_date: u.created_date,
                has_subscription: (u.subscription_status === 'active' || u.data?.subscription_status === 'active'),
            }))
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});