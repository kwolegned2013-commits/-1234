
import React, { useState } from 'react';
import { Role } from './types';
import ChildWorkspace from './components/ChildWorkspace';
import ParentDashboard from './components/ParentDashboard';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.NONE);

  if (role === Role.CHILD) {
    return (
      <div className="relative">
        <ChildWorkspace />
        <button 
          onClick={() => setRole(Role.NONE)}
          className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-slate-700 z-50"
        >
          SWITCH ROLE
        </button>
      </div>
    );
  }

  if (role === Role.PARENT) {
    return (
      <div className="relative">
        <ParentDashboard />
        <button 
          onClick={() => setRole(Role.NONE)}
          className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-slate-700 z-50"
        >
          SWITCH ROLE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-200 mb-4 animate-bounce">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight">
            Study<span className="text-indigo-600">Link</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto">
            Real-time connection between children's learning process and parents' support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Child Role Selection */}
          <button 
            onClick={() => setRole(Role.CHILD)}
            className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 text-left transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-200"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I am a Student</h3>
            <p className="text-slate-500 mb-8">Start your study session, solve problems, and keep track of your progress.</p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all">
              Enter Workspace <ArrowRight size={20} />
            </div>
          </button>

          {/* Parent Role Selection */}
          <button 
            onClick={() => setRole(Role.PARENT)}
            className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 text-left transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-200"
          >
            <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I am a Parent</h3>
            <p className="text-slate-500 mb-8">Monitor handwriting live, view statistics, and get AI-driven learning insights.</p>
            <div className="flex items-center gap-2 text-slate-600 font-bold group-hover:gap-4 transition-all">
              Open Dashboard <ArrowRight size={20} />
            </div>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Tip: Open two windows of this app to see the real-time sync in action!
        </p>
      </div>
    </div>
  );
};

export default App;
