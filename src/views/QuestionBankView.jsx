import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Filter, 
  Volume2, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  ExternalLink,
  Star,
  Check
} from 'lucide-react';
import { speech } from '../services/speechService';

export default function QuestionBankView({ 
  questions, 
  curriculum, 
  attempts, 
  savedQuestions, 
  onToggleSaveQuestion, 
  onGoToLesson, 
  onPracticeQuestion 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, unattempted, correct, incorrect, saved
  const [activeQuestionModal, setActiveQuestionModal] = useState(null);
  const [userSelectedOption, setUserSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Compute question statuses from attempts
  const questionStatusMap = {};
  attempts.forEach(att => {
    if (att.answers) {
      Object.entries(att.answers).forEach(([qId, ansIdx]) => {
        const q = questions.find(item => item.id === qId);
        if (q) {
          questionStatusMap[qId] = ansIdx === q.correctAnswer ? 'correct' : 'incorrect';
        }
      });
    }
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.testedConcept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUnit = selectedUnit === 'all' || q.unitId === selectedUnit;
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    
    const status = questionStatusMap[q.id] || 'unattempted';
    let matchesStatus = true;
    if (selectedStatus === 'saved') {
      matchesStatus = savedQuestions.includes(q.id);
    } else if (selectedStatus !== 'all') {
      matchesStatus = status === selectedStatus;
    }

    return matchesSearch && matchesUnit && matchesDiff && matchesStatus;
  });

  const handleReadAloud = (q) => {
    speech.speak(`${q.question}. الخيارات: ` + q.options.join('، '));
  };

  const handleOpenPracticeModal = (q) => {
    setActiveQuestionModal(q);
    setUserSelectedOption(null);
    setShowFeedback(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
              بنك الأسئلة التفاعلي
            </span>
            <span className="text-xs text-slate-500 font-semibold">{questions.length} أسئلة امتحانية من الكتاب</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">بنك الأسئلة والمراجعة الشاملة</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            صنّف وفلتر أسئلة الامتحانات الوزارية بحسب الوحدة، الصعوبة، أو حالة الإجابة، واحفظ الأسئلة الصعبة لمراجعتها لاحقاً.
          </p>
        </div>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'saved' ? 'all' : 'saved')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
            selectedStatus === 'saved'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Star className={`w-4 h-4 ${selectedStatus === 'saved' ? 'fill-slate-950' : 'text-amber-500'}`} />
          <span>الأسئلة المحفوظة للمراجعة ({savedQuestions.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث في نص السؤال، أو المفهوم المختبَر، أو الموضوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كل الوحدات</option>
            <option value="unit-1">الوحدة 1: الكائنات الدقيقة</option>
            <option value="unit-2-3">الوحدة 2 و 3: علم البيئة</option>
            <option value="unit-4">الوحدة 4: التكاثر في النبات</option>
            <option value="unit-5">الوحدة 5: التكاثر في الحيوان</option>
            <option value="unit-6">الوحدة 6: الوراثة والجينات</option>
            <option value="unit-practical">كراسة النشاط العملي</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كل المستويات</option>
            <option value="easy">المستوى السهل</option>
            <option value="medium">المستوى المتوسط</option>
            <option value="hard">المستوى المتقدم</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كل حالات الإجابة</option>
            <option value="unattempted">لم تتم المحاولة بعد</option>
            <option value="correct">تمت الإجابة بشكل صحيح</option>
            <option value="incorrect">تمت الإجابة بشكل خاطئ</option>
            <option value="saved">المحفوظة فقط للمراجعة</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isSaved = savedQuestions.includes(q.id);
          const status = questionStatusMap[q.id] || 'unattempted';

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {q.topic}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                      q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      ص {q.bookPage}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    {status === 'correct' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        صحيح
                      </span>
                    )}
                    {status === 'incorrect' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        خاطئ
                      </span>
                    )}

                    <button
                      onClick={() => handleReadAloud(q)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="استمع للسؤال بصوت مسموع"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleSaveQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title={isSaved ? 'إزالة من قائمة المراجعة' : 'حفظ السؤال للمراجعة'}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="font-extrabold text-base text-slate-900 leading-relaxed">
                  {q.question}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  المفهوم المرجعي: <strong className="text-slate-700">{q.testedConcept}</strong>
                </p>
              </div>

              {/* Bottom CTA to practice */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onGoToLesson(q.lessonId)}
                  className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
                >
                  <span>عرض الدرس التابع له</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleOpenPracticeModal(q)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105"
                >
                  حل السؤال الآن
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">لم يتم العثور على أسئلة مطابقة للبحث أو التصفية</h4>
          <p className="text-xs text-slate-400 mt-1">اختر فلاتر أخرى أو امسح شريط البحث.</p>
        </div>
      )}

      {/* Quick Practice Modal */}
      {activeQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                تدريب سريع • ص {activeQuestionModal.bookPage}
              </span>
              <button
                onClick={() => setActiveQuestionModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                إغلاق ✕
              </button>
            </div>

            <h3 className="font-extrabold text-slate-900 text-base mb-4 leading-relaxed">
              {activeQuestionModal.question}
            </h3>

            <div className="space-y-2 mb-4">
              {activeQuestionModal.options.map((opt, i) => {
                const isSelected = userSelectedOption === i;
                const isCorrect = i === activeQuestionModal.correctAnswer;
                
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                if (showFeedback) {
                  if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-100 border-rose-500 text-rose-950 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20';
                }

                return (
                  <button
                    key={i}
                    disabled={showFeedback}
                    onClick={() => setUserSelectedOption(i)}
                    className={`w-full text-right p-3 rounded-xl border text-xs font-semibold transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4">
                <strong className="block text-slate-900 mb-1">الشرح والتوضيح:</strong>
                <p>{activeQuestionModal.simpleArabicExplanation}</p>
                <button
                  onClick={() => speech.speak(activeQuestionModal.simpleArabicExplanation)}
                  className="mt-2 inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  استمع للشرح صوتياً
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              {!showFeedback ? (
                <button
                  disabled={userSelectedOption === null}
                  onClick={() => setShowFeedback(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs"
                >
                  تحقق من الإجابة
                </button>
              ) : (
                <button
                  onClick={() => setActiveQuestionModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  حسناً، تم الفهم
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
