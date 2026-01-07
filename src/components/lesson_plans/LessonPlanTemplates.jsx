import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    BookOpen, 
    Calculator, 
    Beaker, 
    Globe,
    Search,
    Copy,
    Star
} from 'lucide-react';
import { LessonPlan } from '@/entities/LessonPlan';
import { motion } from 'framer-motion';

const templateCategories = [
    {
        id: 'reading',
        name: 'Reading & Literature',
        icon: BookOpen,
        color: 'bg-blue-100 text-blue-700',
        templates: [
            {
                title: 'Novel Study Introduction',
                description: 'Introduce a new novel with character analysis and theme exploration',
                objectives: [
                    'Identify main characters and their motivations',
                    'Analyze the opening chapter for literary devices',
                    'Predict plot developments based on initial reading'
                ],
                activities: [
                    {
                        title: 'Character Gallery Walk',
                        description: 'Students create character profiles and share with the class',
                        duration: 20,
                        materials: ['Character profile worksheets', 'Poster paper', 'Markers']
                    }
                ]
            },
            {
                title: 'Poetry Analysis Workshop',
                description: 'Deep dive into poetic devices and meaning-making',
                objectives: [
                    'Identify and analyze poetic devices',
                    'Interpret themes and meanings in poetry',
                    'Create original poetry using learned techniques'
                ]
            }
        ]
    },
    {
        id: 'math',
        name: 'Mathematics',
        icon: Calculator,
        color: 'bg-green-100 text-green-700',
        templates: [
            {
                title: 'Fraction Operations',
                description: 'Interactive lesson on adding and subtracting fractions',
                objectives: [
                    'Add and subtract fractions with like denominators',
                    'Find common denominators for unlike fractions',
                    'Apply fraction operations to real-world problems'
                ]
            },
            {
                title: 'Geometry Exploration',
                description: 'Hands-on exploration of shapes and their properties',
                objectives: [
                    'Identify properties of 2D shapes',
                    'Calculate area and perimeter',
                    'Apply geometric concepts to practical situations'
                ]
            }
        ]
    },
    {
        id: 'science',
        name: 'Science',
        icon: Beaker,
        color: 'bg-purple-100 text-purple-700',
        templates: [
            {
                title: 'Scientific Method Lab',
                description: 'Hands-on experiment using the scientific method',
                objectives: [
                    'Follow the steps of the scientific method',
                    'Form and test hypotheses',
                    'Record and analyze experimental data'
                ]
            },
            {
                title: 'Ecosystem Food Webs',
                description: 'Interactive exploration of ecosystem relationships',
                objectives: [
                    'Identify producers, consumers, and decomposers',
                    'Trace energy flow through food chains',
                    'Understand ecological relationships and balance'
                ]
            }
        ]
    },
    {
        id: 'social_studies',
        name: 'Social Studies',
        icon: Globe,
        color: 'bg-orange-100 text-orange-700',
        templates: [
            {
                title: 'Historical Timeline',
                description: 'Creating and analyzing historical timelines',
                objectives: [
                    'Sequence historical events chronologically',
                    'Identify cause and effect relationships',
                    'Connect historical events to current issues'
                ]
            }
        ]
    }
];

export default function LessonPlanTemplates({ onUseTemplate, currentClass, currentUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [userTemplates, setUserTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserTemplates();
    }, [currentUser]);

    const loadUserTemplates = async () => {
        if (!currentUser) return;
        
        try {
            // Load user's saved templates
            const templates = await LessonPlan.filter({ 
                teacher_id: currentUser.id,
                is_template: true 
            });
            setUserTemplates(templates);
        } catch (error) {
            console.error('Error loading user templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = templateCategories.filter(category => {
        if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;
        if (!searchQuery) return true;
        
        const searchLower = searchQuery.toLowerCase();
        return (
            category.name.toLowerCase().includes(searchLower) ||
            category.templates.some(template => 
                template.title.toLowerCase().includes(searchLower) ||
                template.description.toLowerCase().includes(searchLower)
            )
        );
    });

    const filteredUserTemplates = userTemplates.filter(template => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return template.title.toLowerCase().includes(searchLower);
    });

    const applyBuiltInTemplate = (template) => {
        // Convert built-in template to lesson format
        const lessonData = {
            title: template.title,
            lesson_date: new Date(),
            objectives: template.objectives || [],
            hook: 'Engaging opening activity to introduce the topic',
            activities: template.activities || [
                {
                    title: 'Main Activity',
                    description: template.description,
                    duration: 30,
                    materials: []
                }
            ],
            homework: ['Review today\'s concepts and complete practice worksheet'],
            resources: [],
            assessment: {
                type: 'formative',
                description: 'Observe student participation and understanding throughout the lesson'
            },
            differentiation: [
                'Provide visual aids for visual learners',
                'Offer additional support for struggling students',
                'Provide extension activities for advanced learners'
            ],
            status: 'draft'
        };
        
        onUseTemplate(lessonData);
    };

    return (
        <div className="space-y-8">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Categories
                    </Button>
                    {templateCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className="flex items-center gap-2"
                        >
                            <category.icon className="w-4 h-4" />
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* User's Saved Templates */}
            {!isLoading && filteredUserTemplates.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Your Saved Templates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUserTemplates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-yellow-400">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg group-hover:text-indigo-700 transition-colors">
                                                    {template.title}
                                                </CardTitle>
                                                <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                                                    Personal Template
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {template.objectives && template.objectives.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-slate-700 mb-2">Objectives:</p>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {template.objectives.slice(0, 2).map((obj, idx) => (
                                                        <li key={idx} className="flex items-start gap-1">
                                                            <span className="text-slate-400">•</span>
                                                            <span>{obj}</span>
                                                        </li>
                                                    ))}
                                                    {template.objectives.length > 2 && (
                                                        <li className="text-slate-400 text-xs">
                                                            +{template.objectives.length - 2} more objectives...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => onUseTemplate(template)}
                                            className="w-full"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Use This Template
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Built-in Template Categories */}
            <div className="space-y-8">
                {filteredCategories.map((category, categoryIndex) => (
                    <div key={category.id} className="space-y-4">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                                <category.icon className="w-5 h-5" />
                            </div>
                            {category.name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.templates.map((template, templateIndex) => (
                                <motion.div
                                    key={`${category.id}-${templateIndex}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (categoryIndex * 0.1) + (templateIndex * 0.05) }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-indigo-400">
                                        <CardHeader>
                                            <CardTitle className="text-lg group-hover:text-indigo-700 transition-colors">
                                                {template.title}
                                            </CardTitle>
                                            <p className="text-slate-600 text-sm">
                                                {template.description}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            {template.objectives && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-slate-700 mb-2">Learning Objectives:</p>
                                                    <ul className="text-sm text-slate-600 space-y-1">
                                                        {template.objectives.slice(0, 3).map((objective, idx) => (
                                                            <li key={idx} className="flex items-start gap-1">
                                                                <span className="text-slate-400">•</span>
                                                                <span>{objective}</span>
                                                            </li>
                                                        ))}
                                                        {template.objectives.length > 3 && (
                                                            <li className="text-slate-400 text-xs">
                                                                +{template.objectives.length - 3} more objectives...
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                            <Button
                                                onClick={() => applyBuiltInTemplate(template)}
                                                className="w-full"
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                Use Template
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && filteredUserTemplates.length === 0 && (
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No templates found</h3>
                    <p className="text-slate-500">
                        Try adjusting your search or browse different categories.
                    </p>
                </div>
            )}
        </div>
    );
}