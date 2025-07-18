export interface Vector2 {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2;
  velocity: Vector2;
  size: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
}

export interface Bullet {
  position: Vector2;
  velocity: Vector2;
  damage: number;
  lifetime: number;
  size: number;
  color: string;
  isPlayerBullet: boolean;
  homing?: boolean;
  target?: Vector2;
}

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  enemies: Enemy[];
  pickups: Pickup[];
  cleared: boolean;
  waveNumber: number;
  enemiesRemaining: number;
  waveCompleted: boolean;
  boss?: Boss;
}

export interface Weapon {
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  spread: number;
  bulletCount: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  color: string;
  tier: number;
}

export interface Enemy extends GameObject {
  type: string;
  speed: number;
  attackDamage: number;
  lastAttack: number;
  attackCooldown: number;
  target: Vector2 | null;
  aiState: 'idle' | 'chase' | 'attack' | 'retreat';
  color: string;
  experienceValue: number;
  scoreValue: number;
  formationPosition: Vector2;
  lastShot: number;
}

export interface Boss extends Enemy {
  phase: number;
  maxPhases: number;
  phaseHealth: number[];
  attackPatterns: string[];
  currentPattern: string;
  patternTimer: number;
  patternDuration: number;
  specialAttackCooldown: number;
  isEnraged: boolean;
  shieldActive: boolean;
  shieldCooldown: number;
  teleportCooldown: number;
}

export interface Pickup {
  position: Vector2;
  type: 'health' | 'ammo' | 'weapon' | 'experience' | 'coin' | 'shield' | 'speed_boost' | 'damage_boost' | 'rapid_fire' | 'multi_shot' | 'invincibility' | 'shield_regen' | 'health_regen' | 'double_coins' | 'explosive_rounds' | 'piercing_rounds';
  value: number;
  color: string;
  size: number;
  lifetime: number;
  weapon?: Weapon;
}

export interface PlayerStats {
  kills: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
  coinsCollected: number;
  roomsCleared: number;
}

export interface PowerUp {
  type: string;
  duration: number;
  startTime: number;
  active: boolean;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  SHOP = 'SHOP'
}