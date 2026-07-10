import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Scheduling scenarios are admin-owned resources (see SchedulingScenario RLS).
        if (!user || user.app_role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { scenario_id, school_year } = await req.json();

        if (!scenario_id) {
            return Response.json({ error: 'scenario_id is required' }, { status: 400 });
        }

        // Get the scenario
        const scenarios = await base44.asServiceRole.entities.SchedulingScenario.filter({ id: scenario_id });
        if (scenarios.length === 0) {
            return Response.json({ error: 'Scenario not found' }, { status: 404 });
        }

        const scenario = scenarios[0];

        // Ownership check: only the admin who created the scenario may commit it.
        if (scenario.created_by !== user.email) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if schedule has been built
        if (scenario.status !== 'built') {
            return Response.json({ error: 'Schedule must be built before committing' }, { status: 400 });
        }

        // Check for unresolved conflicts
        const sections = await base44.asServiceRole.entities.ScheduleSection.filter({
            scenario_id,
            school_year
        });

        const hasTeacherConflicts = sections.some(s => s.has_teacher_conflict);
        const hasRoomConflicts = sections.some(s => s.has_room_conflict);

        if (hasTeacherConflicts || hasRoomConflicts) {
            return Response.json({
                error: 'Cannot commit schedule with unresolved conflicts',
                conflicts: {
                    teacher: hasTeacherConflicts,
                    room: hasRoomConflicts
                }
            }, { status: 400 });
        }

        // Mark scenario as committed
        await base44.asServiceRole.entities.SchedulingScenario.update(scenario_id, {
            status: 'committed',
            build_completed_at: new Date().toISOString()
        });

        // Deactivate other scenarios for this school year
        const otherScenarios = await base44.asServiceRole.entities.SchedulingScenario.filter({
            school_year,
            is_active: true
        });

        for (const other of otherScenarios) {
            if (other.id !== scenario_id) {
                await base44.asServiceRole.entities.SchedulingScenario.update(other.id, {
                    is_active: false
                });
            }
        }

        // Set this scenario as active
        await base44.asServiceRole.entities.SchedulingScenario.update(scenario_id, {
            is_active: true
        });

        // TODO: If SIS integration is configured, export schedule to SIS here
        // This would involve calling SIS API endpoints to create sections and enrollments

        return Response.json({
            success: true,
            message: 'Schedule committed successfully',
            scenario_id,
            sections_count: sections.length,
            committed_at: new Date().toISOString()
        });

    } catch (error) {
        console.error("Commit schedule error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});