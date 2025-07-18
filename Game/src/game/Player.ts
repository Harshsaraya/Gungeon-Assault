import { GameObject, Vector2, Weapon, PlayerStats, PowerUp } from './types';
import { add, multiply, normalize, clamp } from './utils';

export class Player implements GameObject {
  position: Vector2;
  velocity: Vector2;
  size: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  speed: number;
  baseSpeed: number;
  weapon: Weapon;
  lastShot: number;
  lastAlternateShot: number;
  experience: number;
  level: number;
  coins: number;
  stats: PlayerStats;
  isReloading: boolean;
  reloadStartTime: number;
  shield: number;
  maxShield: number;
  powerUps: PowerUp[];
  
  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.size = { x: 40, y: 40 };
    this.rotation = -Math.PI / 2;
    this.health = 200;
    this.maxHealth = 200;
    this.speed = 280;
    this.baseSpeed = 280;
    this.lastShot = 0;
    this.lastAlternateShot = 0;
    this.experience = 0;
    this.level = 1;
    this.coins = 0;
    this.isReloading = false;
    this.reloadStartTime = 0;
    this.shield = 100;
    this.maxShield = 100;
    this.powerUps = [];
    
    this.stats = {
      kills: 0,
      accuracy: 0,
      shotsFired: 0,
      shotsHit: 0,
      coinsCollected: 0,
      roomsCleared: 0
    };
    
    this.weapon = {
      name: 'Quantum Pulse Cannon',
      damage: 120,
      fireRate: 200,
      bulletSpeed: 900,
      spread: 0.0,
      bulletCount: 1,
      ammo: 40,
      maxAmmo: 40,
      reloadTime: 1400,
      color: '#00FFFF',
      tier: 0
    };
  }
  
  update(deltaTime: number, input: any) {
    // Handle reloading
    if (this.isReloading) {
      if (Date.now() - this.reloadStartTime >= this.weapon.reloadTime) {
        this.weapon.ammo = this.weapon.maxAmmo;
        this.isReloading = false;
      }
    }
    
    // Update power-ups
    this.updatePowerUps(deltaTime);
    
    // Movement - combine keyboard and touch input
    const moveVector = { x: 0, y: 0 };
    
    // Keyboard input
    if (input.keys.w || input.keys.KeyW || input.keys.ArrowUp) moveVector.y -= 1;
    if (input.keys.s || input.keys.KeyS || input.keys.ArrowDown) moveVector.y += 1;
    if (input.keys.a || input.keys.KeyA || input.keys.ArrowLeft) moveVector.x -= 1;
    if (input.keys.d || input.keys.KeyD || input.keys.ArrowRight) moveVector.x += 1;
    
    // Touch input (if available)
    if (input.movement) {
      moveVector.x += input.movement.x;
      moveVector.y += input.movement.y;
    }
    
    // Normalize combined input
    if (moveVector.x !== 0 || moveVector.y !== 0) {
      const normalized = normalize(moveVector);
      this.velocity = multiply(normalized, this.speed);
    } else {
      this.velocity = { x: 0, y: 0 };
    }
    
    // Update position
    this.position = add(this.position, multiply(this.velocity, deltaTime));
    
    // Keep rotation fixed for straight shooting
    this.rotation = -Math.PI / 2;
    
    // Boundary constraints
    this.position.x = clamp(this.position.x, 0, 800 - this.size.x);
    this.position.y = clamp(this.position.y, 0, 600 - this.size.y);
    
    // Update accuracy
    if (this.stats.shotsFired > 0) {
      this.stats.accuracy = (this.stats.shotsHit / this.stats.shotsFired) * 100;
    }
  }
  
  updatePowerUps(deltaTime: number) {
    const currentTime = Date.now();
    
    // Reset speed to base
    this.speed = this.baseSpeed;
    
    // Update active power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      const elapsed = (currentTime - powerUp.startTime) / 1000;
      
      if (elapsed >= powerUp.duration) {
        // Power-up expired
        this.powerUps.splice(i, 1);
        continue;
      }
      
      // Apply power-up effects
      switch (powerUp.type) {
        case 'speed_boost':
          this.speed = this.baseSpeed * 1.8;
          break;
        case 'damage_boost':
          // Applied in weapon damage calculation
          break;
        case 'rapid_fire':
          // Applied in fire rate calculation
          break;
        case 'multi_shot':
          // Applied in bullet count calculation
          break;
        case 'invincibility':
          // Applied in damage calculation
          break;
        case 'shield_regen':
          // Regenerate shield over time
          this.shield = Math.min(this.maxShield, this.shield + 20 * deltaTime);
          break;
        case 'health_regen':
          // Regenerate health over time
          this.health = Math.min(this.maxHealth, this.health + 15 * deltaTime);
          break;
      }
    }
  }
  
  canShoot(): boolean {
    let fireRate = this.weapon.fireRate;
    
    // Apply rapid fire power-up
    if (this.hasPowerUp('rapid_fire')) {
      fireRate = Math.max(fireRate * 0.25, 50);
    }
    
    return !this.isReloading && 
           Date.now() - this.lastShot >= fireRate && 
           this.weapon.ammo > 0;
  }
  
  canReload(): boolean {
    return !this.isReloading && this.weapon.ammo < this.weapon.maxAmmo;
  }
  
  canAlternateShoot(): boolean {
    const alternateFireRate = this.weapon.fireRate * 1.5;
    
    return !this.isReloading && 
           Date.now() - this.lastAlternateShot >= alternateFireRate && 
           this.weapon.ammo >= 2;
  }
  
  shoot() {
    if (this.canShoot()) {
      this.lastShot = Date.now();
      this.weapon.ammo--;
      this.stats.shotsFired++;
      
      // Auto-reload when empty
      if (this.weapon.ammo === 0) {
        this.reload();
      }
      
      return true;
    }
    return false;
  }
  
  alternateShoot() {
    if (this.canAlternateShoot()) {
      this.lastAlternateShot = Date.now();
      this.weapon.ammo -= 2;
      this.stats.shotsFired++;
      
      // Auto-reload when empty
      if (this.weapon.ammo <= 1) {
        this.reload();
      }
      
      return true;
    }
    return false;
  }
  
  getWeaponDamage(): number {
    let damage = this.weapon.damage;
    
    // Apply damage boost power-up
    if (this.hasPowerUp('damage_boost')) {
      damage *= 2.5;
    }
    
    // Level scaling
    damage += this.level * 15;
    
    return damage;
  }
  
  getAlternateWeaponDamage(): number {
    let damage = this.weapon.damage * 2.5;
    
    // Apply damage boost power-up
    if (this.hasPowerUp('damage_boost')) {
      damage *= 2.5;
    }
    
    // Level scaling
    damage += this.level * 25;
    
    return damage;
  }
  
  getBulletCount(): number {
    let count = this.weapon.bulletCount;
    
    // Apply multi-shot power-up
    if (this.hasPowerUp('multi_shot')) {
      count = Math.max(count * 3, 5);
    }
    
    return count;
  }
  
  getAlternateBulletCount(): number {
    return 1;
  }
  
  reload() {
    if (!this.isReloading && this.weapon.ammo < this.weapon.maxAmmo) {
      this.isReloading = true;
      this.reloadStartTime = Date.now();
      return true;
    }
    return false;
  }
  
  takeDamage(damage: number) {
    // Check invincibility
    if (this.hasPowerUp('invincibility')) {
      return;
    }
    
    // Shield absorbs damage first
    if (this.shield > 0) {
      const shieldDamage = Math.min(damage, this.shield);
      this.shield -= shieldDamage;
      damage -= shieldDamage;
    }
    
    // Apply remaining damage to health
    if (damage > 0) {
      this.health = Math.max(0, this.health - damage);
    }
  }
  
  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
  
  addShield(amount: number) {
    this.shield = Math.min(this.maxShield, this.shield + amount);
  }
  
  addAmmo(amount: number) {
    this.weapon.ammo = Math.min(this.weapon.maxAmmo, this.weapon.ammo + amount);
  }
  
  addExperience(amount: number) {
    this.experience += amount;
    const expNeeded = this.level * 150;
    if (this.experience >= expNeeded) {
      this.levelUp();
    }
  }
  
  addCoins(amount: number) {
    this.coins += amount;
    this.stats.coinsCollected += amount;
  }
  
  addPowerUp(type: string, duration: number) {
    // Remove existing power-up of same type
    this.powerUps = this.powerUps.filter(p => p.type !== type);
    
    // Add new power-up
    this.powerUps.push({
      type,
      duration,
      startTime: Date.now(),
      active: true
    });
  }
  
  hasPowerUp(type: string): boolean {
    return this.powerUps.some(p => p.type === type);
  }
  
  levelUp() {
    this.level++;
    this.experience = 0;
    this.maxHealth += 40;
    this.health = this.maxHealth;
    this.baseSpeed += 12;
    this.speed = this.baseSpeed;
    this.maxShield += 30;
    this.shield = this.maxShield;
    
    // Weapon upgrade every level
    this.upgradeWeapon();
  }
  
  upgradeWeapon() {
    this.weapon.damage += 30;
    this.weapon.fireRate = Math.max(80, this.weapon.fireRate - 40);
    this.weapon.maxAmmo += 10;
    this.weapon.ammo = this.weapon.maxAmmo;
    this.weapon.bulletSpeed += 100;
    
    // Upgrade weapon name based on level
    if (this.level === 5) {
      this.weapon.name = 'Plasma Storm Cannon';
      this.weapon.color = '#FF00FF';
    } else if (this.level === 10) {
      this.weapon.name = 'Antimatter Destroyer';
      this.weapon.color = '#FFD700';
    } else if (this.level === 15) {
      this.weapon.name = 'Quantum Annihilator';
      this.weapon.color = '#FF4500';
    }
  }
  
  equipWeapon(newWeapon: Weapon) {
    // Keep current ammo if same weapon type
    if (this.weapon.name === newWeapon.name) {
      newWeapon.ammo = Math.min(this.weapon.ammo + newWeapon.ammo, newWeapon.maxAmmo);
    }
    
    this.weapon = { ...newWeapon };
    this.isReloading = false;
  }
  
  getReloadProgress(): number {
    if (!this.isReloading) return 1;
    const elapsed = Date.now() - this.reloadStartTime;
    return Math.min(elapsed / this.weapon.reloadTime, 1);
  }
  
  getPowerUpTimeRemaining(type: string): number {
    const powerUp = this.powerUps.find(p => p.type === type);
    if (!powerUp) return 0;
    
    const elapsed = (Date.now() - powerUp.startTime) / 1000;
    return Math.max(0, powerUp.duration - elapsed);
  }
}