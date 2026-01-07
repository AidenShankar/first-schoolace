import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ScenarioManager({ adminId, onScenarioChange, activeScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const defaultSchoolYear = `${currentYear}-${currentYear + 1}`;
  
  const [newScenario, setNewScenario] = useState({
    name: "",
    school_year: defaultSchoolYear
  });

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.app_role !== 'admin') {
        setError('Only admins can manage scenarios');
        setLoading(false);
        return;
      }

      // Load all scenarios
      const data = await base44.entities.SchedulingScenario.list(1000);
      
      // Sort by created_date descending (newest first)
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        : [];
      
      setScenarios(sortedData);

      // Notify parent of active scenario
      if (onScenarioChange) {
        const active = sortedData.find(s => s.is_active === true);
        onScenarioChange(active || null);
      }
    } catch (error) {
      console.error("Error loading scenarios:", error);
      setError("Failed to load scenarios: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async () => {
    if (!newScenario.name.trim()) {
      alert("Please enter a scenario name");
      return;
    }

    setSaving(true);
    try {
      const scenarioData = {
        name: newScenario.name.trim(),
        school_year: newScenario.school_year,
        status: 'setup',
        is_active: scenarios.length === 0, // First scenario is active by default
        total_conflicts: 0,
        requests_satisfied_percent: 0
      };

      const created = await base44.entities.SchedulingScenario.create(scenarioData);
      
      // Immediately update local state
      setScenarios(prev => [created, ...prev]);

      // If this is the first scenario, notify parent
      if (scenarios.length === 0 && onScenarioChange) {
        onScenarioChange(created);
      }

      // Reset form and close dialog
      setNewScenario({
        name: "",
        school_year: defaultSchoolYear
      });
      setIsDialogOpen(false);
      
      alert("Scenario created successfully!");
    } catch (error) {
      console.error("Error creating scenario:", error);
      alert("Failed to create scenario: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (scenarioId) => {
    setSaving(true);
    try {
      // First, deactivate all scenarios
      const updatePromises = scenarios.map(scenario => {
        if (scenario.is_active && scenario.id !== scenarioId) {
          return base44.entities.SchedulingScenario.update(scenario.id, { is_active: false });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);

      // Then activate the selected scenario
      await base44.entities.SchedulingScenario.update(scenarioId, { is_active: true });
      
      // Update local state
      const updatedScenarios = scenarios.map(s => ({
        ...s,
        is_active: s.id === scenarioId
      }));
      setScenarios(updatedScenarios);

      // Notify parent
      if (onScenarioChange) {
        const activeScenario = updatedScenarios.find(s => s.id === scenarioId);
        onScenarioChange(activeScenario);
      }

      alert("Active scenario updated!");
    } catch (error) {
      console.error("Error setting active scenario:", error);
      alert("Failed to set active scenario: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    const scenarioToDelete = scenarios.find(s => s.id === scenarioId);
    
    if (!confirm(`Delete scenario "${scenarioToDelete?.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await base44.entities.SchedulingScenario.delete(scenarioId);
      
      // Update local state
      const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
      setScenarios(updatedScenarios);

      // If we deleted the active scenario, notify parent
      if (scenarioToDelete?.is_active && onScenarioChange) {
        const newActive = updatedScenarios.find(s => s.is_active) || null;
        onScenarioChange(newActive);
      }

      alert("Scenario deleted successfully!");
    } catch (error) {
      console.error("Error deleting scenario:", error);
      alert("Failed to delete scenario: " + (error.message || "Unknown error"));
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      setup: { label: 'Setup', color: 'bg-slate-100 text-slate-700' },
      building: { label: 'Building', color: 'bg-blue-100 text-blue-700' },
      built: { label: 'Built', color: 'bg-green-100 text-green-700' },
      committed: { label: 'Committed', color: 'bg-purple-100 text-purple-700' }
    };
    
    const { label, color } = config[status] || config.setup;
    return <Badge className={color}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadScenarios} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.app_role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">Only admins can manage scenarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scheduling Scenarios</h2>
          <p className="text-slate-600 mt-1">
            Create and manage different scheduling configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadScenarios} 
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Scenario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Scenario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Scenario Name</Label>
                  <Input
                    value={newScenario.name}
                    onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                    placeholder="e.g., Fall 2025 Schedule"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>School Year</Label>
                  <Input
                    value={newScenario.school_year}
                    onChange={(e) => setNewScenario({...newScenario, school_year: e.target.value})}
                    placeholder="e.g., 2025-2026"
                    disabled={saving}
                  />
                </div>
                <Button 
                  onClick={handleCreateScenario} 
                  className="w-full"
                  disabled={saving || !newScenario.name.trim()}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Scenario
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Scenarios Yet
            </h3>
            <p className="text-slate-600 mb-4">
              Create your first scheduling scenario to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map(scenario => (
            <Card key={scenario.id} className={scenario.is_active ? 'border-indigo-500 border-2' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {scenario.name}
                      {scenario.is_active && (
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{scenario.school_year}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteScenario(scenario.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  {getStatusBadge(scenario.status)}
                </div>
                
                {scenario.total_conflicts !== undefined && scenario.total_conflicts > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Conflicts:</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {scenario.total_conflicts}
                    </Badge>
                  </div>
                )}
                
                {scenario.requests_satisfied_percent !== undefined && scenario.requests_satisfied_percent > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Satisfaction:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {scenario.requests_satisfied_percent}%
                    </Badge>
                  </div>
                )}

                {!scenario.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetActive(scenario.id)}
                    className="w-full mt-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Setting...
                      </>
                    ) : (
                      'Set as Active'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                About Scenarios
              </h3>
              <p className="text-sm text-blue-800">
                Scenarios allow you to test different scheduling configurations without affecting your live schedule. 
                Create multiple scenarios, build them, compare results, and commit the best one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}