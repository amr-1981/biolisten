import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Compass, 
  RotateCcw, 
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Headphones
} from 'lucide-react';

export default function DashboardView({ 
  curriculum, 
  completedLessons, 
  studyTimeSeconds, 
  streak, 
  attempts, 
  lessonMasteries,
  studentName,
  onGoToLesson,
  onStartPractice
}) {
  // Compute real metrics strictly from student activities
  const totalLessonsCount = curriculum.reduce((acc, u) => acc + u.lessons.length, 0);
  const completedLessonsCount = completedLessons.length;
  const curriculumProgressPct = Math.round((completedLessonsCount / totalLessonsCount) * 100);

  const formatStudyTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs} ساعة و ${mins % 60} دقيقة`;
    return `${mins} دقيقة`;
  };

  // Compute test accuracy from actual submitted attempts
  let totalAnsweredQuestions = 0;
  let totalCorrectAnswers = 0;
  attempts.forEach(a => {
    totalCorrectAnswers += a.score;
    totalAnsweredQuestions += a.totalQuestions;
  });

  const overallAccuracyPct = totalAnsweredQuestions > 0 
    ? Math.round((totalCorrectAnswers / totalAnsweredQuestions) * 100) 
    : null;

  // Exam readiness calculation (based only on real submitted answers + listening)
  // formula: 60% accuracy + 40% completion rate (if tests exist)
  const examReadinessPct = totalAnsweredQuestions > 0
    ? Math.min(100, Math.round((overallAccuracyPct * 0.6) + (curriculumProgressPct * 0.4)))
    : null;

  // Identify strong topics (Mastery >= 75%)
  const strongLessons = [];
  const weakLessons = [];

  Object.entries(lessonMasteries).forEach(([lessonId, score]) => {
    // Find lesson details
    let found = null;
    curriculum.forEach(u => {
      const match = u.lessons.find(l => l.id === lessonId);
      if (match) found = match;
    });

    if (found) {
      if (score >= 75) {
        strongLessons.push({ ...found, score });
      } else if (score < 60) {
        weakLessons.push({ ...found, score });
      }
    }
  });

  // Frequently missed concepts from actual attempts
  const missedAttempts = attempts.filter(a => a.totalQuestions > a.score);

  // Recommended next lesson: first uncompleted lesson in the sequence
  let recommendedNextLesson = null;
  for (const u of curriculum) {
    for (const l of u.lessons) {
      if (!completedLessons.includes(l.id)) {
        recommendedNextLesson = l;
        break;
      }
    }
    if (recommendedNextLesson) break;
  }

  // Recommended revision: lowest scored lesson
  let recommendedRevisionLesson = null;
  if (weakLessons.length > 0) {
    recommendedRevisionLesson = [...weakLessons].sort((a, b) => a.score - b.score)[0];
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Dashboard Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              لوحة الإنجاز التراكمي الموثوقة
            </span>
            <span className="text-xs text-slate-500 font-semibold">مبنية 100% على بياناتك الحقيقية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {studentName ? `سجل تحصيل وإنجاز الطالب: ${studentName}` : 'سجل تحصيلك في مادة الأحياء'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            نظام التقييم لا يعرض أي أرقام عشوائية؛ كل مؤشر هنا نابع من جلسات استماعك واختباراتك الفعلية المسجلة.
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 text-center min-w-[200px]">
          <span className="text-xs font-semibold text-emerald-100 block mb-1">جاهزية الامتحان الوزاري</span>
          {examReadinessPct !== null ? (
            <div>
              <span className="text-3xl font-black">{examReadinessPct}%</span>
              <p className="text-[11px] text-emerald-200 mt-0.5">محسوبة من دقة إجاباتك وإنجازك</p>
            </div>
          ) : (
            <div>
              <span className="text-sm font-bold text-emerald-200">في انتظار أول اختبار</span>
              <p className="text-[10px] text-emerald-100/80 mt-1">ابدأ بحل تمارين الدروس لحساب الجاهزية</p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Completed Lessons */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">الدروس المستمعة</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{completedLessonsCount} / {totalLessonsCount}</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${curriculumProgressPct}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">إنجاز {curriculumProgressPct}% من المنهج</span>
        </div>

        {/* Total Listening & Study Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">وقت الاستماع الفعلي</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatStudyTime(studyTimeSeconds)}</div>
          <span className="text-[11px] text-teal-700 font-semibold mt-3 block">وقت محسوب بدقة الثواني</span>
        </div>

        {/* Study Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">المواظبة اليومية</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{streak} {streak === 1 ? 'يوم' : 'أيام'}</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-3 block">معدل دراسة مستمر ونشط</span>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">دقة الإجابات الفعلية</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overallAccuracyPct !== null ? `${overallAccuracyPct}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block font-medium">
            {totalAnsweredQuestions > 0 ? `من واقع ${totalAnsweredQuestions} أسئلة مجابة` : 'لم تُجب عن أسئلة بعد'}
          </span>
        </div>

      </div>

      {/* Next Recommended Actions (Lesson & Revision) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommended Next Lesson */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-md border border-teal-900/40">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-base">الدرس القادم الموصى به</h3>
          </div>

          {recommendedNextLesson ? (
            <div>
              <span className="text-xs text-teal-300 font-bold bg-teal-950/80 px-2.5 py-0.5 rounded border border-teal-800">
                الدرس {recommendedNextLesson.lessonNumber} • ص {recommendedNextLesson.bookPages}
              </span>
              <h4 className="text-lg font-black mt-2 mb-2">{recommendedNextLesson.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                {recommendedNextLesson.summary}
              </p>
              <button
                onClick={() => onGoToLesson(recommendedNextLesson)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition-all hover:scale-105"
              >
                <Headphones className="w-4 h-4" />
                استمع لهذا الدرس الآن
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-300 py-4">
              ما شاء الله! لقد أتممت الاستماع لكافة دروس المنهج المدرسي كاملاً. يمكنك تكرار الاختبارات لرفع الجاهزية.
            </p>
          )}
        </div>

        {/* Recommended Targeted Revision */}
        <div className="bg-gradient-to-br from-amber-950/90 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-amber-900/40">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">جلسة المراجعة المركزة</h3>
          </div>

          {recommendedRevisionLesson ? (
            <div>
              <span className="text-xs text-amber-300 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                إتقانك فيه: {recommendedRevisionLesson.score}% (يحتاج تعزيز)
              </span>
              <h4 className="text-lg font-black mt-2 mb-2">{recommendedRevisionLesson.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                بناءً على أخطائك في التمارين السابقة، نوصيك بالاستماع للشرح التبسيطي وإعادة حل الأسئلة.
              </p>
              <button
                onClick={() => onGoToLesson(recommendedRevisionLesson)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all hover:scale-105"
              >
                بدء مراجعة هذا الدرس
              </button>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-slate-300 mb-4">
                لا توجد نقاط ضعف حالية تتطلب مراجعة فورية. واصل حل التمارين لتحديد مستواك الدقيق.
              </p>
              <button
                onClick={() => onStartPractice()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20"
              >
                الانتقال للتدريبات
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Strong vs Weak Topics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strong Topics (>= 75%) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">الموضوعات المتقنة (نقاط القوة)</h3>
          </div>

          {strongLessons.length > 0 ? (
            <div className="space-y-3">
              {strongLessons.map(l => (
                <div key={l.id} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-emerald-950">{l.title}</h5>
                    <span className="text-[11px] text-emerald-700 font-semibold">{l.lessonNumber} • ص {l.bookPages}</span>
                  </div>
                  <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                    {l.score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              لم تصل لأكثر من 75% في أي درس بعد، أو أنك لم تجرِ تمارين كافية. حل التمارين لتظهر موضوعاتك المتقنة هنا.
            </p>
          )}
        </div>

        {/* Weak Topics (< 60%) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-slate-900 text-base">موضوعات تتطلب مراجعة إضافية</h3>
          </div>

          {weakLessons.length > 0 ? (
            <div className="space-y-3">
              {weakLessons.map(l => (
                <div key={l.id} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-rose-950">{l.title}</h5>
                    <span className="text-[11px] text-rose-700 font-semibold">{l.lessonNumber} • ص {l.bookPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-1 rounded-lg">
                      {l.score}%
                    </span>
                    <button
                      onClick={() => onGoToLesson(l)}
                      className="text-xs text-rose-800 hover:underline font-bold"
                    >
                      استمع
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              رائع! لا توجد درجات أقل من 60% في أي درس قمت باختباره حتى الآن.
            </p>
          )}
        </div>

      </div>

      {/* Real Quiz History (سجل الاختبارات الفعلية) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">سجل الاختبارات والتمارين الفعلية</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">{attempts.length} محاولات مسجلة</span>
        </div>

        {attempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 font-bold">التاريخ</th>
                  <th className="py-2.5 font-bold">نوع النشاط</th>
                  <th className="py-2.5 font-bold">النتيجة</th>
                  <th className="py-2.5 font-bold">نسبة الدقة</th>
                  <th className="py-2.5 font-bold">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.slice().reverse().map((att, idx) => {
                  const pct = Math.round((att.score / att.totalQuestions) * 100);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-600">{att.dateStr || 'اليوم'}</td>
                      <td className="py-3 font-bold text-slate-900">
                        {att.type === 'lesson' ? 'تمارين درس محدد' :
                         att.type === 'unit' ? 'اختبار وحدة' :
                         att.type === 'mixed' ? 'مراجعة مختلطة' : 'امتحان وزاري موقوت'}
                      </td>
                      <td className="py-3 font-black text-slate-900">{att.score} من {att.totalQuestions}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          pct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          pct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-500">
                        {pct >= 80 ? 'إتقان تام' : pct >= 60 ? 'جيد جداً' : 'يحتاج مراجعة'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">لم تقم بحل أي تمارين بعد. ابدأ أول تمرين لحفظ نتائجك هنا.</p>
          </div>
        )}
      </div>

    </div>
  );
}
