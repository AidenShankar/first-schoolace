import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { investorStats } from "@/functions/investorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Brain, CheckCircle, Clock, Download } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch user stats from backend
      const userRes = await investorStats({});
      setUserStats(userRes.data);

      // Fetch submissions directly from frontend SDK (bypasses service role issue)
      let allSubs = [];
      const pageSize = 200;
      let hasMore = true;
      let page = 0;
      while (hasMore) {
        const batch = await base44.entities.Submission.list('-created_date', pageSize, page * pageSize);
        if (!batch || batch.length === 0) { hasMore = false; break; }
        allSubs = allSubs.concat(batch);
        if (batch.length < pageSize) hasMore = false;
        page++;
      }

      // Filter out test account submissions
      const testNames = ['aiden', 'hari', 'kraver'];
      const filteredSubs = allSubs.filter(s => {
        const name = (s.student_name || '').toLowerCase();
        return !testNames.some(t => name.includes(t));
      });

      // Process submissions
      const aiStatuses = ['ai_graded', 'released', 'graded', 'dispute_reviewed'];
      const aiGraded = filteredSubs.filter(s => aiStatuses.includes(s.grading_status));
      const teacherGraded = filteredSubs.filter(s => s.teacher_grade != null || s.teacher_feedback);
      
      const monthlySubs = {};
      for (const s of filteredSubs) {
        const date = new Date(s.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlySubs[monthKey]) monthlySubs[monthKey] = { total: 0, aiGraded: 0 };
        monthlySubs[monthKey].total++;
        if (aiStatuses.includes(s.grading_status)) monthlySubs[monthKey].aiGraded++;
      }

      const sortedMonths = Object.keys(monthlySubs).sort().filter(m => m >= '2026-01');
      const monthlySubData = sortedMonths.map(m => ({
        month: m,
        label: MONTH_LABELS[m] || m,
        total: monthlySubs[m].total,
        aiGraded: monthlySubs[m].aiGraded
      }));

      setSubmissionStats({
        total: filteredSubs.length,
        aiGraded: aiGraded.length,
        teacherGraded: teacherGraded.length,
        hoursSaved: Math.round((aiGraded.length * 5) / 60),
        monthlyData: monthlySubData
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={userStats?.totalUsers?.toLocaleString() || 0} subtitle={`${growthPct}% growth since Nov '25`} color="#6366f1" />
          <StatCard icon={CheckCircle} label="Teacher-Graded" value={submissionStats?.teacherGraded?.toLocaleString() || 0} subtitle="Submissions graded by teachers" color="#8b5cf6" />
          <StatCard icon={Brain} label="AI-Graded Submissions" value={submissionStats?.aiGraded?.toLocaleString() || 0} subtitle={`of ${submissionStats?.total?.toLocaleString() || 0} total`} color="#ec4899" />
          <StatCard icon={Clock} label="Est. Teacher Hours Saved" value={`${submissionStats?.hoursSaved || 0}h`} subtitle="@ 5 min per manual grade" color="#10b981" />
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

        {/* Submissions Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">AI Grading Activity (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionStats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#c4b5fd" name="Total Submissions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aiGraded" fill="#ec4899" name="AI-Graded" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Role Breakdown */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">User Role Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-600">{userStats?.roleBreakdown?.teacher || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Teachers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{userStats?.roleBreakdown?.student || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-400">{userStats?.roleBreakdown?.other || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Other / Incomplete Setup</p>
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