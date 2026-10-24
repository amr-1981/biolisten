import React from 'react';
import { Layers, ArrowRight, CheckCircle, Info } from 'lucide-react';

export default function DiagramViewer({ diagram }) {
  if (!diagram) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">{diagram.title}</h3>
          <p className="text-xs text-slate-500">مخطط تسلسلي للعمليات والرسومات العلمية الواردة بالكتاب</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {diagram.steps.map((step, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-300 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              {idx + 1}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {step}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center gap-2 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>تأتي هذه العمليات والرسومات التخطيطية بانتظام في امتحانات الشهادة الثانوية (أسئلة تركيبية ومطابقة).</span>
      </div>
    </div>
  );
}
