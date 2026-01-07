import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit2, Trash2, Building2, DoorOpen } from "lucide-react";

export default function RoomSetup() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const [roomForm, setRoomForm] = useState({
    room_number: "",
    building_id: "",
    capacity: 30,
    department_id: "",
    is_lab: false,
    is_gym: false,
    has_projector: false,
    has_computers: false,
    use_for_scheduling: true
  });

  const [buildingForm, setBuildingForm] = useState({
    name: "",
    code: "",
    address: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsData, buildingsData, deptsData] = await Promise.all([
        base44.entities.ScheduleRoom.list(),
        base44.entities.ScheduleBuilding.list(),
        base44.entities.ScheduleDepartment.list()
      ]);
      
      setRooms(roomsData);
      setBuildings(buildingsData);
      setDepartments(deptsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoom = async () => {
    if (!roomForm.room_number || !roomForm.building_id) {
      alert("Please fill in required fields");
      return;
    }

    try {
      if (editingRoom) {
        await base44.entities.ScheduleRoom.update(editingRoom.id, roomForm);
      } else {
        await base44.entities.ScheduleRoom.create(roomForm);
      }
      
      resetRoomForm();
      loadData();
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Failed to save room");
    }
  };

  const handleSaveBuilding = async () => {
    if (!buildingForm.name || !buildingForm.code) {
      alert("Please fill in required fields");
      return;
    }

    try {
      await base44.entities.ScheduleBuilding.create(buildingForm);
      setBuildingForm({ name: "", code: "", address: "" });
      setShowBuildingDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving building:", error);
      alert("Failed to save building");
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number,
      building_id: room.building_id,
      capacity: room.capacity,
      department_id: room.department_id || "",
      is_lab: room.is_lab,
      is_gym: room.is_gym,
      has_projector: room.has_projector,
      has_computers: room.has_computers,
      use_for_scheduling: room.use_for_scheduling
    });
    setShowRoomDialog(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Delete this room?")) return;
    
    try {
      await base44.entities.ScheduleRoom.delete(roomId);
      loadData();
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const resetRoomForm = () => {
    setRoomForm({
      room_number: "",
      building_id: "",
      capacity: 30,
      department_id: "",
      is_lab: false,
      is_gym: false,
      has_projector: false,
      has_computers: false,
      use_for_scheduling: true
    });
    setEditingRoom(null);
    setShowRoomDialog(false);
  };

  const getRoomsByBuilding = (buildingId) => {
    return rooms.filter(r => r.building_id === buildingId);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Room Setup</h2>
          <p className="text-slate-600">Manage buildings and classrooms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBuildingDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Building
          </Button>
          <Button onClick={() => setShowRoomDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {buildings.map(building => (
        <Card key={building.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <CardTitle>{building.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Code: {building.code}</p>
                </div>
              </div>
              <Badge>{getRoomsByBuilding(building.id).length} rooms</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRoomsByBuilding(building.id).map(room => {
                const dept = departments.find(d => d.id === room.department_id);
                return (
                  <Card key={room.id} className="bg-slate-50">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <DoorOpen className="w-4 h-4 text-slate-500" />
                            <p className="font-semibold">{room.room_number}</p>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">Capacity: {room.capacity}</p>
                          {dept && <Badge variant="outline" className="mb-2">{dept.name}</Badge>}
                          <div className="flex flex-wrap gap-1">
                            {room.is_lab && <Badge className="bg-orange-100 text-orange-800">Lab</Badge>}
                            {room.is_gym && <Badge className="bg-green-100 text-green-800">Gym</Badge>}
                            {room.has_projector && <Badge variant="outline">Projector</Badge>}
                            {room.has_computers && <Badge variant="outline">Computers</Badge>}
                            {!room.use_for_scheduling && <Badge variant="destructive">Not Schedulable</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Room Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={(open) => !open && resetRoomForm()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number *</Label>
                <Input
                  value={roomForm.room_number}
                  onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                  placeholder="e.g., 201"
                />
              </div>
              <div className="space-y-2">
                <Label>Building *</Label>
                <Select value={roomForm.building_id} onValueChange={(value) => setRoomForm({ ...roomForm, building_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={roomForm.department_id} onValueChange={(value) => setRoomForm({ ...roomForm, department_id: value })}>
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
            </div>

            <div className="space-y-2">
              <Label>Room Features</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomForm.is_lab}
                    onChange={(e) => setRoomForm({ ...roomForm, is_lab: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Lab Room</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomForm.is_gym}
                    onChange={(e) => setRoomForm({ ...roomForm, is_gym: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Gym</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomForm.has_projector}
                    onChange={(e) => setRoomForm({ ...roomForm, has_projector: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Has Projector</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomForm.has_computers}
                    onChange={(e) => setRoomForm({ ...roomForm, has_computers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Has Computers</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roomForm.use_for_scheduling}
                  onChange={(e) => setRoomForm({ ...roomForm, use_for_scheduling: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Use for Scheduling</span>
              </label>
              <p className="text-xs text-slate-500">Uncheck to exclude this room from automatic scheduling</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetRoomForm}>Cancel</Button>
              <Button onClick={handleSaveRoom}>{editingRoom ? "Update" : "Create"} Room</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Building Dialog */}
      <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Building Name *</Label>
              <Input
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                placeholder="e.g., Main Building"
              />
            </div>
            <div className="space-y-2">
              <Label>Building Code *</Label>
              <Input
                value={buildingForm.code}
                onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                placeholder="e.g., MAIN"
              />
            </div>
            <div className="space-y-2">
              <Label>Address (Optional)</Label>
              <Input
                value={buildingForm.address}
                onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowBuildingDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveBuilding}>Create Building</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}