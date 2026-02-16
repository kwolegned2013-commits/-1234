
import React, { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { SUBJECTS, SYNC_CHANNEL_NAME } from '../constants';
import { BookOpen, Play, Pause, CheckCircle, Clock, Info } from 'lucide-react';

const ChildWorkspace: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [isStudying, setIsStudying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isStudying) {
      interval = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStudy = () => {
    const newState = !isStudying;
    setIsStudying(newState);
    const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
    bc.postMessage({ 
      type: 'STATUS_CHANGE', 
      payload: { 
        isStudying: newState, 
        subject: selectedSubject.name,
        childName: 'Ji-won' 
      } 
    });
    bc.close();
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">StudyLink <span className="text-sm font-normal text-indigo-600 ml-2">Child Mode</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <Clock size={18} className="text-slate-500" />
            <span className="font-mono text-lg font-bold tabular-nums">{formatTime(time)}</span>
          </div>
          <button 
            onClick={toggleStudy}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-md ${
              isStudying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isStudying ? (
              <><Pause size={20} /> Pause Study</>
            ) : (
              <><Play size={20} /> Start Study</>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-6 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Subjects</h2>
            <div className="space-y-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => !isStudying && setSelectedSubject(subject)}
                  disabled={isStudying}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedSubject.id === subject.id 
                      ? `${subject.color} text-white shadow-lg` 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  } ${isStudying && selectedSubject.id !== subject.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl">{subject.icon}</span>
                  <span className="font-medium">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-2">
              <Info size={18} /> How to Use
            </h3>
            <ul className="text-indigo-700 text-xs space-y-2 list-disc pl-4 leading-relaxed">
              <li>Click the <b>Image</b> button to upload your worksheet.</li>
              <li>Use the pen tools to solve problems directly on the image.</li>
              <li>Your parent can see your work live in real-time!</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-auto">
            <h3 className="text-slate-900 font-bold flex items-center gap-2 mb-2">
              <CheckCircle size={18} /> Today's Goal
            </h3>
            <div className="mt-2 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-1/3" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">1/3 Tasks Completed</p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Session: <span className="text-indigo-600">{selectedSubject.name}</span>
            </h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isStudying ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {isStudying ? '● Live Sharing' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <DrawingCanvas />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildWorkspace;
