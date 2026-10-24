// Speech Synthesis Service for BioListen Arabic Audio Experience

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.rate = 1.0;
    this.voices = [];
    this.listeners = new Set();
    this.activeText = '';
    this.currentChunkIndex = 0;
    this.textChunks = [];

    if (this.synth) {
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getArabicVoice() {
    if (!this.voices.length) this.loadVoices();
    // Look for Arabic voices: ar-SA, ar-EG, ar, etc.
    const arVoice = this.voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arab'));
    return arVoice || null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  }

  setRate(newRate) {
    this.rate = Math.max(0.75, Math.min(2.0, newRate));
    if (this.isPlaying && !this.isPaused) {
      // restart current chunk with new rate
      const currentChunk = this.textChunks[this.currentChunkIndex];
      if (currentChunk) {
        this.synth.cancel();
        this.speakChunk(this.currentChunkIndex);
      }
    }
    this.notify('rateChange', { rate: this.rate });
  }

  speak(text, onChunkProgress = null) {
    if (!this.synth) {
      this.simulateSpeech(text, onChunkProgress);
      return;
    }

    this.stop();

    if (!text || !text.trim()) return;

    this.activeText = text;
    this.onProgressCallback = onChunkProgress;

    // Split text into natural Arabic sentence chunks for smooth Web Speech API playback without timeout bugs
    this.textChunks = text
      .split(/(?<=[.،؛:!؟\n])\s+/)
      .filter(c => c && c.trim().length > 0);

    if (this.textChunks.length === 0) {
      this.textChunks = [text];
    }

    this.currentChunkIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;

    this.notify('start', { text, totalChunks: this.textChunks.length });
    this.speakChunk(0);
  }

  speakChunk(index) {
    if (index >= this.textChunks.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.notify('end', {});
      return;
    }

    this.currentChunkIndex = index;
    const chunk = this.textChunks[index];
    const utterance = new SpeechSynthesisUtterance(chunk);
    
    const arVoice = this.getArabicVoice();
    if (arVoice) {
      utterance.voice = arVoice;
      utterance.lang = arVoice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.rate = this.rate;
    utterance.pitch = 1.0;

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
      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (this.isPlaying && !this.isPaused) {
        this.speakChunk(index + 1);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  simulateSpeech(text, onChunkProgress) {
    // Fallback if browser doesn't have Web Speech
    this.isPlaying = true;
    this.isPaused = false;
    this.notify('start', { text });
    
    const words = text.split(' ').length;
    const durationMs = (words / 2.5) * 1000;
    
    let elapsed = 0;
    const interval = setInterval(() => {
      if (this.isPaused) return;
      elapsed += 300;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      this.notify('chunkStart', { progress });
      if (elapsed >= durationMs) {
        clearInterval(interval);
        this.isPlaying = false;
        this.notify('end', {});
      }
    }, 300);

    this.simInterval = interval;
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify('pause', {});
    }
  }

  resume() {
    if (this.synth && this.isPlaying && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify('resume', {});
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.notify('stop', {});
  }

  rewind() {
    if (this.isPlaying) {
      const targetIndex = Math.max(0, this.currentChunkIndex - 2);
      this.stop();
      this.isPlaying = true;
      this.speakChunk(targetIndex);
    }
  }

  forward() {
    if (this.isPlaying && this.currentChunkIndex + 1 < this.textChunks.length) {
      const targetIndex = Math.min(this.textChunks.length - 1, this.currentChunkIndex + 1);
      this.stop();
      this.isPlaying = true;
      this.speakChunk(targetIndex);
    }
  }
}

export const speech = new SpeechService();
