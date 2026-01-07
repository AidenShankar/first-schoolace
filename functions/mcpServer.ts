// MCP Server for Schoolace - Updated with correct Content-Type headers
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // Check for API key in header
        const apiKey = req.headers.get('x-api-key');
        const expectedApiKey = Deno.env.get('MCP_API_KEY');
        const teacherUserId = Deno.env.get('TEACHER_USER_ID');
        
        if (!expectedApiKey) {
            return Response.json({ 
                jsonrpc: '2.0',
                error: { code: -32603, message: 'MCP_API_KEY not configured' }
            }, { status: 500 });
        }

        if (!teacherUserId) {
            return Response.json({ 
                jsonrpc: '2.0',
                error: { code: -32603, message: 'TEACHER_USER_ID not configured' }
            }, { status: 500 });
        }

        if (!apiKey || apiKey !== expectedApiKey) {
            return Response.json({ 
                jsonrpc: '2.0',
                error: { code: -32401, message: 'Invalid or missing API key' }
            }, { status: 401 });
        }

        const base44 = createClientFromRequest(req);
        
        const body = await req.json().catch(() => ({}));
        const method = body.method;
        const params = body.params || {};
        const id = body.id;

        if (method === 'initialize') {
            return Response.json({
                jsonrpc: '2.0',
                id: id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        resources: {},
                        tools: {}
                    },
                    serverInfo: {
                        name: 'schoolace-mcp',
                        version: '1.0.1'
                    }
                }
            });
        }

        if (method === 'resources/list') {
            return Response.json({
                jsonrpc: '2.0',
                id: id,
                result: {
                    resources: [
                        { uri: 'schoolace://classes', name: 'My Classes', mimeType: 'application/json' },
                        { uri: 'schoolace://assignments', name: 'Assignments', mimeType: 'application/json' },
                        { uri: 'schoolace://submissions', name: 'Submissions', mimeType: 'application/json' },
                        { uri: 'schoolace://students', name: 'Students', mimeType: 'application/json' }
                    ]
                }
            });
        }

        if (method === 'resources/read') {
            const uri = params.uri;
            
            if (uri === 'schoolace://classes') {
                const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacherUserId }, '-created_date', 50);
                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(classes, null, 2)
                        }]
                    }
                });
            }

            if (uri === 'schoolace://assignments') {
                const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacherUserId });
                const classIds = classes.map(c => c.id);
                const assignments = await base44.asServiceRole.entities.Assignment.filter({ 
                    class_id: { $in: classIds }
                }, '-created_date', 100);
                
                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(assignments, null, 2)
                        }]
                    }
                });
            }

            if (uri === 'schoolace://submissions') {
                const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacherUserId });
                const classIds = classes.map(c => c.id);
                const assignments = await base44.asServiceRole.entities.Assignment.filter({ 
                    class_id: { $in: classIds }
                });
                const assignmentIds = assignments.map(a => a.id);
                const submissions = await base44.asServiceRole.entities.Submission.filter({
                    assignment_id: { $in: assignmentIds }
                }, '-created_date', 200);
                
                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(submissions, null, 2)
                        }]
                    }
                });
            }

            if (uri === 'schoolace://students') {
                const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacherUserId });
                const classIds = classes.map(c => c.id);
                const enrollments = await base44.asServiceRole.entities.ClassEnrollment.filter({
                    class_id: { $in: classIds }
                });
                
                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(enrollments, null, 2)
                        }]
                    }
                });
            }

            return Response.json({ 
                jsonrpc: '2.0',
                id: id,
                error: { code: -32602, message: 'Resource not found' }
            }, { status: 404 });
        }

        if (method === 'tools/list') {
            return Response.json({
                jsonrpc: '2.0',
                id: id,
                result: {
                    tools: [
                        {
                            name: 'create_assignment',
                            description: 'Create a new assignment in a class',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    class_id: { type: 'string', description: 'Class ID' },
                                    title: { type: 'string', description: 'Assignment title' },
                                    description: { type: 'string', description: 'Description' },
                                    instructions: { type: 'string', description: 'Grading instructions' },
                                    max_points: { type: 'number', description: 'Max points' },
                                    due_date: { type: 'string', description: 'Due date (ISO)' }
                                },
                                required: ['class_id', 'title']
                            }
                        },
                        {
                            name: 'grade_submission',
                            description: 'Grade a student submission',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    submission_id: { type: 'string', description: 'Submission ID' },
                                    grade: { type: 'number', description: 'Grade to assign' },
                                    feedback: { type: 'string', description: 'Feedback text' }
                                },
                                required: ['submission_id', 'grade', 'feedback']
                            }
                        },
                        {
                            name: 'release_grades',
                            description: 'Release grades for an assignment to students',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    assignment_id: { type: 'string', description: 'Assignment ID' }
                                },
                                required: ['assignment_id']
                            }
                        },
                        {
                            name: 'send_class_message',
                            description: 'Send a message to the class chat',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    class_id: { type: 'string', description: 'Class ID' },
                                    message: { type: 'string', description: 'Message content' }
                                },
                                required: ['class_id', 'message']
                            }
                        }
                    ]
                }
            });
        }

        if (method === 'tools/call') {
            const toolName = params.name;
            const args = params.arguments || {};

            if (toolName === 'create_assignment') {
                const assignment = await base44.asServiceRole.entities.Assignment.create({
                    class_id: args.class_id,
                    teacher_id: teacherUserId,
                    title: args.title,
                    description: args.description || '',
                    instructions: args.instructions || '',
                    max_points: args.max_points || 100,
                    due_date: args.due_date ? new Date(args.due_date).toISOString() : null,
                    status: 'active',
                    is_visible: true
                });

                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        content: [{
                            type: 'text',
                            text: `✅ Created assignment "${args.title}" (ID: ${assignment.id})`
                        }]
                    }
                });
            }

            if (toolName === 'grade_submission') {
                await base44.asServiceRole.entities.Submission.update(args.submission_id, {
                    teacher_grade: args.grade,
                    teacher_feedback: args.feedback,
                    grading_status: 'graded'
                });

                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        content: [{
                            type: 'text',
                            text: `✅ Graded submission with ${args.grade} points`
                        }]
                    }
                });
            }

            if (toolName === 'release_grades') {
                const submissions = await base44.asServiceRole.entities.Submission.filter({
                    assignment_id: args.assignment_id,
                    grading_status: 'ai_graded'
                });

                for (const sub of submissions) {
                    await base44.asServiceRole.entities.Submission.update(sub.id, {
                        is_released: true,
                        released_at: new Date().toISOString(),
                        grading_status: 'released',
                        final_grade: sub.ai_grade,
                        final_feedback: sub.ai_feedback
                    });
                }

                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        content: [{
                            type: 'text',
                            text: `✅ Released ${submissions.length} grades`
                        }]
                    }
                });
            }

            if (toolName === 'send_class_message') {
                await base44.asServiceRole.entities.Message.create({
                    class_id: args.class_id,
                    content: args.message,
                    user_id: teacherUserId,
                    user_name: 'Teacher (via Claude)',
                    user_role: 'teacher'
                });

                return Response.json({
                    jsonrpc: '2.0',
                    id: id,
                    result: {
                        content: [{
                            type: 'text',
                            text: `✅ Message sent to class`
                        }]
                    }
                });
            }

            return Response.json({
                jsonrpc: '2.0',
                id: id,
                error: {
                    code: -32601,
                    message: 'Tool not found'
                }
            });
        }

        return Response.json({ 
            jsonrpc: '2.0',
            id: id,
            error: { code: -32601, message: 'Method not found' }
        }, { status: 400 });

    } catch (error) {
        console.error('MCP Error:', error);
        return Response.json({ 
            jsonrpc: '2.0',
            error: { code: -32603, message: error.message }
        }, { status: 500 });
    }
});