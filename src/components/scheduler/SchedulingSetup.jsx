import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Building, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function SchedulingSetup() {
  const [periods, setPeriods] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [periodForm, setPeriodForm] = useState({
    period_number: 1,
    period_name: "",
    start_time: "",
    end_time: "",
    is_lunch: false
  });
  
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    code: "",
    address: ""
  });
  
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    head_teacher_id: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [periodsData, buildingsData, deptData] = await Promise.all([
        base44.entities.SchedulePeriod.list(),
        base44.entities.ScheduleBuilding.list(),
        base44.entities.ScheduleDepartment.list()
      ]);
      
      setPeriods(periodsData.sort((a, b) => a.period_number - b.period_number));
      setBuildings(buildingsData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    
    if (!periodForm.period_name || !periodForm.start_time || !periodForm.end_time) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      await base44.entities.SchedulePeriod.create(periodForm);
      setPeriodForm({
        period_number: periodForm.period_number + 1,
        period_name: "",
        start_time: "",
        end_time: "",
        is_lunch: false
      });
      loadData();
    } catch (error) {
      console.error("Error adding period:", error);
      alert("Failed to add period");
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (!confirm("Delete this period? This may affect existing schedules.")) return;
    
    try {
      await base44.entities.SchedulePeriod.delete(periodId);
      loadData();
    } catch (error) {
      console.error("Error deleting period:", error);
      alert("Failed to delete period");
    }
  };

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    
    if (!buildingForm.name || !buildingForm.code) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      await base44.entities.ScheduleBuilding.create(buildingForm);
      setBuildingForm({ name: "", code: "", address: "" });
      loadData();
    } catch (error) {
      console.error("Error adding building:", error);
      alert("Failed to add building");
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    if (!confirm("Delete this building? This will affect associated rooms.")) return;
    
    try {
      await base44.entities.ScheduleBuilding.delete(buildingId);
      loadData();
    } catch (error) {
      console.error("Error deleting building:", error);
      alert("Failed to delete building");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    if (!departmentForm.name || !departmentForm.code) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      await base44.entities.ScheduleDepartment.create(departmentForm);
      setDepartmentForm({ name: "", code: "", head_teacher_id: "" });
      loadData();
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Failed to add department");
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!confirm("Delete this department? This will affect associated courses and rooms.")) return;
    
    try {
      await base44.entities.ScheduleDepartment.delete(deptId);
      loadData();
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  const handleAutoSetup = async () => {
    if (!confirm("Create default 8-period schedule? This will add periods 1-8 with lunch.")) return;
    
    try {
      const defaultPeriods = [
        { period_number: 1, period_name: "Period 1", start_time: "08:00", end_time: "08:50", is_lunch: false },
        { period_number: 2, period_name: "Period 2", start_time: "09:00", end_time: "09:50", is_lunch: false },
        { period_number: 3, period_name: "Period 3", start_time: "10:00", end_time: "10:50", is_lunch: false },
        { period_number: 4, period_name: "Lunch", start_time: "11:00", end_time: "11:30", is_lunch: true },
        { period_number: 5, period_name: "Period 5", start_time: "11:40", end_time: "12:30", is_lunch: false },
        { period_number: 6, period_name: "Period 6", start_time: "12:40", end_time: "13:30", is_lunch: false },
        { period_number: 7, period_name: "Period 7", start_time: "13:40", end_time: "14:30", is_lunch: false },
        { period_number: 8, period_name: "Period 8", start_time: "14:40", end_time: "15:30", is_lunch: false }
      ];
      
      await base44.entities.SchedulePeriod.bulkCreate(defaultPeriods);
      loadData();
    } catch (error) {
      console.error("Error with auto setup:", error);
      alert("Failed to create default schedule");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduling Setup</h2>
          <p className="text-slate-600 mt-1">Configure periods, buildings, and departments for your school</p>
        </div>
        <Button onClick={handleAutoSetup} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Auto Setup Schedule
        </Button>
      </div>

      <Tabs defaultValue="periods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="periods">
            <Clock className="w-4 h-4 mr-2" />
            Periods
          </TabsTrigger>
          <TabsTrigger value="buildings">
            <Building className="w-4 h-4 mr-2" />
            Buildings
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Users className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
        </TabsList>

        {/* Periods Tab */}
        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Period</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPeriod} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Period Number</Label>
                    <Input
                      type="number"
                      value={periodForm.period_number}
                      onChange={(e) => setPeriodForm({ ...periodForm, period_number: parseInt(e.target.value) })}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label>Period Name</Label>
                    <Input
                      value={periodForm.period_name}
                      onChange={(e) => setPeriodForm({ ...periodForm, period_name: e.target.value })}
                      placeholder="e.g., Period 1"
                    />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={periodForm.start_time}
                      onChange={(e) => setPeriodForm({ ...periodForm, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={periodForm.end_time}
                      onChange={(e) => setPeriodForm({ ...periodForm, end_time: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_lunch"
                    checked={periodForm.is_lunch}
                    onChange={(e) => setPeriodForm({ ...periodForm, is_lunch: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_lunch" className="cursor-pointer">This is a lunch period</Label>
                </div>
                
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Period
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {periods.map((period, index) => (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600">{period.period_number}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{period.period_name}</h3>
                        <p className="text-sm text-slate-600">
                          {period.start_time} - {period.end_time}
                          {period.is_lunch && <span className="ml-2 text-orange-600">🍴 Lunch</span>}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePeriod(period.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Buildings Tab */}
        <TabsContent value="buildings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Building</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBuilding} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Building Name</Label>
                    <Input
                      value={buildingForm.name}
                      onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                      placeholder="e.g., Main Building"
                    />
                  </div>
                  <div>
                    <Label>Building Code</Label>
                    <Input
                      value={buildingForm.code}
                      onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                      placeholder="e.g., MB"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address (Optional)</Label>
                  <Input
                    value={buildingForm.address}
                    onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                    placeholder="Building address"
                  />
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Building
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {buildings.map((building, index) => (
              <motion.div
                key={building.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{building.name}</h3>
                        <p className="text-sm text-slate-600">Code: {building.code}</p>
                        {building.address && <p className="text-xs text-slate-500">{building.address}</p>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBuilding(building.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department Name</Label>
                    <Input
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <Label>Department Code</Label>
                    <Input
                      value={departmentForm.code}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })}
                      placeholder="e.g., MATH"
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                        <p className="text-sm text-slate-600">Code: {dept.code}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}