import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Volume2, 
  Sparkles, 
  BookCheck, 
  FileText,
  Settings2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { speech } from '../services/speechService';
import { storageService } from '../services/storageService';

export const AUDIO_MODES = {
  SHORT: 'short',
  DETAILED: 'detailed',
  SIMPLIFIED: 'simplified',
  REVISION: 'revision'
};

export default function AudioPlayerWidget({ 
  lesson, 
  mode, 
  setMode, 
  currentProgress, 
  onLessonCompleted 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [activeChunk, setActiveChunk] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [arabicVoices, setArabicVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [hasTested, setHasTested] = useState(false);

  // Subscribe to speech events
  useEffect(() => {
    // Initial voices
    if (speech.arabicVoices.length > 0) {
      setArabicVoices(speech.arabicVoices);
      if (speech.selectedVoice) {
        setSelectedVoiceURI(speech.selectedVoice.voiceURI || speech.selectedVoice.name);
      }
    }

    const unsubscribe = speech.subscribe((event, data) => {
      if (event === 'start') {
        setIsPlaying(true);
        setIsPaused(false);
      } else if (event === 'chunkStart') {
        setActiveChunk(data.chunk || '');
        if (data.progress) setProgressPct(data.progress);
      } else if (event === 'pause') {
        setIsPaused(true);
      } else if (event === 'resume') {
        setIsPaused(false);
      } else if (event === 'end' || event === 'stop') {
        setIsPlaying(false);
        setIsPaused(false);
        setProgressPct(event === 'end' ? 100 : 0);
        if (event === 'end' && onLessonCompleted && lesson) {
          onLessonCompleted(lesson.id);
        }
      } else if (event === 'rateChange') {
        setSpeed(data.rate);
      } else if (event === 'voicesUpdated') {
        setArabicVoices(data.arabicVoices || []);
        if (data.selectedVoice) {
          setSelectedVoiceURI(data.selectedVoice.voiceURI || data.selectedVoice.name);
        }
      } else if (event === 'voiceChanged') {
        if (data.selectedVoice) {
          setSelectedVoiceURI(data.selectedVoice.voiceURI || data.selectedVoice.name);
        }
      }
    });

    return () => {
      unsubscribe();
      speech.stop();
    };
  }, [lesson, onLessonCompleted]);

  // Track study time when playing
  useEffect(() => {
    let interval = null;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        storageService.addStudyTime(1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isPaused]);

  // Get current text based on selected mode
  const getCurrentSpeechText = () => {
    if (!lesson) return '';
    switch (mode) {
      case AUDIO_MODES.SHORT:
        return lesson.shortExplanationAudio;
      case AUDIO_MODES.DETAILED:
        return lesson.detailedExplanationAudio;
      case AUDIO_MODES.SIMPLIFIED:
        return lesson.simplifiedExplanationAudio;
      case AUDIO_MODES.REVISION:
        return `مراجعة النقاط الامتحانية لدرس: ${lesson.title}. ` + lesson.keyPoints.join('. ');
      default:
        return lesson.detailedExplanationAudio;
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying && !isPaused) {
      speech.pause();
    } else if (isPlaying && isPaused) {
      speech.resume();
    } else {
      const text = getCurrentSpeechText();
      speech.speak(text);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    let text = '';
    if (newMode === AUDIO_MODES.SHORT) text = lesson.shortExplanationAudio;
    else if (newMode === AUDIO_MODES.DETAILED) text = lesson.detailedExplanationAudio;
    else if (newMode === AUDIO_MODES.SIMPLIFIED) text = lesson.simplifiedExplanationAudio;
    else if (newMode === AUDIO_MODES.REVISION) text = lesson.keyPoints.join('. ');

    // Start speaking immediately in the user interaction event
    speech.speak(text);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    speech.setRate(newSpeed);
  };

  const handleVoiceSelect = (e) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    speech.setVoice(uri);
  };

  const handleTestAudio = () => {
    setHasTested(true);
    speech.testArabicVoice();
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-900/40">
      
      {/* Audio Mode Tabs & Settings Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-4 mb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleModeChange(AUDIO_MODES.DETAILED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === AUDIO_MODES.DETAILED
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookCheck className="w-3.5 h-3.5" />
            شرح صوتي مفصل ({lesson?.audioDurationDetailed || '6 د'})
          </button>

          <button
            onClick={() => handleModeChange(AUDIO_MODES.SHORT)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === AUDIO_MODES.SHORT
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            ملخص سريع ({lesson?.audioDurationShort || '2 د'})
          </button>

          <button
            onClick={() => handleModeChange(AUDIO_MODES.SIMPLIFIED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === AUDIO_MODES.SIMPLIFIED
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            اشرح ببساطة أكثر
          </button>

          <button
            onClick={() => handleModeChange(AUDIO_MODES.REVISION)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === AUDIO_MODES.REVISION
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            مراجعة النقاط الامتحانية
          </button>
        </div>

        {/* Speed Controls & Voice Settings Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-slate-300 font-semibold ml-1">السرعة:</span>
            {[0.75, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors ${
                  speed === s ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              showSettings ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="إعدادات الصوت وتشخيص المشاكل"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice & Sound Diagnostics Panel (Collapsible) */}
      {showSettings && (
        <div className="mb-5 p-4 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-3 text-xs animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-emerald-400 block mb-0.5 font-bold">إعدادات محرك الصوت العربي:</strong>
              <p className="text-slate-300 text-[11px]">
                {arabicVoices.length > 0 
                  ? `تم العثور على ${arabicVoices.length} أصوات عربية مدعومة في جهازك` 
                  : 'جهازك يستخدم المحرك الصوتي الافتراضي'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {arabicVoices.length > 0 && (
                <select
                  value={selectedVoiceURI}
                  onChange={handleVoiceSelect}
                  className="bg-slate-900 border border-emerald-700/60 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  {arabicVoices.map((v, i) => (
                    <option key={i} value={v.voiceURI || v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleTestAudio}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                تجربة الصوت
              </button>
            </div>
          </div>

          {/* Device Troubleshooting Hint */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>نصائح للموبايل:</strong> في هواتف iPhone تأكد من إيقاف زر الصامت الجانبي ورفع صوت الوسائط. في أندرويد يفضل استخدام متصفح Google Chrome للحصول على أوضح نطق عربي.
            </span>
          </div>
        </div>
      )}

      {/* Main Player Display */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Lesson Info & Live Spoken Sentence */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
              {lesson?.lessonNumber} • ص {lesson?.bookPages}
            </span>
            <span className="text-xs text-slate-400">كتاب الأحياء الوزاري المعتمد</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">{lesson?.title}</h2>
          
          {/* Real-time Karaoke Sentence Display */}
          <div className="min-h-[52px] bg-slate-950/70 rounded-xl p-3 border border-emerald-900/40 text-emerald-100 text-sm leading-relaxed flex items-center">
            {isPlaying && !isPaused ? (
              <div className="flex items-start gap-2.5 w-full">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mt-1.5 shrink-0" />
                <p className="font-semibold text-emerald-300 animate-in fade-in leading-relaxed">
                  {activeChunk || 'جارٍ الاستماع للشرح التعليمي...'}
                </p>
              </div>
            ) : isPaused ? (
              <p className="text-amber-300 text-xs flex items-center gap-2 font-bold">
                <Pause className="w-4 h-4 text-amber-400" />
                الصوت متوقف مؤقتاً عند: "{activeChunk.slice(0, 50)}..." اضغط متابعة للاستمرار.
              </p>
            ) : (
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                اضغط على زر التشغيل الكبير لبدء الاستماع الصوتي التفاعلي للدرس.
              </p>
            )}
          </div>
        </div>

        {/* Player Controls & Animation */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          
          {/* Animated Audio Waves */}
          <div className="flex items-center justify-center gap-1.5 h-8 px-4">
            <div className={`w-1.5 bg-emerald-400 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-1' : 'h-2'}`} />
            <div className={`w-1.5 bg-emerald-300 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-2' : 'h-3'}`} />
            <div className={`w-1.5 bg-emerald-400 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-3' : 'h-1.5'}`} />
            <div className={`w-1.5 bg-teal-300 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-4' : 'h-4'}`} />
            <div className={`w-1.5 bg-emerald-400 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-5' : 'h-2'}`} />
            <div className={`w-1.5 bg-emerald-200 rounded-full transition-all ${isPlaying && !isPaused ? 'animate-wave-2' : 'h-2.5'}`} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => speech.rewind()}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="إعادة الجملة السابقة"
            >
              <Rewind className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying && !isPaused ? 'إيقاف مؤقت' : 'تشغيل الاستماع'}
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-7 h-7 fill-slate-950" />
              ) : (
                <Play className="w-7 h-7 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => speech.forward()}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="الانتقال للجملة التالية"
            >
              <FastForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => speech.stop()}
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
              title="إيقاف نهائي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Progress Bar */}
      <div className="mt-5 pt-3 border-t border-emerald-900/30">
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
          <span>التقدم في الاستماع: {Math.round(progressPct)}%</span>
          <span>{isPlaying && !isPaused ? 'جاري الاستماع الآن' : isPaused ? 'متوقف مؤقتاً' : 'جاهز للبدء'}</span>
        </div>
      </div>

    </div>
  );
}
