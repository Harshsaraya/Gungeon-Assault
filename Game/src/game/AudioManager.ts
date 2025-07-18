export class AudioManager {
  private context: AudioContext | null = null;
  private masterVolume = 0.8;
  private sfxVolume = 0.9;
  private musicVolume = 0.6;
  private sounds: Map<string, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  
  constructor() {
    this.initializeAudio();
  }
  
  private async initializeAudio() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.generateSounds();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }
  
  private async generateSounds() {
    if (!this.context) return;
    
    // Generate enhanced sound effects
    this.sounds.set('shoot', this.createShootSound());
    this.sounds.set('enemy_shoot', this.createEnemyShootSound());
    this.sounds.set('boss_shoot', this.createBossShootSound());
    this.sounds.set('explosion', this.createExplosionSound());
    this.sounds.set('boss_explosion', this.createBossExplosionSound());
    this.sounds.set('pickup', this.createPickupSound());
    this.sounds.set('powerup', this.createPowerUpSound());
    this.sounds.set('hit', this.createHitSound());
    this.sounds.set('boss_hit', this.createBossHitSound());
    this.sounds.set('reload', this.createReloadSound());
    this.sounds.set('level_up', this.createLevelUpSound());
    this.sounds.set('wave_complete', this.createWaveCompleteSound());
    this.sounds.set('boss_intro', this.createBossIntroSound());
    this.sounds.set('boss_phase', this.createBossPhaseSound());
    this.sounds.set('boss_death', this.createBossDeathSound());
    this.sounds.set('game_over', this.createGameOverSound());
    this.sounds.set('shield_activate', this.createShieldSound());
    this.sounds.set('teleport', this.createTeleportSound());
  }
  
  private createShootSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.15;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 25);
      
      // Layered sound: laser + mechanical click
      const laser = Math.sin(2 * Math.PI * 1200 * t) * 0.6;
      const click = Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-t * 50) * 0.4;
      const noise = (Math.random() - 0.5) * 0.2;
      
      data[i] = (laser + click + noise) * envelope;
    }
    
    return buffer;
  }
  
  private createEnemyShootSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.12;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 30);
      
      // Lower pitched, more menacing
      const tone = Math.sin(2 * Math.PI * 800 * t) * 0.7;
      const distortion = Math.sin(2 * Math.PI * 1600 * t) * 0.3;
      
      data[i] = (tone + distortion) * envelope;
    }
    
    return buffer;
  }
  
  private createBossShootSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.25;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 15);
      
      // Deep, powerful boss weapon sound
      const bass = Math.sin(2 * Math.PI * 200 * t) * 0.8;
      const mid = Math.sin(2 * Math.PI * 600 * t) * 0.6;
      const high = Math.sin(2 * Math.PI * 1800 * t) * 0.4;
      const rumble = (Math.random() - 0.5) * 0.3;
      
      data[i] = (bass + mid + high + rumble) * envelope;
    }
    
    return buffer;
  }
  
  private createExplosionSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.8;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 6);
      
      // Realistic explosion with multiple frequency components
      const boom = Math.sin(2 * Math.PI * 80 * t) * 0.9;
      const crack = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 15) * 0.7;
      const noise = (Math.random() - 0.5) * 1.5;
      const rumble = Math.sin(2 * Math.PI * 40 * t) * 0.6;
      
      data[i] = (boom + crack + noise * 0.8 + rumble) * envelope;
    }
    
    return buffer;
  }
  
  private createBossExplosionSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 2.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 3);
      
      // Massive boss explosion
      const deepBoom = Math.sin(2 * Math.PI * 30 * t) * 1.2;
      const midBoom = Math.sin(2 * Math.PI * 120 * t) * 0.8;
      const crackle = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 8) * 0.6;
      const noise = (Math.random() - 0.5) * 2.0;
      
      data[i] = (deepBoom + midBoom + crackle + noise * 0.7) * envelope;
    }
    
    return buffer;
  }
  
  private createPickupSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.4;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 4);
      
      // Magical pickup sound with harmonics
      const fundamental = Math.sin(2 * Math.PI * 523 * t); // C5
      const third = Math.sin(2 * Math.PI * 659 * t); // E5
      const fifth = Math.sin(2 * Math.PI * 784 * t); // G5
      const octave = Math.sin(2 * Math.PI * 1047 * t); // C6
      const shimmer = Math.sin(2 * Math.PI * 2093 * t) * 0.3; // C7
      
      data[i] = (fundamental + third + fifth + octave * 0.7 + shimmer) * envelope * 0.25;
    }
    
    return buffer;
  }
  
  private createPowerUpSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.8;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 2.5);
      
      // Rising power-up sound with sparkle
      const freq = 440 + t * 1200; // Rising frequency
      const tone = Math.sin(2 * Math.PI * freq * t);
      const sparkle = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
      const harmony = Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.4;
      
      data[i] = (tone + sparkle + harmony) * envelope * 0.4;
    }
    
    return buffer;
  }
  
  private createHitSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.08;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 60);
      
      // Sharp impact sound
      const impact = Math.sin(2 * Math.PI * 1500 * t) * 0.7;
      const crack = (Math.random() - 0.5) * 1.5;
      
      data[i] = (impact + crack * 0.6) * envelope;
    }
    
    return buffer;
  }
  
  private createBossHitSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.15;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 40);
      
      // Metallic boss hit sound
      const clang = Math.sin(2 * Math.PI * 800 * t) * 0.8;
      const ring = Math.sin(2 * Math.PI * 2400 * t) * 0.5;
      const noise = (Math.random() - 0.5) * 0.8;
      
      data[i] = (clang + ring + noise * 0.7) * envelope;
    }
    
    return buffer;
  }
  
  private createReloadSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.6;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      
      // Multi-stage reload sound
      let signal = 0;
      
      // Initial click
      if (t < 0.1) {
        const envelope = Math.exp(-t * 30);
        signal += Math.sin(2 * Math.PI * 300 * t) * envelope * 0.6;
      }
      
      // Mechanical sounds
      if (t > 0.1 && t < 0.4) {
        const envelope = (t - 0.1) * 3;
        signal += (Math.random() - 0.5) * envelope * 0.3;
      }
      
      // Final click
      if (t > 0.5) {
        const envelope = Math.exp(-(t - 0.5) * 20);
        signal += Math.sin(2 * Math.PI * 400 * t) * envelope * 0.5;
      }
      
      data[i] = signal;
    }
    
    return buffer;
  }
  
  private createBossIntroSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 2.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.min(t * 2, 1) * Math.exp(-t * 0.8);
      
      // Ominous boss intro
      const drone = Math.sin(2 * Math.PI * 60 * t) * 0.8;
      const growl = Math.sin(2 * Math.PI * 120 * t) * 0.6;
      const tension = Math.sin(2 * Math.PI * (200 + t * 100) * t) * 0.4;
      
      data[i] = (drone + growl + tension) * envelope;
    }
    
    return buffer;
  }
  
  private createBossPhaseSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 1.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 3);
      
      // Phase transition sound
      const sweep = Math.sin(2 * Math.PI * (100 + t * 500) * t) * 0.7;
      const power = Math.sin(2 * Math.PI * 200 * t) * 0.5;
      
      data[i] = (sweep + power) * envelope;
    }
    
    return buffer;
  }
  
  private createBossDeathSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 3.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 1.2);
      
      // Epic boss death sound
      const collapse = Math.sin(2 * Math.PI * (200 - t * 150) * t) * 0.9;
      const explosion = (Math.random() - 0.5) * Math.exp(-t * 3) * 1.5;
      const echo = Math.sin(2 * Math.PI * 100 * t) * 0.6;
      
      data[i] = (collapse + explosion * 0.8 + echo) * envelope;
    }
    
    return buffer;
  }
  
  private createShieldSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.5;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 4);
      
      // Energy shield activation
      const energy = Math.sin(2 * Math.PI * 800 * t) * 0.6;
      const hum = Math.sin(2 * Math.PI * 200 * t) * 0.4;
      
      data[i] = (energy + hum) * envelope;
    }
    
    return buffer;
  }
  
  private createTeleportSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 0.4;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 8);
      
      // Teleport whoosh
      const whoosh = Math.sin(2 * Math.PI * (1000 - t * 800) * t) * 0.7;
      const sparkle = Math.sin(2 * Math.PI * 2000 * t) * 0.3;
      
      data[i] = (whoosh + sparkle) * envelope;
    }
    
    return buffer;
  }
  
  private createLevelUpSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 1.2;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 2);
      let signal = 0;
      
      notes.forEach((freq, index) => {
        const delay = index * 0.2;
        if (t >= delay) {
          signal += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 5);
        }
      });
      
      data[i] = signal * envelope * 0.2;
    }
    
    return buffer;
  }
  
  private createWaveCompleteSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 1.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 2.5);
      
      // Victory fanfare
      const triumph = Math.sin(2 * Math.PI * (440 + Math.sin(t * 12) * 200) * t);
      const harmony = Math.sin(2 * Math.PI * 554 * t) * 0.7;
      
      data[i] = (triumph + harmony) * envelope * 0.3;
    }
    
    return buffer;
  }
  
  private createGameOverSound(): AudioBuffer {
    if (!this.context) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.context.sampleRate * 2.0;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.context.sampleRate;
      const envelope = Math.exp(-t * 1.2);
      
      // Descending defeat sound
      const freq = 440 - t * 200;
      const defeat = Math.sin(2 * Math.PI * freq * t);
      const minor = Math.sin(2 * Math.PI * freq * 0.8 * t) * 0.6;
      
      data[i] = (defeat + minor) * envelope * 0.4;
    }
    
    return buffer;
  }
  
  playSound(soundName: string, volume: number = 1) {
    if (!this.context || !this.sounds.has(soundName)) return;
    
    try {
      const buffer = this.sounds.get(soundName)!;
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }
  
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }
}