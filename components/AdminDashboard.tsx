
import React, { useState, useRef, useMemo } from 'react';
import { AssessmentResponse } from '../types';
import { PERFORMANCE_FACTORS } from '../constants';
import { Search, Download, Trash2, Eye, User, FileSpreadsheet, Filter, Copy, Upload, AlertCircle, FileText, PieChart, TrendingUp, Users, Printer } from 'lucide-react';

interface AdminDashboardProps {
  responses: AssessmentResponse[];
  onImport: (data: AssessmentResponse[]) => void;
  onClear: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ responses, onImport, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<AssessmentResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (responses.length === 0) return null;
    
    let totalScore = 0;
    let totalRatings = 0;
    responses.forEach(r => {
      // Cast Object.values to number[] to fix 'unknown' type error in totalScore += s
      (Object.values(r.ratings) as number[]).forEach(s => {
        totalScore += s;
        totalRatings++;
      });
    });

    const avg = totalRatings > 0 ? (totalScore / totalRatings).toFixed(1) : 0;
    const topPerformer = responses.reduce((prev, current) => {
      // Cast Object.values to number[] to fix 'unknown' type errors in addition operation (a + b)
      const prevSum = (Object.values(prev.ratings) as number[]).reduce((a, b) => (a as number) + (b as number), 0);
      const currSum = (Object.values(current.ratings) as number[]).reduce((a, b) => (a as number) + (b as number), 0);
      return currSum > prevSum ? current : prev;
    });

    return { avg, count: responses.length, topPerformer };
  }, [responses]);

  const filteredResponses = responses.filter(r => 
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ('files' in e) {
      files = (e as React.ChangeEvent<HTMLInputElement>).target.files;
    } else {
      files = (e as React.DragEvent).dataTransfer.files;
      e.preventDefault();
      setIsDragging(false);
    }

    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const json = JSON.parse(result);
            if (json && json.employeeName) onImport([json]);
          }
        } catch (err) { console.error(err); }
      };
      reader.readAsText(file);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
              <Users size={32} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">إجمالي الموظفين</p>
              <h4 className="text-3xl font-black text-slate-800">{stats.count}</h4>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">متوسط الأداء العام</p>
              <h4 className="text-3xl font-black text-slate-800">{stats.avg} / 5</h4>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
              <PieChart size={32} />
            </div>
            <div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">الأداء الأعلى</p>
              <h4 className="text-lg font-black text-slate-800 truncate max-w-[150px]">{stats.topPerformer.employeeName}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800">قاعدة البيانات المجمعة</h2>
            <p className="text-slate-400 font-medium">قم برفع ملفات الموظفين هنا لتحديث النتائج</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
            >
              <Upload size={20} />
              <span>رفع الردود (JSON)</span>
            </button>
            <button
              onClick={onClear}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 px-6 py-4 rounded-2xl font-bold transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileUpload}
          className={`h-32 border-2 border-dashed rounded-[24px] flex items-center justify-center transition-all ${
            isDragging ? 'border-indigo-500 bg-indigo-50 text-indigo-700 scale-[0.99]' : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          <p className="font-bold">اسحب ملفات الردود هنا للاستيراد السريع</p>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept=".json" />
        </div>

        {/* Search & Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="البحث عن موظف بالاسم أو الوظيفة..."
            className="w-full px-14 py-5 bg-slate-50 border-2 border-transparent rounded-[20px] focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
        </div>

        {/* Responses Table */}
        <div className="overflow-x-auto rounded-[24px] border border-slate-50">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">الموظف</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">المسمى الوظيفي</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">رقم الموبايل</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">التقييم العام</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResponses.map(res => {
                const avgScore = Object.values(res.ratings).length > 0 
                  ? (Object.values(res.ratings).reduce((a, b) => a + b, 0) / Object.values(res.ratings).length).toFixed(1)
                  : '-';
                  
                return (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">
                        {res.employeeName.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-slate-700">{res.employeeName}</span>
                        <span className="text-xs text-slate-400">{res.nationalId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-bold">{res.jobTitle}</td>
                  <td className="px-8 py-6 text-slate-500 font-bold" dir="ltr">{res.mobileNumber}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${
                      Number(avgScore) >= 4 ? 'bg-green-100 text-green-700' : 
                      Number(avgScore) >= 3 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {avgScore} / 5
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => setSelectedResponse(res)}
                      className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Eye size={22} />
                    </button>
                  </td>
                </tr>
              )})}
              {filteredResponses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic font-medium">لا توجد بيانات متاحة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-slate-950/80 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-white w-full max-w-5xl max-h-full overflow-y-auto rounded-[40px] shadow-2xl animate-in zoom-in duration-300 print:shadow-none print:rounded-none">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-8 flex justify-between items-center z-20 print:hidden">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100">
                  {selectedResponse.employeeName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-none mb-1">{selectedResponse.employeeName}</h2>
                  <p className="text-slate-400 font-bold text-sm uppercase">{selectedResponse.jobTitle}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handlePrint}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                >
                  <Printer size={20} />
                  <span>طباعة التقرير</span>
                </button>
                <button 
                  onClick={() => setSelectedResponse(null)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block p-10 border-b-4 border-indigo-600 mb-10">
              <h1 className="text-4xl font-black text-slate-900 mb-2">تقرير التقييم الذاتي للموظف</h1>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <p><strong>الاسم:</strong> {selectedResponse.employeeName}</p>
                <p><strong>الرقم القومي:</strong> {selectedResponse.nationalId}</p>
                <p><strong>الوظيفة:</strong> {selectedResponse.jobTitle}</p>
                <p><strong>رقم الموبايل:</strong> {selectedResponse.mobileNumber}</p>
                <p><strong>التاريخ:</strong> {selectedResponse.reviewDate}</p>
                <p><strong>الموقع:</strong> {selectedResponse.location}</p>
              </div>
            </div>
            
            <div className="p-10 space-y-12">
              {/* Ratings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <h3 className="col-span-full text-xl font-black text-indigo-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                  نتائج عوامل الأداء
                </h3>
                {PERFORMANCE_FACTORS.map(f => (
                  <div key={f.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                    <span className="text-sm font-bold text-slate-600">{f.title}</span>
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                      (selectedResponse.ratings[f.id] || 0) >= 4 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}>
                      {selectedResponse.ratings[f.id] || '-'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Qualitative Sections */}
              <div className="space-y-8">
                {[
                  { label: 'مجالات التحسين المستهدفة', text: selectedResponse.improvementAreas, color: 'bg-indigo-50 border-indigo-100 text-indigo-900' },
                  { label: 'الإجراءات والخطوات المخطط لها', text: selectedResponse.plannedActions, color: 'bg-emerald-50 border-emerald-100 text-emerald-900' },
                  { label: 'الاحتياجات التدريبية والتطويرية', text: selectedResponse.trainingActivities, color: 'bg-amber-50 border-amber-100 text-amber-900' },
                  { label: 'تعليقات الموظف الإضافية', text: selectedResponse.employeeComments, color: 'bg-slate-50 border-slate-100 text-slate-900' }
                ].map((sec, i) => (
                  <div key={i} className={`p-8 rounded-[32px] border ${sec.color}`}>
                    <h4 className="font-black text-lg mb-4 underline decoration-2 underline-offset-8">{sec.label}</h4>
                    <p className="whitespace-pre-wrap leading-relaxed font-bold">{sec.text || 'لم يتم تقديم تعليق'}</p>
                  </div>
                ))}
              </div>

              {/* Status Section */}
              <div className="bg-slate-900 p-10 rounded-[40px] text-white flex flex-col md:flex-row justify-between gap-10 items-center">
                <div className="text-center md:text-right flex-1">
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">إمكانية الترقية والنمو</p>
                  <h4 className="text-2xl font-black">{selectedResponse.promotionPotential || '-'}</h4>
                </div>
                <div className="w-px h-16 bg-slate-800 hidden md:block"></div>
                <div className="text-center md:text-center flex-1">
                   <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">القدرات الحالية</p>
                   <h4 className="text-2xl font-black">{selectedResponse.currentCapabilities || '-'}</h4>
                </div>
                <div className="w-px h-16 bg-slate-800 hidden md:block"></div>
                <div className="text-center md:text-left flex-1">
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">التقييم الإجمالي النهائي</p>
                  <h4 className="text-3xl font-black text-indigo-300">
                    {Object.values(selectedResponse.ratings).length > 0 
                      ? (Object.values(selectedResponse.ratings).reduce((a, b) => a + b, 0) / Object.values(selectedResponse.ratings).length).toFixed(1)
                      : '-'
                    }
                  </h4>
                </div>
              </div>
            </div>
            
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
              <button 
                onClick={() => setSelectedResponse(null)}
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .fixed { position: static !important; }
          main { padding: 0 !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
