export class AviatorSoundManager {
    ctx: AudioContext | null = null;
    oscillator: OscillatorNode | null = null;
    gainNode: GainNode | null = null;
    noiseBuffer: AudioBuffer | null = null;
    
    enabled: boolean = true;

    init() {
        if (!this.ctx && this.enabled) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.createNoiseBuffer();
            } catch(e) {}
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.init();
        else this.stopEngine();
    }

    createNoiseBuffer() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    playTick() {
        if (!this.ctx || !this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch(e) {}
    }

    startEngine() {
        if (!this.ctx || !this.enabled) return;
        try {
            this.oscillator = this.ctx.createOscillator();
            this.gainNode = this.ctx.createGain();
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.ctx.destination);
            
            this.oscillator.type = 'sawtooth';
            this.oscillator.frequency.setValueAtTime(40, this.ctx.currentTime);
            this.gainNode.gain.setValueAtTime(0.02, this.ctx.currentTime);
            this.oscillator.start();
        } catch(e) {}
    }

    rampEngine(multiplier: number) {
        if (this.oscillator && this.ctx && this.enabled) {
            try {
                // Pitch goes up with multiplier, capped
                const freq = Math.min(40 + Math.pow(multiplier, 1.2) * 5, 300);
                this.oscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.2);
            } catch(e) {}
        }
    }

    stopEngine() {
        if (this.oscillator && this.ctx) {
            try {
                this.oscillator.stop(this.ctx.currentTime + 0.1);
                this.oscillator = null;
            } catch(e) {}
        }
    }

    playCrash() {
        if (!this.ctx || !this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
            
            if (this.noiseBuffer) {
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.noiseBuffer;
                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                noise.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                noise.start();
            }
        } catch(e) {}
    }

    playCashout(isUser = false) {
        if (!this.ctx || !this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            // User cashout is louder and higher pitch
            osc.frequency.setValueAtTime(isUser ? 600 : 400, this.ctx.currentTime);
            osc.frequency.setTargetAtTime(isUser ? 1200 : 800, this.ctx.currentTime, 0.1);
            gain.gain.setValueAtTime(isUser ? 0.3 : 0.02, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch(e) {}
    }
}

export const soundManager = new AviatorSoundManager();
