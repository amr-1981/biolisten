import React from 'react';
import { 
  Headphones, 
  BookOpen, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles, 
  Award,
  Layers,
  FileQuestion
} from 'lucide-react';

export default function CurriculumView({ 
  curriculum, 
  completedLessons, 
  lessonMasteries, 
  onSelectLesson, 
  onStartPractice 
}) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            المنهج الرسمي المعتمد • طبعة 2025 - 2026م
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            تعلّم علم الأحياء بالاستماع الذكي
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-normal">
            اختر وحدتك أو درسك واستمع لشروحات صوتية واضحة ومكثفة باللغة العربية الفصحى مبنية بدقة على كتاب الأحياء وكراسة التدريبات لوزارة التربية والتعليم الليبية، ثم عزز فهمك بالتمارين الوزارية الحقيقية.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              6 وحدات دراسية رسمية + كراسة العملي
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Headphones className="w-4 h-4 text-teal-400" />
              شروح صوتية قصيرة ومفصلة ومبسطة
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-amber-400" />
              تقييم حقيقي يعتمد على إجاباتك فقط
            </span>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Units List */}
      <div className="space-y-8">
        {curriculum.map((unit) => {
          const unitCompletedCount = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
          const unitTotal = unit.lessons.length;
          const unitPct = Math.round((unitCompletedCount / unitTotal) * 100);

          return (
            <div 
              key={unit.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Unit Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-emerald-200">
                    {unit.unitNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                        الوحدة {unit.unitNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        صفحات الكتاب: {unit.bookPages}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{unit.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">{unit.description}</p>
                  </div>
                </div>

                {/* Unit Progress Gauge */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-[190px] shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>نسبة إنجاز الاستماع</span>
                    <span className="text-emerald-700">{unitPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${unitPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    {unitCompletedCount} من {unitTotal} دروس مكتملة
                  </p>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {unit.lessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const mastery = lessonMasteries[lesson.id] !== undefined ? lessonMasteries[lesson.id] : null;

                  return (
                    <div
                      key={lesson.id}
                      className="group bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Tags & Book Page */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            الدرس {lesson.lessonNumber}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                            ص {lesson.bookPages}
                          </span>
                        </div>

                        {/* Lesson Title */}
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                          {lesson.title}
                        </h3>

                        {/* Summary preview */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {lesson.summary}
                        </p>
                      </div>

                      {/* Status & CTA Bar */}
                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        {/* Mastery Score Badge */}
                        <div className="flex items-center gap-1.5">
                          {mastery !== null ? (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              mastery >= 80 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : mastery >= 60 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              إتقان الاختبار: {mastery}%
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              لم يتم الاختبار بعد
                            </span>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              مستمع
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectLesson(lesson)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            استمع الآن
                          </button>
                          <button
                            onClick={() => onStartPractice(lesson)}
                            className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                            title="اختبرني في هذا الدرس"
                          >
                            <FileQuestion className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
