import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SubjectPortalView from './views/SubjectPortalView';
import CurriculumView from './views/CurriculumView';
import LessonPlayerView from './views/LessonPlayerView';
import PracticeView from './views/PracticeView';
import DashboardView from './views/DashboardView';
import GlossaryView from './views/GlossaryView';
import QuestionBankView from './views/QuestionBankView';
import PrivacySettingsModal from './components/PrivacySettingsModal';

import { CURRICULUM as BIOLOGY_CURRICULUM } from './data/curriculumData';
import { GLOSSARY_TERMS as BIOLOGY_GLOSSARY } from './data/glossaryData';
import { QUESTIONS as BIOLOGY_QUESTIONS } from './data/questionsData';

import { CHEMISTRY_CURRICULUM } from './data/chemistryData';
import { CHEMISTRY_GLOSSARY } from './data/chemistryGlossary';
import { CHEMISTRY_QUESTIONS } from './data/chemistryQuestions';

import { storageService } from './services/storageService';

export default function App() {
  const [activeSubject, setActiveSubject] = useState(storageService.getActiveSubject());
  const [studentName, setStudentName] = useState(storageService.getStudentName());
  const [activeTab, setActiveTab] = useState('curriculum');

  // Active curriculum dataset based on selected subject
  const currentCurriculum = activeSubject === 'chemistry' ? CHEMISTRY_CURRICULUM : BIOLOGY_CURRICULUM;
  const currentGlossary = activeSubject === 'chemistry' ? CHEMISTRY_GLOSSARY : BIOLOGY_GLOSSARY;
  const currentQuestions = activeSubject === 'chemistry' ? CHEMISTRY_QUESTIONS : BIOLOGY_QUESTIONS;

  const [currentLesson, setCurrentLesson] = useState(currentCurriculum[0]?.lessons[0] || null);
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
    setStudentName(storageService.getStudentName());
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
    const interval = setInterval(() => {
      setStudyTimeSeconds(storageService.getStudyTime());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update current lesson if activeSubject changes
  useEffect(() => {
    if (activeSubject === 'chemistry') {
      setCurrentLesson(CHEMISTRY_CURRICULUM[0]?.lessons[0] || null);
    } else if (activeSubject === 'biology') {
      setCurrentLesson(BIOLOGY_CURRICULUM[0]?.lessons[0] || null);
    }
  }, [activeSubject]);

  // Subject Selection
  const handleSelectSubject = (subjectId) => {
    setActiveSubject(subjectId);
    storageService.setActiveSubject(subjectId);
    const targetCurriculum = subjectId === 'chemistry' ? CHEMISTRY_CURRICULUM : BIOLOGY_CURRICULUM;
    setCurrentLesson(targetCurriculum[0]?.lessons[0] || null);
    setPracticeLesson(null);
    setActiveTab('curriculum');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPortal = () => {
    setActiveSubject(null);
    storageService.setActiveSubject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudentName = (name) => {
    storageService.setStudentName(name);
    setStudentName(name);
  };

  // Handlers for Lesson & Practice
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
    for (const u of currentCurriculum) {
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
      
      {/* Top Sticky Header (shown when inside a subject) */}
      {activeSubject && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          streak={streak}
          studyTimeSeconds={studyTimeSeconds}
          studentName={studentName}
          activeSubject={activeSubject}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onBackToPortal={handleBackToPortal}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Initial Portal: Subject Selection */}
        {!activeSubject && (
          <SubjectPortalView
            studentName={studentName}
            onSaveStudentName={handleSaveStudentName}
            onSelectSubject={handleSelectSubject}
          />
        )}

        {/* When a subject is active */}
        {activeSubject && (
          <>
            {activeTab === 'curriculum' && (
              <CurriculumView
                curriculum={currentCurriculum}
                completedLessons={completedLessons}
                lessonMasteries={lessonMasteries}
                activeSubject={activeSubject}
                onSelectLesson={handleSelectLesson}
                onStartPractice={handleStartPractice}
              />
            )}

            {activeTab === 'player' && (
              <LessonPlayerView
                lesson={currentLesson}
                activeSubject={activeSubject}
                onBack={() => setActiveTab('curriculum')}
                onStartPractice={handleStartPractice}
                onSelectTerm={handleSelectTermFromLesson}
                onLessonCompleted={handleLessonCompleted}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeView
                curriculum={currentCurriculum}
                questions={currentQuestions}
                initialLesson={practiceLesson}
                activeSubject={activeSubject}
                onGoToLesson={handleGoToLessonById}
                onRecordAttempt={handleRecordAttempt}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                curriculum={currentCurriculum}
                completedLessons={completedLessons}
                studyTimeSeconds={studyTimeSeconds}
                streak={streak}
                attempts={attempts}
                lessonMasteries={lessonMasteries}
                studentName={studentName}
                activeSubject={activeSubject}
                onGoToLesson={handleSelectLesson}
                onStartPractice={() => setActiveTab('practice')}
              />
            )}

            {activeTab === 'glossary' && (
              <GlossaryView
                terms={currentGlossary}
                savedTerms={savedTerms}
                activeSubject={activeSubject}
                onToggleSaveTerm={handleToggleSaveTerm}
                onGoToLesson={handleGoToLessonById}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionBankView
                questions={currentQuestions}
                curriculum={currentCurriculum}
                attempts={attempts}
                savedQuestions={savedQuestions}
                activeSubject={activeSubject}
                onToggleSaveQuestion={handleToggleSaveQuestion}
                onGoToLesson={handleGoToLessonById}
                onPracticeQuestion={(q) => {
                  setPracticeLesson(currentCurriculum[0]?.lessons[0]);
                  setActiveTab('practice');
                }}
              />
            )}
          </>
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
            <span>EduListen • منصة الاستماع الذكية للثانوية العامة</span>
            <span className="text-slate-300">|</span>
            <span className="font-normal text-slate-500">مناهج التعليم الثانوي (القسم العلمي - ليبيا)</span>
          </div>
          <div className="flex items-center gap-3">
            {activeSubject && (
              <button
                onClick={handleBackToPortal}
                className="text-emerald-700 hover:underline font-bold"
              >
                تغيير المادة الدراسية
              </button>
            )}
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              المركز الوطني للمناهج التعليمية
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
