import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  RotateCcw, 
  Clock, 
  Award, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { speech } from '../services/speechService';
import { storageService } from '../services/storageService';

export default function PracticeView({ 
  curriculum, 
  questions, 
  initialLesson, 
  onGoToLesson, 
  onRecordAttempt 
}) {
  const [selectedMode, setSelectedMode] = useState(initialLesson ? 'lesson' : 'unit');
  const [selectedUnitId, setSelectedUnitId] = useState(initialLesson ? initialLesson.unitId : 'unit-1');
  const [selectedLessonId, setSelectedLessonId] = useState(initialLesson ? initialLesson.id : 'lesson-1-1');
  
  // Quiz runtime state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: selectedOptionIndex }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default for timed exam

  // Filter questions according to mode
  const setupQuiz = (mode, unitId = selectedUnitId, lessonId = selectedLessonId) => {
    let pool = [];

    if (mode === 'lesson') {
      pool = questions.filter(q => q.lessonId === lessonId);
      if (pool.length === 0) pool = questions.filter(q => q.unitId === unitId);
    } else if (mode === 'unit') {
      pool = questions.filter(q => q.unitId === unitId);
    } else if (mode === 'mixed') {
      // 8 mixed questions from across all units
      pool = [...questions].sort(() => 0.5 - Math.random()).slice(0, 8);
    } else if (mode === 'timed') {
      // Timed official exam simulation: includes questions from all units + exam model
      pool = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);
      setTimeRemaining(600);
    }

    if (pool.length === 0) pool = questions.slice(0, 5);

    setActiveQuestions(pool);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizStarted(true);
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleReadQuestion = (q) => {
    const textToRead = `${q.question}. الخيارات هي: ` + q.options.join('، ');
    speech.speak(textToRead);
  };

  const handleReadExplanation = (q) => {
    speech.speak(q.audioExplanation || q.simpleArabicExplanation);
  };

  const handleSubmitQuiz = () => {
    // Only calculate score if at least 1 question is actually answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount === 0) {
      alert('يرجى الإجابة عن الأسئلة قبل تسليم الاختبار.');
      return;
    }

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const attempt = {
      id: 'attempt-' + Date.now(),
      type: selectedMode,
      unitId: selectedUnitId,
      lessonId: selectedMode === 'lesson' ? selectedLessonId : null,
      score: correctCount,
      totalQuestions: activeQuestions.length,
      answers: selectedAnswers
    };

    storageService.recordAttempt(attempt);
    if (onRecordAttempt) onRecordAttempt(attempt);

    setIsSubmitted(true);
    speech.speak(`تم تصحيح الاختبار بنجاح. نتيجتك هي ${correctCount} من إجمالي ${activeQuestions.length} أسئلة.`);
  };

  const currentQ = activeQuestions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Practice Header & Modes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                منطقة التدريب والامتحانات
              </span>
              <span className="text-xs text-slate-500 font-semibold">أسئلة وزارية معتمدة من كراسة التدريبات</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">اختبر فهمك وثبّت معلوماتك بالصوت</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              لا توجد درجات عشوائية أو وهمية؛ النتائج تعتمد حصرياً على إجاباتك الفعلية مع شرح صوتي فوري لكل خطأ.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => { setSelectedMode('lesson'); setQuizStarted(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === 'lesson' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              تمارين الدرس
            </button>
            <button
              onClick={() => { setSelectedMode('unit'); setQuizStarted(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === 'unit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              اختبار الوحدة
            </button>
            <button
              onClick={() => { setSelectedMode('mixed'); setQuizStarted(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === 'mixed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              مراجعة مختلطة
            </button>
            <button
              onClick={() => { setSelectedMode('timed'); setQuizStarted(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === 'timed' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              امتحان موقوت
            </button>
          </div>
        </div>

        {/* Configuration selectors when quiz is not active */}
        {!quizStarted && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Unit selector */}
              {(selectedMode === 'lesson' || selectedMode === 'unit') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">اختر الوحدة الدراسية:</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => {
                      setSelectedUnitId(e.target.value);
                      const unit = curriculum.find(u => u.id === e.target.value);
                      if (unit && unit.lessons[0]) setSelectedLessonId(unit.lessons[0].id);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {curriculum.map(u => (
                      <option key={u.id} value={u.id}>الوحدة {u.unitNumber}: {u.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lesson selector */}
              {selectedMode === 'lesson' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">اختر الدرس المستهدف:</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {curriculum.find(u => u.id === selectedUnitId)?.lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.lessonNumber} - {l.title}</option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setupQuiz(selectedMode)}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                بدء الاختبار الآن ({selectedMode === 'timed' ? '10 أسئلة موقوتة' : 'تمارين تدريبية'})
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Active Quiz Area */}
      {quizStarted && !isSubmitted && currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Quiz Status & Navigation Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                السؤال {currentIndex + 1} من {activeQuestions.length}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                currentQ.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                currentQ.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentQ.difficulty === 'easy' ? 'مستوى سهل' : currentQ.difficulty === 'medium' ? 'مستوى متوسط' : 'مستوى متقدم'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                مرجع الكتاب: ص {currentQ.bookPage}
              </span>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={() => handleReadQuestion(currentQ)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              title="قراءة السؤال والخيارات بصوت مسموع"
            >
              <Volume2 className="w-3.5 h-3.5" />
              استمع للسؤال
            </button>
          </div>

          {/* Question Text */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>
            <p className="text-xs text-slate-500 mt-1">المفهوم المختبَر: {currentQ.testedConcept}</p>
          </div>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`w-full text-right p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="leading-relaxed">{option}</span>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress & Bottom Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700"
              >
                السابق
              </button>

              <button
                disabled={currentIndex === activeQuestions.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700"
              >
                التالي
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                تمت الإجابة عن: {answeredCount} من {activeQuestions.length}
              </span>

              <button
                onClick={handleSubmitQuiz}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                تسليم الإجابات وإنهاء الاختبار
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Quiz Results and Detailed Diagnostic Feedback */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Result Summary Banner */}
          {(() => {
            const correctTotal = activeQuestions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
            const pct = Math.round((correctTotal / activeQuestions.length) * 100);

            return (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                    <Award className="w-4 h-4" />
                    نتيجة حقيقية مبنية على إجاباتك الفعلية
                  </div>
                  <h3 className="text-2xl font-black">
                    حصلت على {correctTotal} من {activeQuestions.length} درجات
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    نسبة النجاح: <span className="font-extrabold text-emerald-400">{pct}%</span> • {pct >= 80 ? 'إتقان ممتاز جداً للدرس!' : pct >= 50 ? 'نتيجة مقبولة مع الحاجة لمراجعة الأخطاء' : 'تحتاج لمزيد من الاستماع والشرح التبسيطي'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setupQuiz(selectedMode)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    إعادة الاختبار
                  </button>
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black transition-colors"
                  >
                    اختبار موضوع آخر
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Breakdown of Every Question & Real Mistake Explanations */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-lg">تحليل ومراجعة الإجابات خطوة بخطوة</h3>
            
            {activeQuestions.map((q, idx) => {
              const studentAnswerIdx = selectedAnswers[q.id];
              const isCorrect = studentAnswerIdx === q.correctAnswer;
              const hasAnswered = studentAnswerIdx !== undefined;

              return (
                <div 
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{q.question}</h4>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      ص {q.bookPage}
                    </span>
                  </div>

                  {/* Answers comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3 font-semibold">
                    <div className={`p-2.5 rounded-xl flex items-center justify-between ${
                      isCorrect ? 'bg-emerald-100/70 text-emerald-950' : 'bg-rose-100/70 text-rose-950'
                    }`}>
                      <span>إجابتك: {hasAnswered ? q.options[studentAnswerIdx] : 'لم تتم الإجابة'}</span>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    </div>

                    {!isCorrect && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-between">
                        <span>الإجابة الصحيحة: <strong className="text-emerald-700">{q.options[q.correctAnswer]}</strong></span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  {/* Explanation & Audio button for mistake */}
                  <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">الشرح التعليمي من الكتاب:</strong>
                      <span>{q.simpleArabicExplanation}</span>
                    </div>

                    <button
                      onClick={() => handleReadExplanation(q)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold shrink-0 border border-emerald-200 transition-colors"
                      title="استمع للشرح الصوتي لهذا السؤال"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      استمع لشرح الإجابة
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
