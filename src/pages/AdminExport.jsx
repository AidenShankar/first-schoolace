import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Users } from "lucide-react";
import { exportEligibleUsers } from "@/functions/exportEligibleUsers";

export default function AdminExport() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [csvData, setCsvData] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    const response = await exportEligibleUsers({});
    const result = response.data;
    setSummary(result.summary);
    setCsvData(result.csv_data);
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schoolace_eligible_users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin: Export Eligible Users</h1>

      <Button onClick={handleExport} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
        {loading ? "Loading..." : "Fetch Eligible Users"}
      </Button>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total users: <strong>{summary.total_users}</strong></p>
            <p>Verified: <strong>{summary.verified_users}</strong></p>
            <p>Setup complete: <strong>{summary.setup_complete_users}</strong></p>
            <p className="text-lg font-bold text-green-600">
              Eligible (verified + setup): {summary.eligible_verified_and_setup}
            </p>
            <div className="flex gap-4 mt-2">
              <span>Teachers: {summary.breakdown.teachers}</span>
              <span>Students: {summary.breakdown.students}</span>
              <span>Admins: {summary.breakdown.admins}</span>
            </div>

            <Button onClick={downloadCSV} className="mt-4 gap-2" variant="outline">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}