// LocalStorage Service for real student progress without fake or random data

const STORAGE_KEYS = {
  STUDENT_NAME: 'biolisten_student_name',
  ACTIVE_SUBJECT: 'biolisten_active_subject',
  COMPLETED_LESSONS: 'biolisten_completed_lessons',
  STUDY_TIME_SECONDS: 'biolisten_study_time_seconds',
  LAST_ACTIVE_DATE: 'biolisten_last_active_date',
  STREAK_DAYS: 'biolisten_streak_days',
  EXERCISE_ATTEMPTS: 'biolisten_exercise_attempts',
  SAVED_TERMS: 'biolisten_saved_terms',
  SAVED_QUESTIONS: 'biolisten_saved_questions',
  LESSON_MASTERIES: 'biolisten_lesson_masteries'
};

export const storageService = {
  // Student Name
  getStudentName() {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || '';
  },

  setStudentName(name) {
    if (name) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_NAME);
    }
  },

  // Active Subject
  getActiveSubject() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT) || null;
  },

  setActiveSubject(subjectId) {
    if (subjectId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SUBJECT, subjectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SUBJECT);
    }
  },
  // Lesson completion
  getCompletedLessons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markLessonCompleted(lessonId) {
    const list = this.getCompletedLessons();
    if (!list.includes(lessonId)) {
      list.push(lessonId);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(list));
    }
    this.updateStreak();
    return list;
  },

  // Total Study & Listening Time in seconds
  getStudyTime() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.STUDY_TIME_SECONDS) || '0', 10);
    } catch {
      return 0;
    }
  },

  addStudyTime(seconds) {
    const current = this.getStudyTime();
    const updated = current + seconds;
    localStorage.setItem(STORAGE_KEYS.STUDY_TIME_SECONDS, updated.toString());
    this.updateStreak();
    return updated;
  },

  // Streak tracking
  getStreak() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_DAYS) || '1', 10);
    } catch {
      return 1;
    }
  },

  updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);
    let streak = this.getStreak();

    if (!lastDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
      localStorage.setItem(STORAGE_KEYS.STREAK_DAYS, '1');
      return 1;
    }

    if (lastDate === today) {
      return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    localStorage.setItem(STORAGE_KEYS.STREAK_DAYS, streak.toString());
    return streak;
  },

  // Quiz / Exam Attempts
  getAttempts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordAttempt(attempt) {
    // attempt: { id, type, unitId, lessonId, date, score, totalQuestions, userAnswers: [...] }
    const list = this.getAttempts();
    list.push({
      ...attempt,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('ar-LY')
    });
    localStorage.setItem(STORAGE_KEYS.EXERCISE_ATTEMPTS, JSON.stringify(list));

    // Update lesson mastery score based strictly on actual scores
    if (attempt.lessonId && attempt.totalQuestions > 0) {
      this.updateLessonMastery(attempt.lessonId, Math.round((attempt.score / attempt.totalQuestions) * 100));
    }
    this.updateStreak();
    return list;
  },

  getLessonMasteries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSON_MASTERIES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  updateLessonMastery(lessonId, scorePct) {
    const masteries = this.getLessonMasteries();
    // Weighted moving average or max
    const existing = masteries[lessonId];
    masteries[lessonId] = existing ? Math.round((existing + scorePct) / 2) : scorePct;
    localStorage.setItem(STORAGE_KEYS.LESSON_MASTERIES, JSON.stringify(masteries));
    return masteries;
  },

  // Saved Terminology for Personal Revision
  getSavedTerms() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_TERMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveTerm(termId) {
    let list = this.getSavedTerms();
    if (list.includes(termId)) {
      list = list.filter(id => id !== termId);
    } else {
      list.push(termId);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_TERMS, JSON.stringify(list));
    return list;
  },

  // Saved Questions for Personal Revision
  getSavedQuestions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveQuestion(questionId) {
    let list = this.getSavedQuestions();
    if (list.includes(questionId)) {
      list = list.filter(id => id !== questionId);
    } else {
      list.push(questionId);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_QUESTIONS, JSON.stringify(list));
    return list;
  },

  // Clear all data (Data and Privacy requirement)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
};
