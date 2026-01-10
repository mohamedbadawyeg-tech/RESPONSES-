
import React, { useState, useEffect } from 'react';
import { PERFORMANCE_FACTORS, RATING_LABELS, PROMOTION_OPTIONS, SUMMARY_RATINGS } from '../constants';
import { AssessmentResponse } from '../types';
import { Save, User, Briefcase, MapPin, Calendar, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AssessmentFormProps {
  onSubmit: (response: AssessmentResponse) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    jobTitle: '',
    location: '',
    reviewDate: new Date().toISOString().split('T')[0],
    ratings: {} as Record<string, number>,
    improvementAreas: '',
    plannedActions: '',
    trainingActivities: '',
    promotionPotential: '',
    currentCapabilities: '',
    summaryRating: '',
    employeeComments: ''
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalFields = 4 + PERFORMANCE_FACTORS.length + 3 + 2 + 1; // Header + Factors + Textareas + Radios + Summary
    let filled = 0;
    if (formData.employeeName) filled++;
    if (formData.jobTitle) filled++;
    if (formData.location) filled++;
    if (formData.reviewDate) filled++;
    filled += Object.keys(formData.ratings).length;
    if (formData.improvementAreas) filled++;
    if (formData.plannedActions) filled++;
    if (formData.trainingActivities) filled++;
    if (formData.promotionPotential) filled++;
    if (formData.currentCapabilities) filled++;
    if (formData.summaryRating) filled++;

    setProgress(Math.round((filled / totalFields) * 100));
  }, [formData]);

  const handleRatingChange = (factorId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [factorId]: score }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.jobTitle) {
      alert('يرجى التأكد من ملء البيانات الأساسية (الاسم والمسمى الوظيفي)');
      return;
    }
    const response: AssessmentResponse = {
      ...formData,
      id: `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    onSubmit(response);
  };

  return (
    <div className="relative">
      {/* Floating Progress Bar */}
      <div className="fixed top-20 left-0 w-full z-40 px-6 py-2 pointer-events-none">
        <div className="max-w-7xl mx-auto h-2 bg-slate-200/50 backdrop-blur-md rounded-full overflow-hidden border border-white/50">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-32 max-w-4xl mx-auto">
        {/* Header Info */}
        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <User size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">البيانات الشخصية</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 mr-1">الاسم الكامل</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.employeeName}
                onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="مثال: محمد أحمد"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 mr-1">المسمى الوظيفي</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="مثال: مدير مشاريع"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 mr-1">مكان العمل</label>
              <input
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="الفرع أو المدينة"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 mr-1">التاريخ</label>
              <input
                type="date"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.reviewDate}
                onChange={e => setFormData({ ...formData, reviewDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Factors Section */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 p-10 text-white">
            <h2 className="text-3xl font-black mb-2">عوامل تقييم الأداء</h2>
            <p className="opacity-80 text-lg">يرجى قراءة كل وصف بعناية واختيار التقييم الذي يمثل مستواك الفعلي</p>
          </div>
          
          <div className="divide-y divide-slate-50">
            {PERFORMANCE_FACTORS.map((factor) => (
              <div key={factor.id} className="p-10 hover:bg-slate-50/50 transition-colors">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-indigo-900 mb-2">{factor.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{factor.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleRatingChange(factor.id, score)}
                      className={`flex-1 min-w-[80px] py-4 rounded-2xl border-2 font-black transition-all ${
                        formData.ratings[factor.id] === score
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {score}
                      <span className="block text-[10px] opacity-70 mt-1">{RATING_LABELS[score as keyof typeof RATING_LABELS]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Sections */}
        {[
          { id: 'improvementAreas', label: 'مجالات التحسين والتطوير:', hint: 'اذكر المهارات التي تود اكتسابها لزيادة فعاليتك' },
          { id: 'plannedActions', label: 'الإجراءات المقترحة:', hint: 'خطوات عملية ستقوم بها أو تطلب من الشركة توفيرها' },
          { id: 'trainingActivities', label: 'الاحتياجات التدريبية:', hint: 'دورات أو ورش عمل ترغب في الانضمام إليها' }
        ].map(field => (
          <div key={field.id} className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
            <label className="block text-2xl font-black text-slate-800 mb-2">{field.label}</label>
            <p className="text-slate-400 mb-6 font-medium text-sm">{field.hint}</p>
            <textarea
              className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-indigo-500 focus:bg-white transition-all outline-none min-h-[160px] text-lg font-bold leading-relaxed shadow-inner"
              value={formData[field.id as keyof typeof formData] as string}
              onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
              placeholder="..."
            />
          </div>
        ))}

        {/* Final Selection */}
        <div className="bg-indigo-900 p-10 rounded-[32px] text-white shadow-2xl shadow-indigo-200">
          <div className="flex items-center gap-4 mb-8">
            <HelpCircle className="text-indigo-400" size={32} />
            <h2 className="text-3xl font-black">الخلاصة والتقييم النهائي</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-lg font-black border-r-4 border-indigo-500 pr-4">إمكانية الترقية</h3>
              <div className="space-y-3">
                {PROMOTION_OPTIONS.map(opt => (
                  <label key={opt} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.promotionPotential === opt ? 'bg-indigo-800 border-indigo-400' : 'bg-indigo-950/50 border-indigo-800/50 hover:border-indigo-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="promPotential" 
                      className="w-5 h-5 accent-indigo-400"
                      onChange={() => setFormData({...formData, promotionPotential: opt})}
                      checked={formData.promotionPotential === opt}
                    />
                    <span className="font-bold text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black border-r-4 border-indigo-500 pr-4">النتيجة الإجمالية</h3>
              <div className="grid grid-cols-1 gap-3">
                {SUMMARY_RATINGS.map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({...formData, summaryRating: rating})}
                    className={`p-5 rounded-2xl border-2 font-black transition-all text-sm text-right ${
                      formData.summaryRating === rating
                      ? 'bg-white text-indigo-900 border-white shadow-xl scale-105'
                      : 'bg-indigo-950/50 border-indigo-800/50 hover:border-indigo-600'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="fixed bottom-8 left-0 w-full px-6 z-40 pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
            <button
              type="submit"
              className="group flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-[28px] font-black text-xl shadow-2xl shadow-indigo-300 hover:-translate-y-1 transition-all"
            >
              <span>حفظ وإرسال التقييم</span>
              <Save size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
