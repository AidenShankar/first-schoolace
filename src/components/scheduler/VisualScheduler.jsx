import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function VisualScheduler() {
  const [sections, setSections] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load scenarios
      const scenarios = await base44.entities.SchedulingScenario.list('-created_date', 100);
      const active = scenarios.find(s => s.is_active);
      setActiveScenario(active);

      if (!active) {
        setLoading(false);
        return;
      }

      // Load schedule data
      const [sectionsData, periodsData, roomsData] = await Promise.all([
        base44.entities.ScheduleSection.filter({ scenario_id: active.id }),
        base44.entities.SchedulePeriod.list('period_number', 100),
        base44.entities.ScheduleRoom.list('-created_date', 1000)
      ]);

      setSections(sectionsData);
      setPeriods(periodsData);
      setRooms(roomsData);

    } catch (error) {
      console.error("Error loading schedule:", error);
      alert("Failed to load schedule: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!activeScenario) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Active Scenario
          </h3>
          <p className="text-slate-600">
            Create and activate a scenario in the Setup tab, then build a schedule to view it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Schedule Built Yet
          </h3>
          <p className="text-slate-600">
            Build a schedule in the Build tab to view it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visual Schedule</h2>
          <p className="text-slate-600 mt-1">
            Scenario: <strong>{activeScenario.name}</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-slate-100 font-semibold">Period / Room</th>
              {rooms.slice(0, 10).map(room => (
                <th key={room.id} className="border p-2 bg-slate-100 font-semibold min-w-[150px]">
                  {room.room_number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id}>
                <td className="border p-2 bg-slate-50 font-medium">
                  {period.period_name}
                  <div className="text-xs text-slate-500">
                    {period.start_time} - {period.end_time}
                  </div>
                </td>
                {rooms.slice(0, 10).map(room => {
                  const section = sections.find(s => 
                    s.period_id === period.id && s.room_id === room.id
                  );
                  
                  return (
                    <td key={room.id} className="border p-2 align-top">
                      {section ? (
                        <div className="text-sm">
                          <div className="font-medium">{section.course_id}</div>
                          <div className="text-xs text-slate-600">{section.teacher_name}</div>
                          {section.has_teacher_conflict && (
                            <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 text-xs">
                              Teacher Conflict
                            </Badge>
                          )}
                          {section.has_room_conflict && (
                            <Badge variant="outline" className="mt-1 bg-orange-50 text-orange-700 text-xs">
                              Room Conflict
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rooms.length > 10 && (
        <p className="text-sm text-slate-500 text-center">
          Showing first 10 rooms. Total: {rooms.length}
        </p>
      )}
    </div>
  );
}