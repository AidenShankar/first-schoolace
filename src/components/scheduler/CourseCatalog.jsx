import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    department_id: "",
    term: "Full Year",
    credits: 1,
    grade_levels: [],
    prerequisites: [],
    max_class_size: 25,
    requires_lab: false,
    requires_gym: false,
    is_elective: true,
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, deptData] = await Promise.all([
        base44.entities.ScheduleCourse.list(),
        base44.entities.ScheduleDepartment.list()
      ]);
      setCourses(coursesData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.course_code || !formData.course_name) {
      alert("Please fill in required fields");
      return;
    }

    try {
      if (editingCourse) {
        await base44.entities.ScheduleCourse.update(editingCourse.id, formData);
      } else {
        await base44.entities.ScheduleCourse.create(formData);
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      department_id: course.department_id || "",
      term: course.term,
      credits: course.credits,
      grade_levels: course.grade_levels || [],
      prerequisites: course.prerequisites || [],
      max_class_size: course.max_class_size,
      requires_lab: course.requires_lab,
      requires_gym: course.requires_gym,
      is_elective: course.is_elective,
      description: course.description || ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure? This will affect existing schedules.")) return;
    
    try {
      await base44.entities.ScheduleCourse.delete(courseId);
      loadData();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  const resetForm = () => {
    setFormData({
      course_code: "",
      course_name: "",
      department_id: "",
      term: "Full Year",
      credits: 1,
      grade_levels: [],
      prerequisites: [],
      max_class_size: 25,
      requires_lab: false,
      requires_gym: false,
      is_elective: true,
      description: ""
    });
    setEditingCourse(null);
    setShowDialog(false);
  };

  const handleExport = () => {
    const csv = [
      ["Code", "Name", "Department", "Term", "Credits", "Grade Levels", "Max Size", "Type"],
      ...courses.map(c => [
        c.course_code,
        c.course_name,
        departments.find(d => d.id === c.department_id)?.name || "",
        c.term,
        c.credits,
        (c.grade_levels || []).join(";"),
        c.max_class_size,
        c.is_elective ? "Elective" : "Required"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "course_catalog.csv";
    a.click();
  };

  const handleGradeLevelToggle = (grade) => {
    const levels = formData.grade_levels || [];
    if (levels.includes(grade)) {
      setFormData({ ...formData, grade_levels: levels.filter(g => g !== grade) });
    } else {
      setFormData({ ...formData, grade_levels: [...levels, grade] });
    }
  };

  const filteredCourses = courses.filter(c => 
    c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Course Catalog</h2>
          <p className="text-slate-600">Manage your school's course offerings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.course_name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{course.course_code}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{course.term}</Badge>
                  <Badge variant="outline">{course.credits} credit{course.credits !== 1 ? 's' : ''}</Badge>
                  {course.is_elective ? (
                    <Badge className="bg-blue-100 text-blue-800">Elective</Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800">Required</Badge>
                  )}
                </div>
                {course.requires_lab && <Badge className="bg-orange-100 text-orange-800">Lab Required</Badge>}
                {course.requires_gym && <Badge className="bg-green-100 text-green-800">Gym Required</Badge>}
                <p className="text-sm text-slate-600">Max size: {course.max_class_size}</p>
                {course.grade_levels && course.grade_levels.length > 0 && (
                  <p className="text-sm text-slate-600">Grades: {course.grade_levels.join(", ")}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  placeholder="e.g., ENG101"
                />
              </div>
              <div className="space-y-2">
                <Label>Course Name *</Label>
                <Input
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g., English 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={formData.term} onValueChange={(value) => setFormData({ ...formData, term: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Year">Full Year</SelectItem>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                    <SelectItem value="Quarter 1">Quarter 1</SelectItem>
                    <SelectItem value="Quarter 2">Quarter 2</SelectItem>
                    <SelectItem value="Quarter 3">Quarter 3</SelectItem>
                    <SelectItem value="Quarter 4">Quarter 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Class Size</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_class_size}
                  onChange={(e) => setFormData({ ...formData, max_class_size: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select value={formData.is_elective ? "elective" : "required"} onValueChange={(value) => setFormData({ ...formData, is_elective: value === "elective" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grade Levels</Label>
              <div className="flex flex-wrap gap-2">
                {["9", "10", "11", "12"].map(grade => (
                  <Button
                    key={grade}
                    type="button"
                    variant={formData.grade_levels?.includes(grade) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGradeLevelToggle(grade)}
                  >
                    Grade {grade}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_lab}
                    onChange={(e) => setFormData({ ...formData, requires_lab: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Requires Lab</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_gym}
                    onChange={(e) => setFormData({ ...formData, requires_gym: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Requires Gym</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave}>{editingCourse ? "Update" : "Create"} Course</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}