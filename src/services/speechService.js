// Bulletproof Speech Synthesis Service for BioListen Arabic Audio Experience
// Solves: Chrome GC bug, 14s timeout bug, mobile Safari gesture lock, and missing voice fallbacks

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.rate = 1.0;
    this.voices = [];
    this.arabicVoices = [];
    this.selectedVoice = null;
    this.listeners = new Set();
    this.activeText = '';
    this.currentChunkIndex = 0;
    this.textChunks = [];
    this.keepAliveTimer = null;

    if (this.synth) {
      this.initVoices();
    }
  }

  initVoices() {
    this.loadVoices();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };

      // In some browsers onvoiceschanged doesn't fire immediately; poll for first 2 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (this.voices.length > 0 || attempts > 10) {
          clearInterval(interval);
        } else {
          this.loadVoices();
        }
      }, 250);
    }
  }

  loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
      
      // Filter Arabic voices
      this.arabicVoices = this.voices.filter(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return (
          lang.startsWith('ar') ||
          lang.includes('ar-') ||
          lang.includes('arab') ||
          name.includes('arabic') ||
          name.includes('عربي') ||
          name.includes('tarik') ||
          name.includes('maged') ||
          name.includes('laila') ||
          name.includes('salma') ||
          name.includes('naayf') ||
          name.includes('shakir') ||
          name.includes('hoda')
        );
      });

      // Default to best available Arabic voice (prioritize Egyptian dialect)
      if (this.arabicVoices.length > 0 && !this.selectedVoice) {
        const egyptian = this.arabicVoices.find(v => 
          (v.lang || '').toLowerCase().includes('ar-eg') ||
          (v.name || '').toLowerCase().includes('hoda') ||
          (v.name || '').toLowerCase().includes('egypt')
        );
        const natural = this.arabicVoices.find(v => 
          v.name.includes('Natural') || 
          v.name.includes('Google') || 
          v.name.includes('Online')
        );
        this.selectedVoice = egyptian || natural || this.arabicVoices[0];
      }

      this.notify('voicesUpdated', { 
        voices: this.voices, 
        arabicVoices: this.arabicVoices, 
        selectedVoice: this.selectedVoice 
      });
    } catch (e) {
      console.warn('Error loading voices:', e);
    }
  }

  setVoice(voiceURI) {
    const v = this.voices.find(voice => voice.voiceURI === voiceURI || voice.name === voiceURI);
    if (v) {
      this.selectedVoice = v;
      this.notify('voiceChanged', { selectedVoice: v });
      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(this.currentChunkIndex);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(fn => {
      try {
        fn(event, data);
      } catch (err) {
        console.error('Speech listener error:', err);
      }
    });
  }

  setRate(newRate) {
    this.rate = Math.max(0.75, Math.min(2.0, newRate));
    if (this.isPlaying && !this.isPaused) {
      this.speakChunk(this.currentChunkIndex);
    }
    this.notify('rateChange', { rate: this.rate });
  }

  // Segment Arabic text into bite-sized natural sentences (avoids 14s browser cutoff)
  segmentArabicText(text) {
    if (!text) return [];
    
    // Normalize punctuation
    const clean = text
      .replace(/\r\n/g, '\n')
      .replace(/[\t ]+/g, ' ')
      .trim();

    // Split on major Arabic sentence terminators: . ! ؟ \n
    // Also split long sentences on commas if they exceed 18 words
    const rawSentences = clean.split(/(?<=[.!\n؟])\s+/);
    const finalChunks = [];

    rawSentences.forEach(sentence => {
      const s = sentence.trim();
      if (!s) return;

      const words = s.split(' ');
      if (words.length > 18) {
        // Split further on commas or semicolons
        const subParts = s.split(/(?<=[،؛])\s+/);
        subParts.forEach(sub => {
          if (sub.trim()) finalChunks.push(sub.trim());
        });
      } else {
        finalChunks.push(s);
      }
    });

    return finalChunks.length > 0 ? finalChunks : [clean];
  }

  speak(text, onChunkProgress = null) {
    if (!text || !text.trim()) return;

    // Direct synchronous stop & reset to unlock audio thread
    this.stopAudioEngine();

    this.activeText = text;
    this.onProgressCallback = onChunkProgress;
    this.textChunks = this.segmentArabicText(text);
    this.currentChunkIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.notify('start', { text, totalChunks: this.textChunks.length });

    // Ensure speech synthesis is awake (unlocks iOS Safari & Chrome)
    if (this.synth) {
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.startKeepAlive();
    }

    this.speakChunk(0);
  }

  speakChunk(index) {
    if (index >= this.textChunks.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.stopKeepAlive();
      this.notify('end', {});
      return;
    }

    this.currentChunkIndex = index;
    const chunk = this.textChunks[index];

    if (!this.synth) {
      this.simulateChunk(index);
      return;
    }

    // Cancel previous utterance cleanly before starting next
    try {
      this.synth.cancel();
    } catch (e) {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    
    // Configure voice & language (prefer Egyptian ar-EG)
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang || 'ar-EG';
    } else if (this.arabicVoices.length > 0) {
      utterance.voice = this.arabicVoices[0];
      utterance.lang = this.arabicVoices[0].lang || 'ar-EG';
    } else {
      utterance.lang = 'ar-EG';
    }

    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // CRITICAL: Prevent Chrome Garbage Collection bug by pinning utterance to window
    if (typeof window !== 'undefined') {
      window._bioListenActiveUtterance = utterance;
    }
    this.currentUtterance = utterance;

    utterance.onstart = () => {
      this.notify('chunkStart', {
        index,
        chunk,
        total: this.textChunks.length,
        progress: ((index + 1) / this.textChunks.length) * 100
      });
      if (this.onProgressCallback) {
        this.onProgressCallback(index, chunk, this.textChunks.length);
      }
    };

    utterance.onend = () => {
      // Clean up window reference
      if (typeof window !== 'undefined') {
        window._bioListenActiveUtterance = null;
      }

      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis chunk error:', e.error || e);
      // Clean up window reference
      if (typeof window !== 'undefined') {
        window._bioListenActiveUtterance = null;
      }

      // If user canceled intentionally, don't cascade
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }

      // Advance to next chunk if not explicitly stopped
      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(index + 1);
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Failed to call synth.speak:', err);
      // Fallback
      this.simulateChunk(index);
    }
  }

  simulateChunk(index) {
    const chunk = this.textChunks[index];
    const words = (chunk || '').split(' ').length;
    const durationMs = Math.max(1200, (words / (2.2 * this.rate)) * 1000);

    this.notify('chunkStart', {
      index,
      chunk,
      total: this.textChunks.length,
      progress: ((index + 1) / this.textChunks.length) * 100
    });

    this.simTimeout = setTimeout(() => {
      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(index + 1);
      }
    }, durationMs);
  }

  // Keep-alive timer for Chrome 14s pause bug
  startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this.synth.speaking && !this.isPaused) {
        try {
          this.synth.pause();
          this.synth.resume();
        } catch (e) {
          // ignore
        }
      }
    }, 10000);
  }

  stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  // Reliable Soft Pause (avoids browser thread freeze)
  pause() {
    if (!this.isPlaying || this.isPaused) return;

    this.isPaused = true;
    this.stopKeepAlive();

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (this.simTimeout) {
      clearTimeout(this.simTimeout);
      this.simTimeout = null;
    }

    this.notify('pause', { currentChunkIndex: this.currentChunkIndex });
  }

  // Reliable Soft Resume
  resume() {
    if (!this.isPlaying || !this.isPaused) return;

    this.isPaused = false;
    this.startKeepAlive();
    this.notify('resume', { currentChunkIndex: this.currentChunkIndex });

    // Resume speaking from the exact current sentence
    this.speakChunk(this.currentChunkIndex);
  }

  stopAudioEngine() {
    this.stopKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (this.simTimeout) {
      clearTimeout(this.simTimeout);
      this.simTimeout = null;
    }
    if (typeof window !== 'undefined') {
      window._bioListenActiveUtterance = null;
    }
  }

  stop() {
    this.stopAudioEngine();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.notify('stop', {});
  }

  rewind() {
    if (this.isPlaying) {
      const target = Math.max(0, this.currentChunkIndex - 1);
      this.speakChunk(target);
    }
  }

  forward() {
    if (this.isPlaying && this.currentChunkIndex + 1 < this.textChunks.length) {
      this.speakChunk(this.currentChunkIndex + 1);
    }
  }

  // Quick 1-click test sound
  testArabicVoice() {
    const testText = "أهلاً بيك يا بطل! الصوت شغال تمام بلهجة مصرية عامية دارجة، يلا نبدأ نذاكر الأحياء سوا.";
    this.speak(testText);
  }
}

export const speech = new SpeechService();
