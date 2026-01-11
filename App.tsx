import React, { useState, useEffect } from 'react';
import AssessmentForm from './components/AssessmentForm';
import AdminDashboard from './components/AdminDashboard';
import { AssessmentResponse } from './types';
import { LayoutDashboard, FileText, CheckCircle2, Download, Database, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'admin' | 'success'>('form');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [lastSubmitted, setLastSubmitted] = useState<AssessmentResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // ⚠️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⚠️
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3JN4NhMxdINS2805ef9eCvk8KOWOxS99A3FMcd95w07f2j0ZTNcBfQeIE5s66Wg6WJg/exec";

  useEffect(() => {
    // Check for previous submission
    const hasSubmitted = localStorage.getItem('hasSubmitted');
    const savedResponse = localStorage.getItem('lastSubmitted');
    
    if (hasSubmitted) {
      if (savedResponse) {
        try {
          setLastSubmitted(JSON.parse(savedResponse));
        } catch (e) {
          console.error("Error parsing saved response", e);
        }
      } else {
         setLastSubmitted({ employeeName: 'الموظف' } as AssessmentResponse);
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      const isSubmitted = localStorage.getItem('hasSubmitted');

      if (hash === '#admin') {
        setView('admin');
      } else if (isSubmitted) {
        setView('success');
        if (hash !== '#success') window.location.hash = 'success';
      } else if (hash === '#success') {
        setView('success');
      } else {
        setView('form');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch responses when entering admin view and authenticated
  useEffect(() => {
    if (view === 'admin' && isAuthenticated) {
      if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
        console.warn("Please set the GOOGLE_SCRIPT_URL in App.tsx");
        return;
      }

      fetch(`${GOOGLE_SCRIPT_URL}?action=read`)
        .then(res => res.json())
        .then(data => setResponses(data))
        .catch(err => console.error('Failed to fetch responses', err));
    }
  }, [view, isAuthenticated]);

  const handleSubmit = async (response: AssessmentResponse) => {
    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
      alert("Please configure the Google Script URL in the code first!");
      return;
    }

    try {
      console.log('Sending data to:', GOOGLE_SCRIPT_URL);
      
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(response),
      });

      const result = await res.json();
      console.log('Submission result:', result);

      if (result.result === 'success') {
        setLastSubmitted(response);
        // Save to localStorage to prevent resubmission
        localStorage.setItem('hasSubmitted', 'true');
        localStorage.setItem('lastSubmitted', JSON.stringify(response));
        window.location.hash = 'success';
      } else {
        console.error('Script returned error:', result);
        alert(`حدث خطأ أثناء إرسال النموذج: ${result.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو إعدادات رابط جوجل شيت.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check since we are serverless
    if (password === 'admin123') {
       setIsAuthenticated(true);
       setLoginError('');
    } else {
       setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleImport = (newResponses: AssessmentResponse[]) => {
    // For now, imports in admin dashboard just update local state or could POST to backend
    // Implementing simpler version where it just updates view
    const updated = [...responses, ...newResponses];
    const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
    setResponses(unique);
    // Optionally save imported ones to backend:
    newResponses.forEach(r => handleSubmit(r));
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
            <AssessmentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!isAuthenticated ? (
              <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex justify-center mb-6">
                  <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
                    <Lock size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-center text-slate-800 mb-2">تسجيل دخول المسؤول</h2>
                <p className="text-center text-slate-500 mb-8">يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-center text-lg"
                      placeholder="كلمة المرور"
                      autoFocus
                    />
                  </div>
                  {loginError && (
                    <p className="text-red-500 text-sm text-center font-bold">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    دخول
                  </button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                responses={responses} 
                onImport={handleImport} 
                onClear={() => setResponses([])} 
              />
            )}
          </div>
        )}

        {view === 'success' && (
          <div className="max-w-2xl mx-auto mt-20 bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">تم إرسال التقييم بنجاح!</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              {lastSubmitted ? (
                <>
                  شكرًا لك {lastSubmitted.employeeName}.<br/>
                  تم حفظ تقييمك بنجاح في النظام ويمكن للمسؤولين الاطلاع عليه.
                </>
              ) : (
                <>
                  لقد قمت بإرسال التقييم مسبقاً.<br/>
                  لا يمكن إرسال تقييم جديد.
                </>
              )}
            </p>
            
            {lastSubmitted && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('hasSubmitted');
                    localStorage.removeItem('lastSubmitted');
                    setLastSubmitted(null);
                    setView('form');
                    window.location.hash = 'form';
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  <FileText size={20} />
                  بدء تقييم جديد
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
