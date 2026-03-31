import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { investorStats } from "@/functions/investorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Brain, CheckCircle, Clock, FileText, MessageCircle, UserCheck } from "lucide-react";

const MONTH_LABELS = {
  '2025-07': 'Jul 25', '2025-08': 'Aug 25', '2025-09': 'Sep 25', '2025-10': 'Oct 25',
  '2025-11': 'Nov 25', '2025-12': 'Dec 25', '2026-01': 'Jan 26', '2026-02': 'Feb 26', '2026-03': 'Mar 26'
};

function StatCard({ icon: Icon, label, value, subtitle, color }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-4xl font-bold mt-1" style={{ color }}>{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InvestorStats() {
  const [userStats, setUserStats] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [aiTutorStats, setAiTutorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch user stats from backend
      const userRes = await investorStats({});
      const data = userRes.data;
      setUserStats(data);

      const spamDomains = data.spamDomains || [];

      // Fetch submissions client-side (admin has access)
      let allSubs = [];
      const pageSize = 200;
      let page = 0;
      let hasMore = true;
      while (hasMore) {
        const batch = await base44.entities.Submission.list('-created_date', pageSize, page * pageSize);
        if (!batch || batch.length === 0) { hasMore = false; break; }
        allSubs = allSubs.concat(batch);
        if (batch.length < pageSize) hasMore = false;
        page++;
      }

      // Filter out test/spam submissions
      const filteredSubs = allSubs.filter(s => {
        const email = (s.student_email || '').toLowerCase();
        const domain = email.split('@')[1] || '';
        if (spamDomains.includes(domain)) return false;
        const name = (s.student_name || '').toLowerCase();
        if (name.includes('aiden') || name.includes('hari shankar')) return false;
        return true;
      });

      const aiStatuses = ['ai_graded', 'released', 'graded', 'dispute_reviewed'];
      const aiGraded = filteredSubs.filter(s => aiStatuses.includes(s.grading_status));

      setSubmissionStats({
        total: filteredSubs.length,
        aiGraded: aiGraded.length,
        hoursSaved: Math.round((aiGraded.length * 5) / 60),
      });

      // Fetch AI tutor messages client-side
      let allMessages = [];
      page = 0;
      hasMore = true;
      while (hasMore) {
        const batch = await base44.entities.AssignmentComment.filter(
          { is_ai_tutor_message: true },
          '-created_date', pageSize, page * pageSize
        );
        if (!batch || batch.length === 0) { hasMore = false; break; }
        allMessages = allMessages.concat(batch);
        if (batch.length < pageSize) hasMore = false;
        page++;
      }

      // Filter out spam
      const filteredMessages = allMessages.filter(m => {
        const email = (m.student_email || m.created_by || '').toLowerCase();
        const domain = email.split('@')[1] || '';
        if (spamDomains.includes(domain)) return false;
        const name = (m.user_name || '').toLowerCase();
        if (name.includes('aiden') || name.includes('hari shankar')) return false;
        return true;
      });

      // Group by month
      const monthlyMap = {};
      const uniqueStudents = new Set();
      const monthlyStudents = {};
      filteredMessages.forEach(m => {
        const date = new Date(m.created_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + 1;
        if (m.student_id) {
          uniqueStudents.add(m.student_id);
          if (!monthlyStudents[key]) monthlyStudents[key] = new Set();
          monthlyStudents[key].add(m.student_id);
        }
      });

      // Build cumulative monthly data
      const allMonthKeys = Object.keys(monthlyMap).sort();
      let cumTotal = 0;
      const aiMonthlyData = allMonthKeys.map(month => {
        cumTotal += monthlyMap[month];
        return {
          month,
          label: MONTH_LABELS[month] || month,
          newMessages: monthlyMap[month],
          cumulativeTotal: cumTotal,
          uniqueStudents: monthlyStudents[month]?.size || 0,
        };
      });

      setAiTutorStats({
        totalMessages: filteredMessages.length,
        studentMessages: filteredMessages.filter(m => m.user_role === 'student').length,
        aiResponses: filteredMessages.filter(m => m.user_id === 'ai_tutor').length,
        uniqueStudents: uniqueStudents.size,
        monthlyData: aiMonthlyData,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const userMonthlyData = (userStats?.monthlyData || []).map(d => ({
    ...d,
    label: MONTH_LABELS[d.month] || d.month
  }));

  // Calculate growth rate (Nov 2025 to latest)
  const novData = userMonthlyData.find(d => d.month === '2025-11');
  const latestData = userMonthlyData[userMonthlyData.length - 1];
  const growthPct = novData && latestData ? 
    Math.round(((latestData.cumulativeTotal - (novData.cumulativeTotal - novData.newUsers)) / Math.max(novData.cumulativeTotal - novData.newUsers, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900">SchoolACE — Investor Metrics</h1>
          <p className="text-lg text-slate-500 mt-2">Nov 2025 – March 2026</p>
        </div>

        {/* Top-line KPIs */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                  <p className="text-5xl font-bold mt-1" style={{ color: '#6366f1' }}>{userStats?.totalUsers?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">{growthPct}% growth since Nov '25</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#6366f115' }}>
                  <Users className="w-10 h-10" style={{ color: '#6366f1' }} />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={FileText} label="Total Submissions" value={submissionStats?.total?.toLocaleString() || 0} subtitle="Student assignments submitted" color="#8b5cf6" />
            <StatCard icon={Brain} label="AI-Graded" value={submissionStats?.aiGraded?.toLocaleString() || 0} subtitle={`of ${submissionStats?.total?.toLocaleString() || 0} total submissions`} color="#ec4899" />
          </div>
        </div>

        {/* User Growth Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">User Growth (Cumulative)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cumulativeTotal" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} name="Total Users" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>



        {/* AI Tutor Engagement */}
        {aiTutorStats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={MessageCircle} label="AI Tutor Messages" value={aiTutorStats.totalMessages.toLocaleString()} subtitle={`${aiTutorStats.studentMessages} student · ${aiTutorStats.aiResponses} AI`} color="#f59e0b" />
              <StatCard icon={UserCheck} label="Students Using AI Tutor" value={aiTutorStats.uniqueStudents} subtitle="Unique students engaged" color="#06b6d4" />
              <StatCard icon={Brain} label="Avg Messages/Student" value={aiTutorStats.uniqueStudents ? (aiTutorStats.totalMessages / aiTutorStats.uniqueStudents).toFixed(1) : 0} subtitle="Depth of engagement" color="#8b5cf6" />
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">AI Tutor Interactions (Cumulative)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiTutorStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cumulativeTotal" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} name="Cumulative Messages" />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Unique Students Using AI Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiTutorStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="uniqueStudents" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Unique Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Role Breakdown */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">User Role Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-600">{userStats?.roleBreakdown?.teacher || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Teachers</p>
                <p className="text-xs text-muted-foreground">Amber Kraver & Melissa Truong</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{userStats?.roleBreakdown?.student || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Students</p>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Teacher-to-student ratio: 1:{Math.round((userStats?.roleBreakdown?.student || 0) / Math.max(userStats?.roleBreakdown?.teacher || 1, 1))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">Data pulled live from SchoolACE database • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}