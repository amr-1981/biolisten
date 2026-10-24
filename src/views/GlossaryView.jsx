import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Volume2, 
  Star, 
  ExternalLink, 
  Filter,
  Check,
  BookOpen
} from 'lucide-react';
import { speech } from '../services/speechService';
import { storageService } from '../services/storageService';

export default function GlossaryView({ 
  terms, 
  savedTerms, 
  activeSubject,
  onToggleSaveTerm, 
  onGoToLesson 
}) {
  const isChem = activeSubject === 'chemistry' || (terms[0]?.id && terms[0].id.startsWith('chem'));
  const subjectName = isChem ? 'الكيمياء' : 'الأحياء';
  const termTypeLabel = isChem ? 'مصطلحاً كيميائياً' : 'مصطلحاً بيولوجياً';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const filteredTerms = terms.filter(t => {
    const matchesSearch = 
      t.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUnit = selectedUnit === 'all' || t.unitId === selectedUnit;
    const matchesSaved = !showSavedOnly || savedTerms.includes(t.id);

    return matchesSearch && matchesUnit && matchesSaved;
  });

  const handlePronounce = (term) => {
    speech.speak(`المصطلح العلمي: ${term.ar}. بالإنجليزية: ${term.en}. التعريف من الكتاب المدرسي: ${term.definition}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isChem ? 'text-sky-800 bg-sky-100' : 'text-emerald-800 bg-emerald-100'
            }`}>
              القاموس العلمي المعتمد
            </span>
            <span className="text-xs text-slate-500 font-semibold">{terms.length} {termTypeLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">بنك المصطلحات العلمية لـ{subjectName}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            استمع للنطق الدقيق والتعريف المعتمد لكل مصطلح علمي ورد في كتاب {subjectName} ومسرد الوزارة للثانوية العامة مع رقم الصفحة والمثال.
          </p>
        </div>

        {/* Filter Saved Button */}
        <button
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
            showSavedOnly 
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Star className={`w-4 h-4 ${showSavedOnly ? 'fill-slate-950' : 'text-amber-500'}`} />
          <span>قائمتي الشخصية للمراجعة ({savedTerms.length})</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن أي مصطلح بالعربية أو الإنجليزية أو بالتعريف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Unit Selector */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full sm:w-56 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">جميع الوحدات الدراسية</option>
            <option value="unit-1">الوحدة 1: الكائنات الدقيقة</option>
            <option value="unit-2-3">الوحدة 2 و 3: علم البيئة</option>
            <option value="unit-4">الوحدة 4: التكاثر في النبات</option>
            <option value="unit-5">الوحدة 5: التكاثر في الحيوان</option>
            <option value="unit-6">الوحدة 6: الوراثة والجينات</option>
            <option value="unit-practical">كراسة النشاط العملي</option>
          </select>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((t) => {
          const isSaved = savedTerms.includes(t.id);

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top header: term name and bookmark */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{t.ar}</span>
                      {t.en && (
                        <span className="text-xs font-semibold text-slate-400 font-sans tracking-wide">
                          ({t.en})
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePronounce(t)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="استمع لنطق المصطلح وتعريفه"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSaveTerm(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title={isSaved ? 'إزالة من قائمة المراجعة' : 'إضافة لقائمة المراجعة'}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                  {t.definition}
                </p>

                {/* Example from textbook */}
                {t.example && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 mb-3">
                    <strong className="text-slate-800 ml-1">مثال توضيحي:</strong>
                    <span>{t.example}</span>
                  </div>
                )}
              </div>

              {/* Bottom footer: book page and lesson link */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span>الكتاب المدرسي: صفحة {t.page}</span>
                <button
                  onClick={() => onGoToLesson(t.lessonId)}
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>عرض الدرس</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">لم يتم العثور على مصطلحات تطابق بحثك</h4>
          <p className="text-xs text-slate-400 mt-1">جرّب كلمة بحث أخرى أو أزل التصفية.</p>
        </div>
      )}

    </div>
  );
}
