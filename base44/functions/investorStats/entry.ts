import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const pageSize = 200;

    // Fetch all users (paginated)
    let allUsers = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.User.list('-created_date', pageSize, skip);
      if (!batch || batch.length === 0) break;
      allUsers = allUsers.concat(batch);
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    // Filter out test accounts
    const testNames = ['aiden', 'hari', 'kraver'];
    const filteredUsers = allUsers.filter(u => {
      const name = (u.full_name || '').toLowerCase();
      return !testNames.some(t => name.includes(t));
    });

    // Monthly breakdown
    const monthlyGrowth = {};
    const roleBreakdown = { teacher: 0, student: 0, other: 0 };
    
    for (const u of filteredUsers) {
      const date = new Date(u.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
      
      const appRole = u.app_role || 'other';
      if (appRole === 'teacher') roleBreakdown.teacher++;
      else if (appRole === 'student') roleBreakdown.student++;
      else roleBreakdown.other++;
    }

    // Sort months
    const sortedMonths = Object.keys(monthlyGrowth).sort();
    const monthlyData = sortedMonths.map(month => ({
      month,
      newUsers: monthlyGrowth[month]
    }));

    // Cumulative
    let cumulative = 0;
    for (const md of monthlyData) {
      cumulative += md.newUsers;
      md.cumulativeTotal = cumulative;
    }

    return Response.json({
      totalUsers: filteredUsers.length,
      roleBreakdown,
      monthlyData
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});