import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Spam email domains to exclude
const SPAM_DOMAINS = ['nesopf.com', 'nespf.com', 'tempmail.sbs', 'coswz.com', 'xfavaj.com', 'fxavaj.com'];

// Only these two are real external teachers
const REAL_TEACHER_IDS = [
  '68b21b0f2108eea4d6f61c6f', // Amber Kraver
  '697007a8ec3d23eacca74108', // Melissa Truong
];

function isSpam(user) {
  const email = (user.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';
  if (SPAM_DOMAINS.includes(domain)) return true;
  // Filter test accounts
  const name = (user.full_name || '').toLowerCase();
  if (name.includes('aiden') || name.includes('hari shankar')) return true;
  return false;
}

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

    // Filter out spam and test accounts
    const filteredUsers = allUsers.filter(u => !isSpam(u));

    // Monthly breakdown
    const monthlyGrowth = {};
    const roleBreakdown = { teacher: 0, student: 0, other: 0 };
    
    for (const u of filteredUsers) {
      const date = new Date(u.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
      
      const appRole = u.app_role || 'other';
      // For teacher count, only count real external teachers
      if (appRole === 'teacher') {
        if (REAL_TEACHER_IDS.includes(u.id)) {
          roleBreakdown.teacher++;
        } else {
          roleBreakdown.other++;
        }
      } else if (appRole === 'student') {
        roleBreakdown.student++;
      } else {
        roleBreakdown.other++;
      }
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
      monthlyData,
      spamDomains: SPAM_DOMAINS,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});