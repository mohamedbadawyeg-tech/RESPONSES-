
import React, { useState, useEffect } from 'react';
import AssessmentForm from './components/AssessmentForm';
import AdminDashboard from './components/AdminDashboard';
import { AssessmentResponse } from './types';
import { LayoutDashboard, FileText, CheckCircle2, Download, Database } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'admin' | 'success'>('form');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [lastSubmitted, setLastSubmitted] = useState<AssessmentResponse | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') setView('admin');
      else if (hash === '#success') setView('success');
      else setView('form');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const saved = localStorage.getItem('assessment_responses_v2');
    if (saved) {
      setResponses(JSON.parse(saved));
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = (response: AssessmentResponse) => {
    const updated = [...responses, response];
    setResponses(updated);
    setLastSubmitted(response);
    localStorage.setItem('assessment_responses_v2', JSON.stringify(updated));
    window.location.hash = 'success';
  };

  const handleImport = (newResponses: AssessmentResponse[]) => {
    const updated = [...responses, ...newResponses];
    const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
    setResponses(unique);
    localStorage.setItem('assessment_responses_v2', JSON.stringify(unique));
  };

  const downloadResponse = (res: AssessmentResponse) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `تقييم_${res.employeeName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 overflow-x-hidden font-['Cairo']">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-indigo-950 leading-none">نظام التقييم</h1>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Employee Portal</span>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => window.location.hash = 'form'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
                view === 'form' ? 'bg-white text-indigo-700 shadow-md font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={18} />
              <span className="hidden sm:inline">النموذج</span>
            </button>
            <button
              onClick={() => window.location.hash = 'admin'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
                view === 'admin' ? 'bg-white text-indigo-700 shadow-md font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {view === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AssessmentForm onSubmit={handleSubmit} />
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminDashboard 
              responses={responses} 
              onImport={handleImport} 
              onClear={() => {
                if(confirm('هل أنت متأكد من مسح كافة السجلات؟ لا يمكن التراجع عن هذه الخطوة.')) {
                  setResponses([]);
                  localStorage.removeItem('assessment_responses_v2');
                }
              }}
            />
          </div>
        )}

        {view === 'success' && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] text-center bg-white p-16 rounded-[40px] shadow-2xl shadow-indigo-50 border border-indigo-50 animate-in zoom-in duration-500">
            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-100 animate-bounce">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black mb-4 text-slate-800">تمت العملية بنجاح!</h2>
            <p className="text-slate-500 text-xl mb-10 max-w-lg leading-relaxed">
              شكراً لك <span className="text-indigo-600 font-bold">{lastSubmitted?.employeeName}</span>. 
              لقد قمت بإتمام تقييمك بنجاح. يرجى الضغط على الزر أدناه لتحميل نسخة التقييم وإرسالها لمديرك.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              {lastSubmitted && (
                <button
                  onClick={() => downloadResponse(lastSubmitted)}
                  className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[22px] font-black text-lg transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1"
                >
                  <Download size={24} />
                  <span>تحميل ملف التقييم النهائي</span>
                </button>
              )}
              <button
                onClick={() => window.location.hash = 'form'}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-10 py-5 rounded-[22px] font-bold text-lg transition-all"
              >
                إرسال رد آخر
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        <p className="font-medium">© {new Date().getFullYear()} نظام إدارة المواهب والتقييم الذاتي المؤسسي</p>
      </footer>
    </div>
  );
};

export default App;
