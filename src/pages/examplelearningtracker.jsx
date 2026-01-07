import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Award, Target, MessageSquare, Sparkles, Clock, X, ArrowUp
} from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Sample data generator with ACE AI correlation (Kept from original)
const generateSampleData = () => {
  const subjects = ['Math', 'English', 'Science', 'History'];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  const topics = {
    Math: ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Trigonometry'],
    English: ['Grammar', 'Literature', 'Writing', 'Vocabulary', 'Reading Comprehension'],
    Science: ['Physics', 'Chemistry', 'Biology', 'Earth Science', 'Lab Skills'],
    History: ['Ancient History', 'Modern History', 'Geography', 'Civics', 'World Wars']
  };

  const data = {};
  let totalAceInteractions = 0;

  subjects.forEach(subject => {
    data[subject] = {};
    topics[subject].forEach(topic => {
      data[subject][topic] = {};
      quarters.forEach((quarter, qIndex) => {
        const weeklyData = [];
        let baseScore = 60 + Math.random() * 15;
        const trend = Math.random() > 0.4 ? 1 : -1;
        const aceInteractionMultiplier = 1 + (qIndex * 0.4);
        
        for (let week = 1; week <= 9; week++) {
          const variance = (Math.random() - 0.5) * 8;
          const trendEffect = trend * week * 1.5;
          const aceBoost = aceInteractionMultiplier * week * 1.2;
          const score = Math.max(50, Math.min(100, baseScore + trendEffect + variance + aceBoost));
          
          const aceInteractions = Math.floor(Math.random() * 12) + 8 + (qIndex * 4) + week;
          totalAceInteractions += aceInteractions;
          
          weeklyData.push({
            week: `W${week}`,
            score: Math.round(score * 10) / 10,
            assignments: Math.floor(Math.random() * 4) + 2,
            aceInteractions: aceInteractions,
            hoursWithAce: Math.round((aceInteractions * 0.3) * 10) / 10
          });
        }
        
        data[subject][topic][quarter] = {
          weeklyData,
          averageScore: Math.round(weeklyData.reduce((sum, w) => sum + w.score, 0) / 9 * 10) / 10,
          trend: trend > 0 ? 'improving' : 'declining',
          totalAceInteractions: weeklyData.reduce((sum, w) => sum + w.aceInteractions, 0)
        };
      });
    });
  });

  data.totalAceInteractions = totalAceInteractions;
  return data;
};

const analyzePerformance = (data) => {
  const analysis = { Q1: { strengths: [], weaknesses: [] }, Q2: { strengths: [], weaknesses: [] }, Q3: { strengths: [], weaknesses: [] }, Q4: { strengths: [], weaknesses: [] } };

  Object.keys(data).forEach(subject => {
    if (subject === 'totalAceInteractions') return;
    Object.keys(data[subject]).forEach(topic => {
      Object.keys(data[subject][topic]).forEach(quarter => {
        const quarterData = data[subject][topic][quarter];
        const avgScore = quarterData.averageScore;
        
        if (avgScore >= 85) {
          analysis[quarter].strengths.push({ subject, topic, score: avgScore, trend: quarterData.trend, data: quarterData });
        } else if (avgScore < 72) {
          analysis[quarter].weaknesses.push({ subject, topic, score: avgScore, trend: quarterData.trend, data: quarterData });
        }
      });
    });
  });

  Object.keys(analysis).forEach(quarter => {
    analysis[quarter].strengths.sort((a, b) => b.score - a.score);
    analysis[quarter].weaknesses.sort((a, b) => a.score - b.score);
  });

  return analysis;
};

export default function ExampleLearningTracker() {
  const [studentData] = useState(generateSampleData());
  const [analysis] = useState(analyzePerformance(studentData));
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('Q4'); // Default to latest
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const aceCorrelationData = quarters.map((q, idx) => ({
    name: q,
    val: 65 + (idx * 8) + Math.random() * 5 
  }));

  const quarterStats = quarters.map((q, idx) => {
    let totalScore = 0, count = 0, totalAce = 0;
    Object.keys(studentData).forEach(subject => {
      if (subject === 'totalAceInteractions') return;
      Object.keys(studentData[subject]).forEach(topic => {
        totalScore += studentData[subject][topic][q].averageScore;
        totalAce += studentData[subject][topic][q].totalAceInteractions;
        count++;
      });
    });
    return {
      name: q,
      average: Math.round(totalScore / count * 10) / 10,
      aceInteractions: totalAce
    };
  });

  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setPrompt("");
    setShowChat(true);
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiThinking(true);

    try {
        const context = {
            overallGrade: "94%",
            conversations: "5,240",
            studyHours: "187h",
            improvement: "+14%",
            strengths: analysis[selectedQuarter].strengths.map(s => s.topic).join(", "),
            weaknesses: analysis[selectedQuarter].weaknesses.map(w => w.topic).join(", "),
        };

        const response = await InvokeLLM({
            prompt: `You are ACE AI, a helpful learning assistant for a student. 
            The user is asking about their learning stats on the dashboard.
            Here is their current data context: ${JSON.stringify(context)}. 
            User Question: "${userMsg}"
            
            Answer the user's question in a friendly, encouraging, and concise way. 
            You can invent specific details about assignments, specific test scores, or study sessions if needed to make it sound realistic and engaging, as this is a demo.
            Keep it short (max 2-3 sentences).`
        });

        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
        console.error(error);
        setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm analyzing your data... You're doing great! Keep up the good work on those math modules." }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learning Tracker</h1>
          <p className="text-slate-500 mt-1">Monitor academic performance and AI-assisted learning progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1.5 flex gap-2">
            <Sparkles className="w-3 h-3" /> 
            Powered by ACE AI
          </Badge>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 px-3 py-1.5">
            2025-2026 School Year
          </Badge>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overall Grade</p>
              <h3 className="text-2xl font-bold text-slate-900">94%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">ACE Conversations</p>
              <h3 className="text-2xl font-bold text-slate-900">5,240</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Study Hours</p>
              <h3 className="text-2xl font-bold text-slate-900">187h</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Improvement</p>
              <h3 className="text-2xl font-bold text-slate-900">+14%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Performance Overview</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Topic Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Performance Growth</CardTitle>
                <CardDescription>Correlation between ACE AI usage and grade improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aceCorrelationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Summary */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Quarterly Summary</CardTitle>
                <CardDescription>Average grades by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quarterStats.map((stat, idx) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {stat.name}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Term {idx + 1}</p>
                          <p className="text-xs text-slate-500">{stat.aceInteractions} AI interactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${stat.average >= 90 ? 'text-green-600' : stat.average >= 80 ? 'text-blue-600' : 'text-slate-600'}`}>
                          {stat.average}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {quarters.map((q) => (
              <Button
                key={q}
                variant={selectedQuarter === q ? "default" : "outline"}
                onClick={() => setSelectedQuarter(q)}
                className={`rounded-full ${selectedQuarter === q ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-slate-50'}`}
              >
                {q} Analysis
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Top Strengths</CardTitle>
                    <CardDescription>Areas where you are excelling</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis[selectedQuarter].strengths.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer"
                    onClick={() => setSelectedTopic({ ...item, quarter: selectedQuarter })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-green-700">{item.topic}</h4>
                        <p className="text-xs text-slate-500">{item.subject}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                        {item.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {item.data.totalAceInteractions} chats
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp className="w-3 h-3" /> Improving
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Focus Areas</CardTitle>
                    <CardDescription>Topics that need attention</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis[selectedQuarter].weaknesses.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer"
                    onClick={() => setSelectedTopic({ ...item, quarter: selectedQuarter })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-orange-700">{item.topic}</h4>
                        <p className="text-xs text-slate-500">{item.subject}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">
                        {item.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {item.data.totalAceInteractions} chats
                      </span>
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <Sparkles className="w-3 h-3" /> AI Suggested
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Topic Detail Modal */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedTopic(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedTopic.topic}</h3>
                  <p className="text-slate-500">{selectedTopic.subject} • {selectedTopic.quarter}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Average Score</p>
                    <p className={`text-3xl font-bold ${selectedTopic.score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                      {selectedTopic.score}%
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Total Interactions</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {selectedTopic.data.totalAceInteractions}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Weekly Progress</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedTopic.data.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke={selectedTopic.score >= 80 ? "#16a34a" : "#ea580c"} 
                          strokeWidth={2}
                          fill={selectedTopic.score >= 80 ? "#dcfce7" : "#ffedd5"} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Weekly Breakdown</h4>
                  <div className="space-y-2">
                    {selectedTopic.data.weeklyData.map((week, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-700 w-8">{week.week}</span>
                          <span className="text-sm text-slate-500">{week.aceInteractions} chats</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">{week.hoursWithAce}h studied</span>
                          <Badge variant="secondary" className={week.score >= 80 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                            {week.score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Interface */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-[100]">
        <AnimatePresence>
            {showChat && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="mb-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden max-h-[50vh] flex flex-col"
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-semibold text-slate-600">ACE Assistant</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowChat(false)} 
                            className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-full"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[100px]">
                        {chatHistory.length === 0 && !isAiThinking && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Ask me anything about your grades, study habits, or progress!
                            </div>
                        )}
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isAiThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <form onSubmit={handleAskAi} className="relative group shadow-2xl rounded-full">
            <div className="relative bg-white rounded-full p-2 pl-5 flex items-center gap-3 border border-slate-200 shadow-sm transition-shadow group-hover:shadow-md">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => {
                        if (chatHistory.length > 0) setShowChat(true);
                    }}
                    placeholder="Ask a question..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-[15px] h-10 outline-none min-w-0"
                />
                
                <div className="flex items-center gap-2 pr-1">
                    <span className="text-[10px] font-medium text-slate-300 border border-slate-200 rounded px-1.5 py-0.5 hidden sm:block">⌘I</span>
                    <Button 
                        type="submit" 
                        size="icon" 
                        className={`rounded-full h-9 w-9 shrink-0 transition-all duration-200 ${
                            prompt.trim() 
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg' 
                                : 'bg-slate-100 text-slate-300'
                        }`}
                        disabled={!prompt.trim() || isAiThinking}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}