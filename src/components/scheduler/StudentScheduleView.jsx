import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

export default function StudentScheduleView({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = "2024-2025";

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const [scheduleData, coursesData, sectionsData, roomsData, periodsData] = await Promise.all([
        base44.entities.StudentSchedule.filter({ student_id: user.id, school_year: currentYear }),
        base44.entities.ScheduleCourse.list(),
        base44.entities.ScheduleSection.list(),
        base44.entities.ScheduleRoom.list(),
        base44.entities.SchedulePeriod.list()
      ]);

      setSchedule(scheduleData);
      setCourses(coursesData);
      setSections(sectionsData);
      setRooms(roomsData);
      setPeriods(periodsData.sort((a, b) => a.period_number - b.period_number));
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your schedule...</div>;
  }

  if (schedule.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Your schedule has not been finalized yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Schedule</h2>
        <p className="text-sm text-slate-600 mt-1">{currentYear}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {periods.map((period) => {
          const classInPeriod = schedule.find(s => {
            const section = sections.find(sec => sec.id === s.section_id);
            return section?.period_id === period.id;
          });

          if (!classInPeriod) return null;

          const section = sections.find(s => s.id === classInPeriod.section_id);
          const course = courses.find(c => c.id === classInPeriod.course_id);
          const room = rooms.find(r => r.id === section?.room_id);

          return (
            <Card key={period.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{course?.course_name || 'Unknown Course'}</CardTitle>
                    <p className="text-sm text-slate-600">{course?.course_code}</p>
                  </div>
                  <Badge>Period {period.period_number}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">
                      {period.start_time} - {period.end_time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">
                      Room {room?.room_number || 'TBA'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">
                      {section?.teacher_name || 'TBA'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}