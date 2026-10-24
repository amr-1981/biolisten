import React, { useState } from 'react';
import { ShieldCheck, Trash2, Download, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function PrivacySettingsModal({ isOpen, onClose, onDataReset }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleClearData = () => {
    storageService.clearAllData();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => {
      setResetDone(false);
      if (onDataReset) onDataReset();
      onClose();
    }, 1500);
  };

  const handleExportData = () => {
    const data = {
      completedLessons: storageService.getCompletedLessons(),
      studyTimeSeconds: storageService.getStudyTime(),
      streak: storageService.getStreak(),
      attempts: storageService.getAttempts(),
      masteries: storageService.getLessonMasteries(),
      savedTerms: storageService.getSavedTerms(),
      savedQuestions: storageService.getSavedQuestions(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biolisten-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">الخصوصية وإدارة بيانات التعلم</h3>
              <p className="text-xs text-slate-500">حماية تامة للبيانات وفق سياسة الخصوصية المحلية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5 font-bold">حفظ محلي آمن وخصوصية مطلقة:</strong>
              جميع بيانات تقدمك، وساعات استماعك، وإجاباتك، ومصطلحاتك المحفوظة مخزنة محلياً في متصفحك (LocalStorage) فقط، ولا يتم إرسالها إلى خوادم خارجية أو مشاركتها.
            </div>
          </div>

          <p>
            يمكنك في أي وقت تصدير نسخة احتياطية من سجل إنجازاتك أو مسح كامل بياناتك ومحفوظاتك من هذا الجهاز.
          </p>

          {/* Action Cards */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleExportData}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between gap-3 font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تصدير تقرير الإنجاز والبيانات (JSON)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">حفظ ملف محلي</span>
            </button>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-900 flex items-center justify-between gap-3 font-bold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>مسح كامل سجل التقدم والنتائج</span>
                </div>
                <span className="text-[11px] text-rose-600 font-normal">إعادة ضبط المصنع</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-950 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>هل أنت متأكد من رغبتك في حذف كل بياناتك ونتائجك؟</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  سيتم تصفير وقت الاستماع ونتائج الاختبارات والدروس المكتملة بشكل نهائي.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors"
                  >
                    نعم، احذف كل بياناتي
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
                  >
                    إلغاء التراجع
                  </button>
                </div>
              </div>
            )}

            {resetDone && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-950 font-bold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم مسح جميع بيانات التعلم بنجاح!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
