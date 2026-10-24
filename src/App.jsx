import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CurriculumView from './views/CurriculumView';
import LessonPlayerView from './views/LessonPlayerView';
import PracticeView from './views/PracticeView';
import DashboardView from './views/DashboardView';
import GlossaryView from './views/GlossaryView';
import QuestionBankView from './views/QuestionBankView';
import PrivacySettingsModal from './components/PrivacySettingsModal';

import { CURRICULUM } from './data/curriculumData';
import { GLOSSARY_TERMS } from './data/glossaryData';
import { QUESTIONS } from './data/questionsData';
import { storageService } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('curriculum');
  const [currentLesson, setCurrentLesson] = useState(CURRICULUM[0]?.lessons[0] || null);
  const [practiceLesson, setPracticeLesson] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Persistent student state
  const [completedLessons, setCompletedLessons] = useState([]);
  const [studyTimeSeconds, setStudyTimeSeconds] = useState(0);
  const [streak, setStreak] = useState(1);
  const [attempts, setAttempts] = useState([]);
  const [lessonMasteries, setLessonMasteries] = useState({});
  const [savedTerms, setSavedTerms] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);

  // Load from local storage on mount
  const refreshStorageData = () => {
    setCompletedLessons(storageService.getCompletedLessons());
    setStudyTimeSeconds(storageService.getStudyTime());
    setStreak(storageService.getStreak());
    setAttempts(storageService.getAttempts());
    setLessonMasteries(storageService.getLessonMasteries());
    setSavedTerms(storageService.getSavedTerms());
    setSavedQuestions(storageService.getSavedQuestions());
  };

  useEffect(() => {
    refreshStorageData();
    // Periodic refresh of study time
    const interval = setInterval(() => {
      setStudyTimeSeconds(storageService.getStudyTime());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPractice = (lesson = null) => {
    setPracticeLesson(lesson || currentLesson);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLessonById = (lessonId) => {
    for (const u of CURRICULUM) {
      const match = u.lessons.find(l => l.id === lessonId);
      if (match) {
        setCurrentLesson(match);
        setActiveTab('player');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
  };

  const handleLessonCompleted = (lessonId) => {
    const updated = storageService.markLessonCompleted(lessonId);
    setCompletedLessons(updated);
  };

  const handleRecordAttempt = (attempt) => {
    refreshStorageData();
  };

  const handleToggleSaveTerm = (termId) => {
    const updated = storageService.toggleSaveTerm(termId);
    setSavedTerms(updated);
  };

  const handleToggleSaveQuestion = (qId) => {
    const updated = storageService.toggleSaveQuestion(qId);
    setSavedQuestions(updated);
  };

  const handleSelectTermFromLesson = (termName) => {
    setActiveTab('glossary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={streak}
        studyTimeSeconds={studyTimeSeconds}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'curriculum' && (
          <CurriculumView
            curriculum={CURRICULUM}
            completedLessons={completedLessons}
            lessonMasteries={lessonMasteries}
            onSelectLesson={handleSelectLesson}
            onStartPractice={handleStartPractice}
          />
        )}

        {activeTab === 'player' && (
          <LessonPlayerView
            lesson={currentLesson}
            onBack={() => setActiveTab('curriculum')}
            onStartPractice={handleStartPractice}
            onSelectTerm={handleSelectTermFromLesson}
            onLessonCompleted={handleLessonCompleted}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            curriculum={CURRICULUM}
            questions={QUESTIONS}
            initialLesson={practiceLesson}
            onGoToLesson={handleGoToLessonById}
            onRecordAttempt={handleRecordAttempt}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            curriculum={CURRICULUM}
            completedLessons={completedLessons}
            studyTimeSeconds={studyTimeSeconds}
            streak={streak}
            attempts={attempts}
            lessonMasteries={lessonMasteries}
            onGoToLesson={handleSelectLesson}
            onStartPractice={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'glossary' && (
          <GlossaryView
            terms={GLOSSARY_TERMS}
            savedTerms={savedTerms}
            onToggleSaveTerm={handleToggleSaveTerm}
            onGoToLesson={handleGoToLessonById}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionBankView
            questions={QUESTIONS}
            curriculum={CURRICULUM}
            attempts={attempts}
            savedQuestions={savedQuestions}
            onToggleSaveQuestion={handleToggleSaveQuestion}
            onGoToLesson={handleGoToLessonById}
            onPracticeQuestion={(q) => {
              setPracticeLesson(CURRICULUM[0]?.lessons[0]);
              setActiveTab('practice');
            }}
          />
        )}
      </main>

      {/* Privacy and Local Data Management Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onDataReset={refreshStorageData}
      />

      {/* Modern Student-friendly Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>BioListen • منصة الاستماع الذكية للأحياء</span>
            <span className="text-slate-300">|</span>
            <span className="font-normal text-slate-500">مبني حصرياً وفق المنهج الليبي المعتمد (السنة الثالثة ثانوي علمي)</span>
          </div>
          <div>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              جميع الحقوق محفوظة للمركز الوطني للمناهج التعليمية بليبيا
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
