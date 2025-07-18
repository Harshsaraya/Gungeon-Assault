import { Enemy as EnemyInterface, Vector2 } from './types';
import { distance, normalize, multiply, add, random, randomInt } from './utils';

export class Enemy implements EnemyInterface {
  position: Vector2;
  velocity: Vector2;
  size: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
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
  
  constructor(x: number, y: number, type: string = 'basic', waveMultiplier: number = 1, formationPos?: Vector2) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.size = { x: 22, y: 22 };
    this.rotation = Math.PI / 2; // Face straight down (90 degrees)
    this.type = type;
    this.lastAttack = 0;
    this.lastShot = 0;
    this.target = null;
    this.aiState = 'chase';
    this.formationPosition = formationPos || { x, y };
    
    this.setupEnemyType(type, waveMultiplier);
  }
  
  private setupEnemyType(type: string, waveMultiplier: number) {
    // Base difficulty scaling - starts easy, gets harder
    const difficultyScale = Math.min(1 + (waveMultiplier - 1) * 0.12, 3.0);
    
    const baseStats = {
      scout: {
        health: 30,
        speed: 85, // Faster scouts
        attackDamage: 12,
        attackCooldown: 1000,
        color: '#FF6B6B',
        size: { x: 18, y: 18 },
        experience: 15,
        score: 30
      },
      soldier: {
        health: 50,
        speed: 70, // Aggressive soldiers
        attackDamage: 18,
        attackCooldown: 800,
        color: '#4ECDC4',
        size: { x: 20, y: 20 },
        experience: 20,
        score: 60
      },
      heavy: {
        health: 90,
        speed: 55, // Slower but persistent
        attackDamage: 28,
        attackCooldown: 1200,
        color: '#9B59B6',
        size: { x: 26, y: 26 },
        experience: 30,
        score: 120
      },
      sniper: {
        health: 40,
        speed: 60, // Medium speed, precise
        attackDamage: 25,
        attackCooldown: 1500,
        color: '#E74C3C',
        size: { x: 19, y: 19 },
        experience: 25,
        score: 100
      },
      basic: {
        health: 40,
        speed: 75, // Standard aggressive speed
        attackDamage: 15,
        attackCooldown: 900,
        color: '#FF8E53',
        size: { x: 20, y: 20 },
        experience: 18,
        score: 50
      }
    };

    const stats = baseStats[type as keyof typeof baseStats] || baseStats.basic;
    
    // Apply difficulty scaling
    this.health = this.maxHealth = Math.floor(stats.health * difficultyScale);
    this.speed = stats.speed;
    this.attackDamage = Math.floor(stats.attackDamage * difficultyScale);
    this.attackCooldown = stats.attackCooldown;
    this.color = stats.color;
    this.size = stats.size;
    this.experienceValue = Math.floor(stats.experience * difficultyScale);
    this.scoreValue = Math.floor(stats.score * difficultyScale);
  }
  
  update(deltaTime: number, playerPosition: Vector2) {
    this.target = playerPosition;
    
    // Keep rotation fixed to face straight down
    this.rotation = Math.PI / 2; // Always face downward (90 degrees)
    
    // Always move straight toward the player
    this.moveTowardsPlayer(deltaTime, playerPosition);
    
    // Update position
    this.position = add(this.position, multiply(this.velocity, deltaTime));
    
    // Keep enemies within reasonable bounds (allow some off-screen movement)
    this.position.x = Math.max(-50, Math.min(850, this.position.x));
    this.position.y = Math.max(-100, Math.min(650, this.position.y));
  }
  
  private moveTowardsPlayer(deltaTime: number, playerPosition: Vector2) {
    // Calculate normalized direction vector to player
    const direction = normalize({
      x: playerPosition.x - this.position.x,
      y: playerPosition.y - this.position.y
    });
    
    // Different movement behaviors based on enemy type
    let movementSpeed = this.speed;
    let movementDirection = direction;
    
    switch (this.type) {
      case 'scout':
        // Scouts move in a slightly erratic pattern while pursuing
        const scoutNoise = {
          x: Math.sin(Date.now() * 0.005) * 0.3,
          y: Math.cos(Date.now() * 0.007) * 0.3
        };
        movementDirection.x += scoutNoise.x;
        movementDirection.y += scoutNoise.y;
        movementDirection = normalize(movementDirection);
        break;
        
      case 'heavy':
        // Heavy units move straight and steady
        // No modifications needed - pure direct movement
        break;
        
      case 'sniper':
        // Snipers try to maintain some distance while following
        const distToPlayer = distance(this.position, playerPosition);
        if (distToPlayer < 150) {
          // Too close - back away slightly while still following
          movementSpeed *= 0.7;
          movementDirection.x += (Math.random() - 0.5) * 0.4;
          movementDirection.y += (Math.random() - 0.5) * 0.4;
          movementDirection = normalize(movementDirection);
        }
        break;
        
      case 'soldier':
        // Soldiers move aggressively straight at the player
        movementSpeed *= 1.1;
        break;
        
      default: // basic
        // Basic enemies move straight toward player
        break;
    }
    
    // Apply movement
    this.velocity = multiply(movementDirection, movementSpeed);
  }
  
  canAttack(): boolean {
    return Date.now() - this.lastAttack >= this.attackCooldown;
  }
  
  canShoot(): boolean {
    return Date.now() - this.lastShot >= this.attackCooldown;
  }
  
  attack(): boolean {
    if (this.canAttack()) {
      this.lastAttack = Date.now();
      return true;
    }
    return false;
  }
  
  shoot(): boolean {
    if (this.canShoot()) {
      this.lastShot = Date.now();
      return true;
    }
    return false;
  }
  
  takeDamage(damage: number) {
    this.health = Math.max(0, this.health - damage);
  }
  
  isDead(): boolean {
    return this.health <= 0;
  }
}

export function createRandomEnemy(x: number, y: number, waveNumber: number, formationPos?: Vector2): Enemy {
  const types = ['basic', 'scout', 'soldier', 'heavy', 'sniper'];
  
  // Progressive enemy type introduction
  let availableTypes = ['basic', 'scout'];
  
  if (waveNumber >= 3) availableTypes.push('soldier');
  if (waveNumber >= 5) availableTypes.push('heavy');
  if (waveNumber >= 7) availableTypes.push('sniper');
  
  // Weight distribution based on wave
  let typeWeights: { [key: string]: number } = {
    'basic': 0.5,
    'scout': 0.5,
    'soldier': 0,
    'heavy': 0,
    'sniper': 0
  };
  
  if (waveNumber >= 3) {
    typeWeights = { 'basic': 0.4, 'scout': 0.4, 'soldier': 0.2, 'heavy': 0, 'sniper': 0 };
  }
  if (waveNumber >= 5) {
    typeWeights = { 'basic': 0.3, 'scout': 0.3, 'soldier': 0.25, 'heavy': 0.15, 'sniper': 0 };
  }
  if (waveNumber >= 7) {
    typeWeights = { 'basic': 0.25, 'scout': 0.25, 'soldier': 0.25, 'heavy': 0.15, 'sniper': 0.1 };
  }
  if (waveNumber >= 10) {
    typeWeights = { 'basic': 0.2, 'scout': 0.2, 'soldier': 0.3, 'heavy': 0.2, 'sniper': 0.1 };
  }
  
  const rand = Math.random();
  let cumulative = 0;
  let selectedType = 'basic';
  
  for (const type of availableTypes) {
    cumulative += typeWeights[type];
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }
  
  return new Enemy(x, y, selectedType, waveNumber, formationPos);
}

export function getEnemyCountForWave(waveNumber: number): number {
  // Start easy and gradually increase
  if (waveNumber <= 2) return 4;
  if (waveNumber <= 4) return 5;
  if (waveNumber <= 6) return 6;
  if (waveNumber <= 8) return 7;
  if (waveNumber <= 10) return 9;
  if (waveNumber <= 15) return 11;
  return Math.min(12 + Math.floor((waveNumber - 15) / 3), 18);
}

export function createFormationEnemies(waveNumber: number): Enemy[] {
  const enemies: Enemy[] = [];
  const enemyCount = getEnemyCountForWave(waveNumber);
  
  // Create formation patterns that spawn from different directions
  const formations = [
    'line', 'v-formation', 'diamond', 'scattered', 'pincer', 'flanking'
  ];
  
  const formation = formations[Math.min(Math.floor(waveNumber / 3), formations.length - 1)];
  
  for (let i = 0; i < enemyCount; i++) {
    let x, y, formationPos;
    
    switch (formation) {
      case 'line':
        x = 100 + (i * (600 / enemyCount));
        y = -60;
        formationPos = { x, y: 80 };
        break;
        
      case 'v-formation':
        const center = enemyCount / 2;
        const offset = Math.abs(i - center) * 40;
        x = 400 + (i - center) * 60;
        y = -60 - offset;
        formationPos = { x, y: 80 + offset };
        break;
        
      case 'diamond':
        const rows = Math.ceil(Math.sqrt(enemyCount));
        const row = Math.floor(i / rows);
        const col = i % rows;
        x = 350 + (col - rows/2) * 50 + (row % 2) * 25;
        y = -60 - row * 40;
        formationPos = { x, y: 80 + row * 30 };
        break;
        
      case 'pincer':
        const side = i % 2;
        const groupIndex = Math.floor(i / 2);
        x = side === 0 ? 50 + groupIndex * 35 : 750 - groupIndex * 35;
        y = -60 - groupIndex * 25;
        formationPos = { x: side === 0 ? 200 : 600, y: 100 + groupIndex * 40 };
        break;
        
      case 'flanking':
        // Enemies come from sides and top
        if (i < enemyCount / 3) {
          // Left flank
          x = -50;
          y = 100 + i * 40;
        } else if (i < (enemyCount * 2) / 3) {
          // Right flank
          x = 850;
          y = 100 + (i - enemyCount / 3) * 40;
        } else {
          // Top center
          x = 300 + (i - (enemyCount * 2) / 3) * 60;
          y = -60;
        }
        formationPos = { x: 400, y: 300 }; // All converge on center
        break;
        
      default: // scattered
        x = random(50, 750);
        y = random(-150, -30);
        formationPos = { x, y: random(60, 150) };
    }
    
    enemies.push(createRandomEnemy(x, y, waveNumber, formationPos));
  }
  
  return enemies;
}