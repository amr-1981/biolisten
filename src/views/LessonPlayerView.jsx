import React, { useState } from 'react';
import { 
  Headphones, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  ChevronDown,
  Volume2
} from 'lucide-react';
import AudioPlayerWidget, { AUDIO_MODES } from '../components/AudioPlayerWidget';
import DiagramViewer from '../components/DiagramViewer';
import { speech } from '../services/speechService';

export default function LessonPlayerView({ 
  lesson, 
  activeSubject,
  onBack, 
  onStartPractice, 
  onSelectTerm,
  onLessonCompleted 
}) {
  const isChem = activeSubject === 'chemistry' || (lesson?.id && lesson.id.startsWith('chem'));
  const subjectName = isChem ? 'الكيمياء' : 'الأحياء';
  const [audioMode, setAudioMode] = useState(AUDIO_MODES.DETAILED);
  const [showFullTranscript, setShowFullTranscript] = useState(true);

  if (!lesson) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-200">
        <Headphones className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">لم يتم اختيار أي درس للاستماع بعد</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">يرجى اختيار درس من قائمة المنهج للبدء في الاستماع والشرح التفاعلي.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
        >
          الانتقال إلى قائمة المنهج
        </button>
      </div>
    );
  }

  // Quick read aloud for a specific sentence or term
  const handleReadAloudText = (text) => {
    speech.speak(text);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمنهج
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAudioMode(AUDIO_MODES.SIMPLIFIED);
              speech.speak(lesson.simplifiedExplanationAudio);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            اشرح أكثر ببساطة
          </button>

          <button
            onClick={() => onStartPractice(lesson)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-sm shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            اختبرني في هذا الدرس
          </button>
        </div>
      </div>

      {/* Main Sticky Audio Player */}
      <AudioPlayerWidget 
        lesson={lesson} 
        mode={audioMode} 
        setMode={setAudioMode} 
        activeSubject={activeSubject}
        onLessonCompleted={onLessonCompleted}
      />

      {/* Grid Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Interactive Transcript & Diagrams */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Interactive Lesson Transcript */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">نص الشرح والتفريغ الصوتي التفاعلي</h3>
              </div>
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="text-xs text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <span>{showFullTranscript ? 'طي النص' : 'عرض النص كاملاً'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullTranscript ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFullTranscript && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-slate-700 text-sm leading-loose">
                  {audioMode === AUDIO_MODES.SHORT && (
                    <div>
                      <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mb-2">
                        الملخص الصوتي السريع (2 دقيقة)
                      </span>
                      <p>{lesson.shortExplanationAudio}</p>
                    </div>
                  )}

                  {audioMode === AUDIO_MODES.DETAILED && (
                    <div>
                      <span className="inline-block text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded mb-2">
                        الشرح الصوتي المفصل للكتاب المدرسي
                      </span>
                      <p>{lesson.detailedExplanationAudio}</p>
                    </div>
                  )}

                  {audioMode === AUDIO_MODES.SIMPLIFIED && (
                    <div>
                      <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded mb-2">
                        الشرح التبسيطي الذكي
                      </span>
                      <p>{lesson.simplifiedExplanationAudio}</p>
                    </div>
                  )}

                  {audioMode === AUDIO_MODES.REVISION && (
                    <div>
                      <span className="inline-block text-xs font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded mb-2">
                        المراجعة السريعة للنقاط الامتحانية
                      </span>
                      <ul className="list-disc list-inside space-y-1.5 mt-2">
                        {lesson.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Listen to specific excerpt button */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>المصدر الموثوق: كتاب {subjectName} وكراسة التدريبات والنشاط العملي - صفحات {lesson.bookPages}</span>
                  <button
                    onClick={() => handleReadAloudText(lesson.summary)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    استمع للملخص المكتوب
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Important Diagrams and Processes */}
          {lesson.diagram && (
            <DiagramViewer diagram={lesson.diagram} />
          )}

          {/* Concise Written Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-slate-900 text-base">الملخص المكتوب للدرس</h3>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              {lesson.summary}
            </p>
          </div>

        </div>

        {/* Right Column (1 col): Key Exam Points & Key Terms */}
        <div className="space-y-6">
          
          {/* Key Exam Points (نقاط متوقعة في الامتحانات) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-amber-200/60 pb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-amber-950 text-base">مفاهيم متكررة في الامتحانات</h3>
            </div>
            <ul className="space-y-3">
              {lesson.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                setAudioMode(AUDIO_MODES.REVISION);
                speech.speak(`مراجعة سريعة لأهم نقاط درس ${lesson.title}: ` + lesson.keyPoints.join('. '));
              }}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              استمع لمراجعة النقاط الامتحانية
            </button>
          </div>

          {/* Key Scientific Terms in This Lesson */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">المصطلحات العلمية للدرس</h3>
              <span className="text-[11px] text-slate-400 font-semibold">{lesson.terms.length} مصطلحات</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lesson.terms.map((term, i) => (
                <button
                  key={i}
                  onClick={() => onSelectTerm(term)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <span>{term}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-medium">
              اضغط على أي مصطلح للاستماع لنطقه وتعريفه من بنك المصطلحات.
            </p>
          </div>

          {/* Lesson Test CTA Card */}
          <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-md text-center">
            <h4 className="font-extrabold text-base mb-1">جاهز لاختبار فهمك؟</h4>
            <p className="text-xs text-emerald-200 mb-4">
              أجب عن أسئلة وزارية حقيقية مستخرجة من كراسة التدريبات لهذا الدرس بالذات.
            </p>
            <button
              onClick={() => onStartPractice(lesson)}
              className="w-full py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow hover:bg-emerald-50 transition-all hover:scale-105"
            >
              بدء التدريب الفوري
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
