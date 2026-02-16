
import React, { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { SYNC_CHANNEL_NAME } from '../constants';
import { analyzeStudySession } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Activity, Users, PieChart, Bell, Settings, 
  ChevronRight, BrainCircuit, Star, Clock 
} from 'lucide-react';

const STATS_DATA = [
  { name: 'Mon', minutes: 45 },
  { name: 'Tue', minutes: 120 },
  { name: 'Wed', minutes: 30 },
  { name: 'Thu', minutes: 90 },
  { name: 'Fri', minutes: 150 },
  { name: 'Sat', minutes: 200 },
  { name: 'Sun', minutes: 0 },
];

const ParentDashboard: React.FC = () => {
  const [activeChild, setActiveChild] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data.type === 'STATUS_CHANGE') {
        setActiveChild(event.data.payload.isStudying ? event.data.payload : null);
        if (event.data.payload.isStudying) {
          setNotifications(prev => [`${event.data.payload.childName} started ${event.data.payload.subject}`, ...prev.slice(0, 4)]);
        }
      }
    };
    return () => bc.close();
  }, []);

  const handleAIAnalyze = async () => {
    if (!activeChild) return;
    setIsAnalyzing(true);
    const result = await analyzeStudySession(activeChild.subject, 15);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-screen flex bg-slate-50 text-slate-900 overflow-hidden">
      {/* Side Navigation */}
      <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-indigo-600 hidden md:block">StudyLink</h1>
          <div className="bg-indigo-600 p-2 rounded-lg text-white w-10 md:hidden mx-auto">S</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 text-indigo-600 rounded-xl font-semibold">
            <Activity size={24} />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Users size={24} />
            <span className="hidden md:inline">Children</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <PieChart size={24} />
            <span className="hidden md:inline">Reports</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell size={24} />
            <span className="hidden md:inline">Notifications</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Settings size={24} />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Welcome back, Parent!</h2>
            <p className="text-sm text-slate-500">Here's how Ji-won is doing today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img src="https://picsum.photos/40/40?random=1" className="w-10 h-10 rounded-full border-2 border-white" alt="Avatar" />
              <img src="https://picsum.photos/40/40?random=2" className="w-10 h-10 rounded-full border-2 border-white" alt="Avatar" />
            </div>
            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200">
              <Bell size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Feed */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-lg">Live Observation</h3>
                </div>
                {activeChild ? (
                  <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                    {activeChild.childName} is solving {activeChild.subject}
                  </span>
                ) : (
                  <span className="text-sm bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    No active study sessions
                  </span>
                )}
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 min-h-[400px]">
                <DrawingCanvas isReadOnly={true} />
              </div>
            </div>

            {/* Stats & AI */}
            <div className="flex flex-col gap-8">
              {/* Daily Activity */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg mb-4">Study Minutes</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={STATS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {STATS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 5 ? '#4f46e5' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Analysis Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BrainCircuit size={24} />
                  </div>
                  <h3 className="font-bold text-lg">AI Smart Analysis</h3>
                </div>
                {activeChild ? (
                  <div>
                    <p className="text-indigo-100 text-sm mb-6">
                      Get real-time feedback on your child's learning patterns and conceptual understanding.
                    </p>
                    <button 
                      onClick={handleAIAnalyze}
                      disabled={isAnalyzing}
                      className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Generate AI Report'}
                    </button>
                  </div>
                ) : (
                  <p className="text-indigo-200 text-sm">
                    Start a study session on a child's device to enable AI analysis.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Result Modal-like section */}
          {analysisResult && (
            <div className="bg-white border-2 border-indigo-100 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Star size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Learning Insight</h3>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <span>Score: {analysisResult.score}/100</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{width: `${analysisResult.score}%`}} />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-slate-600">
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Summary</h4>
                  <p className="text-slate-600 leading-relaxed">{analysisResult.summary}</p>
                  
                  <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest mt-6">Progress</h4>
                  <p className="text-slate-600 leading-relaxed">{analysisResult.progress}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Clock size={18} /> Parental Coaching Tips
                  </h4>
                  <ul className="space-y-3">
                    {analysisResult.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Section - History/Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
              <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((note, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <ChevronRight size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{note}</p>
                      <p className="text-xs text-slate-400">Just now</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No recent notifications.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
