import React from 'react';
import { 
  Headphones, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  Bookmark, 
  HelpCircle, 
  ShieldCheck, 
  Flame, 
  Clock,
  Layers,
  User
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  streak, 
  studyTimeSeconds, 
  studentName,
  onOpenPrivacy,
  onBackToPortal 
}) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours} س و ${mins % 60} د`;
    }
    return `${mins} دقيقة`;
  };

  const navItems = [
    { id: 'curriculum', label: 'المنهج والدروس', icon: BookOpen },
    { id: 'player', label: 'المشغل الصوتي', icon: Headphones },
    { id: 'practice', label: 'التدريبات والامتحانات', icon: CheckCircle2 },
    { id: 'dashboard', label: 'لوحة الأداء', icon: BarChart3 },
    { id: 'glossary', label: 'بنك المصطلحات', icon: Bookmark },
    { id: 'questions', label: 'بنك الأسئلة', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('curriculum')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">BioListen</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  الأحياء بالاستماع
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">الشهادة الثانوية العامة - القسم العلمي (ليبيا)</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all ml-1"
              title="العودة لصفحة اختيار المواد"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>المواد الدراسية</span>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Student Stats & Privacy Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Student Name Greeting */}
            {studentName ? (
              <div 
                onClick={onBackToPortal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                title="تعديل اسم الطالب"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{studentName}</span>
              </div>
            ) : null}

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold" title="أيام الدراسة المتتالية">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak} {streak === 1 ? 'يوم' : 'أيام'}</span>
            </div>

            {/* Total Study Time */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold" title="إجمالي وقت الاستماع والمذاكرة">
              <Clock className="w-4 h-4 text-teal-500" />
              <span>{formatTime(studyTimeSeconds)}</span>
            </div>

            {/* Privacy & Data Management */}
            <button
              onClick={onOpenPrivacy}
              className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="إدارة البيانات والخصوصية"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none items-center">
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المواد</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
