
import React, { useState, useEffect } from 'react';
import { PERFORMANCE_FACTORS, RATING_LABELS, PROMOTION_OPTIONS } from '../constants';
import { AssessmentResponse } from '../types';
import { Save, User, ArrowRight, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';

interface AssessmentFormProps {
  onSubmit: (response: AssessmentResponse) => void;
  isSubmitting: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    nationalId: '',
    mobileNumber: '',
    jobTitle: '',
    location: '',
    reviewDate: new Date().toISOString().split('T')[0],
    ratings: {} as Record<string, number>,
    improvementAreas: '',
    plannedActions: '',
    trainingActivities: '',
    promotionPotential: '',
    currentCapabilities: '',
    employeeComments: ''
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  // Step Mapping:
  // 0: Personal Info
  // 1 to N: Factors
  // N+1: Improvement Areas
  // N+2: Planned Actions
  // N+3: Training Activities
  // N+4: Promotion Potential
  // N+5: Current Capabilities
  // N+6: Employee Comments & Submit

  const FACTOR_STEPS_START = 1;
  const FACTOR_STEPS_END = FACTOR_STEPS_START + PERFORMANCE_FACTORS.length - 1;
  const TOTAL_STEPS = FACTOR_STEPS_END + 7;

  const handleRatingChange = (factorId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [factorId]: score }
    }));
    
    // Auto-advance after short delay
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!formData.employeeName) return 'يرجى إدخال الاسم الكامل';
      if (!formData.nationalId) return 'يرجى إدخال الرقم القومي';
      if (!formData.mobileNumber) return 'يرجى إدخال رقم الموبايل';
      if (!formData.jobTitle) return 'يرجى إدخال المسمى الوظيفي';
      if (!formData.location) return 'يرجى إدخال الفرع / الجهة';
      if (!formData.reviewDate) return 'يرجى اختيار التاريخ';
      return null;
    }
    
    if (step >= FACTOR_STEPS_START && step <= FACTOR_STEPS_END) {
      const factorIndex = step - FACTOR_STEPS_START;
      const factor = PERFORMANCE_FACTORS[factorIndex];
      if (!formData.ratings[factor.id]) return 'يرجى اختيار تقييم للمتابعة';
      return null;
    }

    if (step === FACTOR_STEPS_END + 1 && !formData.improvementAreas) return 'هذا الحقل مطلوب';
    if (step === FACTOR_STEPS_END + 2 && !formData.plannedActions) return 'هذا الحقل مطلوب';
    if (step === FACTOR_STEPS_END + 3 && !formData.trainingActivities) return 'هذا الحقل مطلوب';
    if (step === FACTOR_STEPS_END + 4 && !formData.promotionPotential) return 'يرجى اختيار إمكانية الترقية';
    if (step === FACTOR_STEPS_END + 5 && !formData.currentCapabilities) return 'يرجى اختيار القدرات الحالية';
    
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const response: AssessmentResponse = {
      ...formData,
      id: `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    onSubmit(response);
  };

  const renderStepContent = () => {
    // 0. Personal Info
    if (currentStep === 0) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">البيانات الشخصية</h2>
              <p className="text-slate-400 font-medium mt-1">يرجى إدخال بياناتك الأساسية للبدء</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 mr-1">الاسم الكامل</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.employeeName}
                onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="مثال: محمد أحمد"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 mr-1">الرقم القومي</label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={14}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.nationalId}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setFormData({ ...formData, nationalId: val });
                }}
                placeholder="14 رقم"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 mr-1">رقم الموبايل</label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={11}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.mobileNumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setFormData({ ...formData, mobileNumber: val });
                }}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 mr-1">المسمى الوظيفي</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="مثال: مدير مشاريع"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 mr-1">الفرع / الجهة</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-lg font-bold"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="الفرع أو المدينة"
              />
            </div>
            <div className="space-y-2">
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
      );
    }

    // Factors Steps
    if (currentStep >= FACTOR_STEPS_START && currentStep <= FACTOR_STEPS_END) {
      const factorIndex = currentStep - FACTOR_STEPS_START;
      const factor = PERFORMANCE_FACTORS[factorIndex];
      
      return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
           <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-bold mb-4">
              عامل {factorIndex + 1} من {PERFORMANCE_FACTORS.length}
            </span>
            <h2 className="text-3xl font-black mb-4">{factor.title}</h2>
            <p className="text-xl opacity-90 leading-relaxed">{factor.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[5, 4, 3, 2, 1].map(score => (
              <button
                key={score}
                onClick={() => handleRatingChange(factor.id, score)}
                className={`flex items-center justify-between p-6 rounded-[24px] border-2 transition-all group ${
                  formData.ratings[factor.id] === score
                  ? 'bg-indigo-50 border-indigo-600 shadow-inner'
                  : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-colors ${
                     formData.ratings[factor.id] === score ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                  }`}>
                    {score}
                  </span>
                  <span className={`text-lg font-bold ${
                     formData.ratings[factor.id] === score ? 'text-indigo-900' : 'text-slate-600'
                  }`}>
                    {RATING_LABELS[score as keyof typeof RATING_LABELS]}
                  </span>
                </div>
                {formData.ratings[factor.id] === score && (
                  <CheckCircle2 className="text-indigo-600" size={28} />
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Text Steps
    const textSteps = [
      { step: FACTOR_STEPS_END + 1, id: 'improvementAreas', label: 'مجالات التحسين والتطوير', hint: 'اذكر المهارات التي تود اكتسابها لزيادة فعاليتك' },
      { step: FACTOR_STEPS_END + 2, id: 'plannedActions', label: 'الإجراءات المقترحة', hint: 'خطوات عملية ستقوم بها أو تطلب من الشركة توفيرها' },
      { step: FACTOR_STEPS_END + 3, id: 'trainingActivities', label: 'الاحتياجات التدريبية', hint: 'دورات أو ورش عمل ترغب في الانضمام إليها' }
    ];

    const currentTextStep = textSteps.find(s => s.step === currentStep);
    if (currentTextStep) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h2 className="text-3xl font-black text-slate-800 mb-2">{currentTextStep.label}</h2>
            <p className="text-slate-400 font-medium mb-8 text-lg">{currentTextStep.hint}</p>
            <textarea
              required
              autoFocus
              className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-indigo-500 focus:bg-white transition-all outline-none min-h-[250px] text-xl font-bold leading-relaxed shadow-inner"
              value={formData[currentTextStep.id as keyof typeof formData] as string}
              onChange={e => setFormData({ ...formData, [currentTextStep.id]: e.target.value })}
              placeholder="اكتب هنا..."
            />
          </div>
        </div>
      );
    }

    // Radio Steps
    if (currentStep === FACTOR_STEPS_END + 4) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <h2 className="text-3xl font-black text-slate-800 px-2">إمكانية الترقية والنمو</h2>
          <div className="grid grid-cols-1 gap-4">
            {PROMOTION_OPTIONS.map(opt => (
              <label key={opt} className={`flex items-center gap-6 p-8 rounded-[24px] border-2 cursor-pointer transition-all ${
                formData.promotionPotential === opt ? 'bg-indigo-50 border-indigo-600 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  formData.promotionPotential === opt ? 'border-indigo-600' : 'border-slate-300'
                }`}>
                  {formData.promotionPotential === opt && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                </div>
                <input 
                  type="radio" 
                  name="promPotential" 
                  className="hidden"
                  onChange={() => setFormData({...formData, promotionPotential: opt})}
                  checked={formData.promotionPotential === opt}
                />
                <span className={`text-xl font-bold ${formData.promotionPotential === opt ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === FACTOR_STEPS_END + 5) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <h2 className="text-3xl font-black text-slate-800 px-2">القدرات الحالية</h2>
          <p className="text-slate-500 px-2 text-lg">صف قدراتك الحالية التي تؤهلك للمرحلة القادمة</p>
          <div className="grid grid-cols-1 gap-4">
            {PROMOTION_OPTIONS.map(opt => (
              <label key={opt} className={`flex items-center gap-6 p-8 rounded-[24px] border-2 cursor-pointer transition-all ${
                formData.currentCapabilities === opt ? 'bg-indigo-50 border-indigo-600 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  formData.currentCapabilities === opt ? 'border-indigo-600' : 'border-slate-300'
                }`}>
                  {formData.currentCapabilities === opt && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                </div>
                <input 
                  type="radio" 
                  name="currCapabilities" 
                  className="hidden"
                  onChange={() => setFormData({...formData, currentCapabilities: opt})}
                  checked={formData.currentCapabilities === opt}
                />
                <span className={`text-xl font-bold ${formData.currentCapabilities === opt ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Final Step: Comments
    if (currentStep === FACTOR_STEPS_END + 6) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="bg-indigo-900 p-10 rounded-[32px] text-white shadow-2xl shadow-indigo-200">
            <div className="flex items-center gap-4 mb-8">
              <HelpCircle className="text-indigo-400" size={32} />
              <h2 className="text-3xl font-black">تعليقات إضافية</h2>
            </div>
            
            <p className="text-indigo-200 text-lg mb-6">هل لديك أي ملاحظات أخرى تود إضافتها قبل إرسال التقييم؟</p>
            
            <textarea
              className="w-full p-6 bg-indigo-950/50 border-2 border-indigo-800 rounded-[24px] focus:border-indigo-400 focus:bg-indigo-900 transition-all outline-none min-h-[200px] text-white font-medium leading-relaxed mb-8"
              value={formData.employeeComments}
              onChange={e => setFormData({ ...formData, employeeComments: e.target.value })}
              placeholder="اكتب تعليقك هنا (اختياري)..."
            />

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-4 bg-white text-indigo-900 hover:bg-indigo-50 px-12 py-6 rounded-[24px] font-black text-xl transition-all hover:scale-[1.02]"
            >
              <span>حفظ وإرسال التقييم النهائي</span>
              <Save size={24} />
            </button>
          </div>
        </div>
      );
    }
  };

  const progress = Math.round(((currentStep) / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Progress Bar */}
      <div className="fixed top-20 left-0 w-full z-40">
        <div className="h-1.5 bg-slate-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 px-2 mb-8 flex items-center justify-between text-slate-400 font-bold text-sm uppercase tracking-widest">
        <span>خطوة {currentStep + 1} من {TOTAL_STEPS}</span>
        <span>{Math.round(progress)}% مكتمل</span>
      </div>

      {renderStepContent()}

      {/* Navigation Bar */}
      {currentStep < TOTAL_STEPS - 1 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                currentStep === 0 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ArrowRight size={20} />
              <span>السابق</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <span>التالي</span>
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentForm;
