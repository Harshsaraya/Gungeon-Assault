import { Enemy } from './Enemy';
import { Vector2 } from './types';
import { distance, normalize, multiply, add, random } from './utils';

export class Boss extends Enemy {
  phase: number = 1;
  maxPhases: number = 3;
  phaseHealth: number[];
  attackPatterns: string[] = [];
  currentPattern: string = 'basic';
  patternTimer: number = 0;
  patternDuration: number = 2000; // Faster pattern switching for more challenge
  specialAttackCooldown: number = 0;
  isEnraged: boolean = false;
  shieldActive: boolean = false;
  shieldCooldown: number = 0;
  teleportCooldown: number = 0;
  bossType: string = 'destroyer';
  animationFrame: number = 0;
  animationTimer: number = 0;
  deathAnimationTimer: number = 0;
  isDying: boolean = false;
  
  constructor(x: number, y: number, waveNumber: number, type: string = 'destroyer') {
    super(x, y, 'boss', waveNumber);
    this.bossType = type;
    this.setupBossStats(waveNumber, type);
    this.setupAttackPatterns();
  }
  
  private setupBossStats(waveNumber: number, type: string) {
    const difficultyScale = Math.min(1 + (waveNumber - 1) * 0.15, 4.0);
    
    // Boss type configurations
    const bossConfigs = {
      destroyer: {
        health: 2500,
        speed: 35,
        damage: 80,
        cooldown: 250,
        color: '#8B0000',
        size: { x: 90, y: 90 },
        phases: 3
      },
      battlecruiser: {
        health: 4000,
        speed: 30,
        damage: 120,
        cooldown: 200,
        color: '#FF4500',
        size: { x: 110, y: 110 },
        phases: 4
      },
      dreadnought: {
        health: 6500,
        speed: 25,
        damage: 180,
        cooldown: 180,
        color: '#FF0000',
        size: { x: 130, y: 130 },
        phases: 5
      },
      mothership: {
        health: 10000,
        speed: 20,
        damage: 250,
        cooldown: 150,
        color: '#DC143C',
        size: { x: 150, y: 150 },
        phases: 6
      },
      voidlord: {
        health: 15000,
        speed: 40,
        damage: 350,
        cooldown: 120,
        color: '#4B0082',
        size: { x: 170, y: 170 },
        phases: 7
      },
      titan: {
        health: 25000,
        speed: 15,
        damage: 500,
        cooldown: 100,
        color: '#FFD700',
        size: { x: 200, y: 200 },
        phases: 8
      }
    };

    const config = bossConfigs[type as keyof typeof bossConfigs] || bossConfigs.destroyer;
    
    this.health = this.maxHealth = Math.floor(config.health * difficultyScale);
    this.speed = config.speed;
    this.attackDamage = Math.floor(config.damage * difficultyScale);
    this.attackCooldown = config.cooldown;
    this.color = config.color;
    this.size = config.size;
    this.maxPhases = config.phases;
    this.experienceValue = Math.floor(500 * difficultyScale);
    this.scoreValue = Math.floor(5000 * difficultyScale);
    
    // Phase health thresholds
    this.phaseHealth = [];
    for (let i = 1; i < this.maxPhases; i++) {
      this.phaseHealth.push(this.maxHealth * (1 - i / this.maxPhases));
    }
    this.phaseHealth.push(0);
  }
  
  private setupAttackPatterns() {
    const basePatterns = ['basic', 'spiral', 'burst'];
    const advancedPatterns = ['charge', 'rain', 'laser', 'homing', 'nova', 'barrage'];
    
    this.attackPatterns = [...basePatterns];
    
    if (this.phase >= 2) {
      this.attackPatterns.push(...advancedPatterns.slice(0, 2));
    }
    if (this.phase >= 3) {
      this.attackPatterns.push(...advancedPatterns.slice(2, 4));
    }
    if (this.phase >= 4) {
      this.attackPatterns.push(...advancedPatterns.slice(4));
    }
  }
  
  update(deltaTime: number, playerPosition: Vector2) {
    if (this.isDying) {
      this.updateDeathAnimation(deltaTime);
      return;
    }

    super.update(deltaTime, playerPosition);
    
    // Update animations
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
    
    // Update phase based on health
    const oldPhase = this.phase;
    for (let i = 0; i < this.phaseHealth.length; i++) {
      if (this.health <= this.phaseHealth[i] && this.phase === i + 1) {
        this.phase = i + 2;
        break;
      }
    }
    
    if (oldPhase !== this.phase) {
      this.onPhaseChange();
    }
    
    // Update attack pattern
    this.updateAttackPattern(deltaTime);
    
    // Update cooldowns
    if (this.specialAttackCooldown > 0) {
      this.specialAttackCooldown -= deltaTime * 1000;
    }
    if (this.shieldCooldown > 0) {
      this.shieldCooldown -= deltaTime * 1000;
    }
    if (this.teleportCooldown > 0) {
      this.teleportCooldown -= deltaTime * 1000;
    }
    
    // Special abilities based on phase
    if (this.phase >= 3 && this.teleportCooldown <= 0 && Math.random() < 0.015) {
      this.teleport();
    }
    
    if (this.phase >= 2 && this.shieldCooldown <= 0 && Math.random() < 0.008) {
      this.activateShield();
    }
  }

  private updateDeathAnimation(deltaTime: number) {
    this.deathAnimationTimer += deltaTime;
    // Death animation lasts 2 seconds
    if (this.deathAnimationTimer >= 2.0) {
      this.health = 0; // Ensure boss is marked as dead
    }
  }
  
  private onPhaseChange() {
    this.patternTimer = 0;
    this.patternDuration = Math.max(1000, 2000 - (this.phase - 1) * 300);
    this.setupAttackPatterns();
    
    // Heal slightly on phase change
    this.health = Math.min(this.maxHealth, this.health + this.maxHealth * 0.1);
    
    // Increase stats
    this.speed *= 1.2;
    this.attackCooldown = Math.max(80, this.attackCooldown * 0.8);
    this.attackDamage *= 1.15;
    
    if (this.phase >= this.maxPhases - 1) {
      this.isEnraged = true;
    }
  }
  
  private updateAttackPattern(deltaTime: number) {
    this.patternTimer += deltaTime * 1000;
    
    if (this.patternTimer >= this.patternDuration) {
      this.patternTimer = 0;
      this.selectNewPattern();
    }
  }
  
  private selectNewPattern() {
    const availablePatterns = this.attackPatterns;
    let newPattern;
    
    do {
      newPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    } while (newPattern === this.currentPattern && availablePatterns.length > 1);
    
    this.currentPattern = newPattern;
  }
  
  private teleport() {
    this.position.x = random(100, 700);
    this.position.y = random(50, 200);
    this.teleportCooldown = 6000;
  }
  
  private activateShield() {
    this.shieldActive = true;
    this.shieldCooldown = 12000;
    setTimeout(() => {
      this.shieldActive = false;
    }, 4000);
  }
  
  takeDamage(damage: number) {
    if (this.isDying) return;
    
    if (this.shieldActive) {
      damage *= 0.3; // 70% damage reduction when shielded
    }
    super.takeDamage(damage);
    
    if (this.health <= 0 && !this.isDying) {
      this.startDeathAnimation();
    }
  }

  private startDeathAnimation() {
    this.isDying = true;
    this.deathAnimationTimer = 0;
  }

  isDead(): boolean {
    return this.isDying && this.deathAnimationTimer >= 2.0;
  }
  
  getBossAttackData(): BossAttackData | null {
    if (!this.canShoot() || this.isDying) return null;
    
    switch (this.currentPattern) {
      case 'spiral':
        return this.getSpiralAttack();
      case 'burst':
        return this.getBurstAttack();
      case 'charge':
        return this.getChargeAttack();
      case 'rain':
        return this.getRainAttack();
      case 'laser':
        return this.getLaserAttack();
      case 'homing':
        return this.getHomingAttack();
      case 'nova':
        return this.getNovaAttack();
      case 'barrage':
        return this.getBarrageAttack();
      default:
        return this.getBasicAttack();
    }
  }
  
  private getBasicAttack(): BossAttackData {
    if (!this.target) return { bullets: [], type: 'basic' };
    
    const direction = normalize({
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y
    });
    
    const bulletCount = this.phase * 2;
    const bullets: BossBullet[] = [];
    
    for (let i = 0; i < bulletCount; i++) {
      const spread = (bulletCount > 1) ? 0.3 : 0;
      const angle = Math.atan2(direction.y, direction.x) + (i - (bulletCount - 1) / 2) * spread;
      
      bullets.push({
        position: { ...this.position },
        velocity: {
          x: Math.cos(angle) * 450,
          y: Math.sin(angle) * 450
        },
        damage: this.attackDamage,
        size: 12,
        color: this.color
      });
    }
    
    return { bullets, type: 'basic' };
  }
  
  private getSpiralAttack(): BossAttackData {
    const bullets: BossBullet[] = [];
    const bulletCount = 16 + this.phase * 4;
    const time = Date.now() * 0.01;
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = (Math.PI * 2 * i / bulletCount) + time;
      
      bullets.push({
        position: { ...this.position },
        velocity: {
          x: Math.cos(angle) * 400,
          y: Math.sin(angle) * 400
        },
        damage: this.attackDamage * 0.8,
        size: 10,
        color: '#FF6B6B'
      });
    }
    
    return { bullets, type: 'spiral' };
  }
  
  private getBurstAttack(): BossAttackData {
    const bullets: BossBullet[] = [];
    const burstCount = 20 + this.phase * 6;
    
    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 * i / burstCount);
      
      bullets.push({
        position: { ...this.position },
        velocity: {
          x: Math.cos(angle) * 500,
          y: Math.sin(angle) * 500
        },
        damage: this.attackDamage * 0.7,
        size: 11,
        color: '#FF4500'
      });
    }
    
    return { bullets, type: 'burst' };
  }
  
  private getChargeAttack(): BossAttackData {
    if (!this.target) return { bullets: [], type: 'charge' };
    
    const direction = normalize({
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y
    });
    
    const bullets: BossBullet[] = [];
    
    for (let i = 0; i < this.phase + 1; i++) {
      const spread = i * 0.2;
      bullets.push({
        position: { ...this.position },
        velocity: {
          x: (direction.x + Math.sin(spread)) * 800,
          y: (direction.y + Math.cos(spread)) * 800
        },
        damage: this.attackDamage * 3,
        size: 18,
        color: '#FFD700'
      });
    }
    
    return { bullets, type: 'charge' };
  }
  
  private getRainAttack(): BossAttackData {
    const bullets: BossBullet[] = [];
    const rainCount = 40 + this.phase * 10;
    
    for (let i = 0; i < rainCount; i++) {
      bullets.push({
        position: {
          x: random(0, 800),
          y: -50
        },
        velocity: {
          x: random(-150, 150),
          y: random(350, 550)
        },
        damage: this.attackDamage * 0.6,
        size: 8,
        color: '#9370DB'
      });
    }
    
    return { bullets, type: 'rain' };
  }
  
  private getLaserAttack(): BossAttackData {
    if (!this.target) return { bullets: [], type: 'laser' };
    
    const bullets: BossBullet[] = [];
    const direction = normalize({
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y
    });
    
    for (let i = 0; i < 12; i++) {
      bullets.push({
        position: { 
          x: this.position.x + direction.x * i * 25,
          y: this.position.y + direction.y * i * 25
        },
        velocity: {
          x: direction.x * 900,
          y: direction.y * 900
        },
        damage: this.attackDamage * 2,
        size: 15,
        color: '#00FFFF'
      });
    }
    
    return { bullets, type: 'laser' };
  }
  
  private getHomingAttack(): BossAttackData {
    if (!this.target) return { bullets: [], type: 'homing' };
    
    const bullets: BossBullet[] = [];
    const homingCount = 8 + this.phase * 2;
    
    for (let i = 0; i < homingCount; i++) {
      const angle = (Math.PI * 2 * i / homingCount);
      
      bullets.push({
        position: { ...this.position },
        velocity: {
          x: Math.cos(angle) * 250,
          y: Math.sin(angle) * 250
        },
        damage: this.attackDamage * 1.5,
        size: 12,
        color: '#FF69B4',
        homing: true,
        target: { ...this.target }
      });
    }
    
    return { bullets, type: 'homing' };
  }

  private getNovaAttack(): BossAttackData {
    const bullets: BossBullet[] = [];
    const rings = 3;
    const bulletsPerRing = 12;
    
    for (let ring = 0; ring < rings; ring++) {
      for (let i = 0; i < bulletsPerRing; i++) {
        const angle = (Math.PI * 2 * i / bulletsPerRing) + (ring * 0.2);
        const speed = 300 + ring * 100;
        
        bullets.push({
          position: { ...this.position },
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          damage: this.attackDamage * 0.9,
          size: 10,
          color: '#FF1493'
        });
      }
    }
    
    return { bullets, type: 'nova' };
  }

  private getBarrageAttack(): BossAttackData {
    if (!this.target) return { bullets: [], type: 'barrage' };
    
    const bullets: BossBullet[] = [];
    const salvos = 5;
    
    for (let salvo = 0; salvo < salvos; salvo++) {
      const direction = normalize({
        x: this.target.x - this.position.x,
        y: this.target.y - this.position.y
      });
      
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 0.3;
        const angle = Math.atan2(direction.y, direction.x) + spread;
        
        bullets.push({
          position: { ...this.position },
          velocity: {
            x: Math.cos(angle) * (600 + salvo * 50),
            y: Math.sin(angle) * (600 + salvo * 50)
          },
          damage: this.attackDamage * 1.2,
          size: 13,
          color: '#DC143C'
        });
      }
    }
    
    return { bullets, type: 'barrage' };
  }
}

export interface BossBullet {
  position: Vector2;
  velocity: Vector2;
  damage: number;
  size: number;
  color: string;
  homing?: boolean;
  target?: Vector2;
}

export interface BossAttackData {
  bullets: BossBullet[];
  type: string;
}

export function createBoss(waveNumber: number, type?: string): Boss {
  const bossTypes = ['destroyer', 'battlecruiser', 'dreadnought', 'mothership', 'voidlord', 'titan'];
  const selectedType = type || bossTypes[Math.min(Math.floor((waveNumber - 1) / 5), bossTypes.length - 1)];
  
  return new Boss(400 - 50, -100, waveNumber, selectedType);
}

export function isBossWave(waveNumber: number): boolean {
  return waveNumber % 5 === 0;
}