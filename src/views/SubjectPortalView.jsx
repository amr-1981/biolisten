import React, { useState } from 'react';
import { 
  Sparkles, 
  Headphones, 
  BookOpen, 
  Award, 
  User, 
  ArrowLeft, 
  FlaskConical, 
  Zap, 
  Calculator, 
  Languages, 
  BookMarked,
  Lock,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const SUBJECTS_CONFIG = [
  {
    id: 'biology',
    name: 'علم الأحياء',
    enName: 'Biology',
    grade: 'السنة الثالثة من مرحلة التعليم الثانوي (القسم العلمي)',
    curriculum: 'المنهج الليبي الرسمي المعتمد 2025 - 2026م',
    description: 'شامل لكافة الوحدات الست (الكائنات الدقيقة، علم البيئة، التكاثر في النبات، التكاثر في الحيوان، الوراثة والهندسة الوراثية) + كراسة النشاط العملي والامتحانات.',
    icon: Headphones,
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-300',
    badge: 'متاح ومفعل بالكامل',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    available: true,
    stats: {
      units: 6,
      lessons: 14,
      terms: 30,
      hasPractical: true
    }
  },
  {
    id: 'chemistry',
    name: 'الكيمياء',
    enName: 'Chemistry',
    grade: 'الشهادة الثانوية (القسم العلمي)',
    curriculum: 'المنهج الليبي الرسمي',
    description: 'الكيمياء العضوية، الكيمياء الفيزيائية، الاتزان الكيميائي، والتحليل الكيميائي مع شروحات صوتية مبسطة وتجارب معملية.',
    icon: FlaskConical,
    color: 'sky',
    gradient: 'from-sky-600 to-blue-700',
    borderColor: 'border-slate-200',
    badge: 'قريباً جداً',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
    available: false,
    stats: {
      units: 5,
      status: 'قيد إعداد المحتوى الصوتي'
    }
  },
  {
    id: 'physics',
    name: 'الفيزياء',
    enName: 'Physics',
    grade: 'الشهادة الثانوية (القسم العلمي)',
    curriculum: 'المنهج الليبي الرسمي',
    description: 'الكهرباء الساكنة والتيار، الكهرومغناطيسية، والفيزياء الذرية والإشعاعية مع حلول المسائل بالاستماع والشرح التفاعلي.',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-600 to-orange-700',
    borderColor: 'border-slate-200',
    badge: 'قريباً',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
    available: false,
    stats: {
      units: 6,
      status: 'قيد الإعداد'
    }
  },
  {
    id: 'math',
    name: 'الرياضيات والميكانيكا',
    enName: 'Mathematics & Mechanics',
    grade: 'الشهادة الثانوية (القسم العلمي)',
    curriculum: 'المنهج الليبي الرسمي',
    description: 'التفاضل والتكامل، المصفوفات، قوانين نيوتن، والميكانيكا التطبيقية مع تبسيط الخطوات الرياضية ذهنياً.',
    icon: Calculator,
    color: 'indigo',
    gradient: 'from-indigo-600 to-purple-700',
    borderColor: 'border-slate-200',
    badge: 'قريباً',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
    available: false,
    stats: {
      units: 7,
      status: 'قيد الإعداد'
    }
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية',
    enName: 'English for Libya',
    grade: 'Secondary 3 Scientific',
    curriculum: 'Ministry of Education Curriculum',
    description: 'Reading texts, vocabulary, listening audios, grammar focus, and official past exam papers.',
    icon: Languages,
    color: 'rose',
    gradient: 'from-rose-600 to-pink-700',
    borderColor: 'border-slate-200',
    badge: 'قريباً',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
    available: false,
    stats: {
      units: 8,
      status: 'قيد الإعداد'
    }
  },
  {
    id: 'arabic',
    name: 'اللغة العربية والأدب',
    enName: 'Arabic Language',
    grade: 'الشهادة الثانوية',
    curriculum: 'المنهج الليبي المعتمد',
    description: 'شرح مسموع لقصائد الأدب والنصوص، وقواعد النحو والصرف، والبلاغة والنقد بأسلوب شائق ممتع.',
    icon: BookMarked,
    color: 'teal',
    gradient: 'from-teal-600 to-emerald-800',
    borderColor: 'border-slate-200',
    badge: 'قريباً',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
    available: false,
    stats: {
      units: 6,
      status: 'قيد الإعداد'
    }
  }
];

export default function SubjectPortalView({ 
  studentName, 
  onSaveStudentName, 
  onSelectSubject 
}) {
  const [tempName, setTempName] = useState(studentName || '');
  const [isEditingName, setIsEditingName] = useState(!studentName);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      onSaveStudentName(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Top Welcome & Student Personalizer */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            منصة الاستماع الذكية للثانوية العامة • EduListen
          </div>

          {/* Personalized Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {studentName ? `أهلاً بك يا ${studentName} 👋` : 'أهلاً بك يا بطل الثانوية 👋'}
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base mt-1.5 font-normal">
                اختر المادة الدراسية التي ترغب في مراجعتها أو الاستماع لشروحاتها واختباراتها اليوم.
              </p>
            </div>

            {/* Student Name Card / Input */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0 min-w-[240px]">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسمك هنا..."
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-xs border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                  >
                    حفظ
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-300 block">الطالب:</span>
                      <strong className="text-xs text-white">{studentName}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-emerald-400 hover:underline font-bold"
                  >
                    تعديل
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Platform Features Pill */}
          <div className="flex flex-wrap gap-3 mt-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              لكل طالب داشبورد مستقلة وخاصة بجهازه
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Headphones className="w-4 h-4 text-teal-400" />
              تعلّم بالاستماع المركز دون إجهاد العينين
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-amber-400" />
              أسئلة وزارية وتصحيح صوتي فوري
            </span>
          </div>

        </div>

        {/* Ambient glow */}
        <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">المواد الدراسية</h2>
            <p className="text-xs text-slate-500 mt-0.5">مناهج الشهادة الثانوية العامة (القسم العلمي) - دولة ليبيا</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            مادة الأحياء مفعلة وجاهزة للدراسة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {SUBJECTS_CONFIG.map((subj) => {
            const Icon = subj.icon;
            const isAvailable = subj.available;

            return (
              <div
                key={subj.id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isAvailable 
                    ? 'border-emerald-300 shadow-md hover:shadow-xl hover:-translate-y-1 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 opacity-80 hover:opacity-100 hover:shadow-sm'
                }`}
              >
                {/* Subject Header */}
                <div className="p-6">
                  
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${subj.gradient} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${subj.badgeColor}`}>
                      {subj.badge}
                    </span>
                  </div>

                  {/* Subject Titles */}
                  <div className="mb-2">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <span>{subj.name}</span>
                      <span className="text-xs font-semibold text-slate-400 font-sans tracking-wide">
                        ({subj.enName})
                      </span>
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                      {subj.grade}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                    {subj.description}
                  </p>

                  {/* Quick Stats for Available Subject */}
                  {isAvailable && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                        <span className="font-black text-emerald-900 block">{subj.stats.units}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">وحدات معتمدة</span>
                      </div>
                      <div className="bg-teal-50/70 p-2 rounded-xl border border-teal-100">
                        <span className="font-black text-teal-900 block">{subj.stats.lessons}</span>
                        <span className="text-[10px] text-teal-700 font-semibold">درساً صوتياً</span>
                      </div>
                      <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                        <span className="font-black text-amber-900 block">{subj.stats.terms}</span>
                        <span className="text-[10px] text-amber-700 font-semibold">مصطلحاً علمياً</span>
                      </div>
                    </div>
                  )}

                  {!isAvailable && (
                    <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{subj.stats.status}</span>
                    </div>
                  )}

                </div>

                {/* Bottom Action Footer */}
                <div className="p-6 pt-0">
                  {isAvailable ? (
                    <button
                      onClick={() => onSelectSubject(subj.id)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>دخول مادة الأحياء وبدء المذاكرة</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>قيد التجهيز من كتاب الوزارة</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
