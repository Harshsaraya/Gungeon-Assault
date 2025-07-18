import { Player } from './Player';
import { Enemy, createFormationEnemies } from './Enemy';
import { Boss, createBoss, isBossWave, BossBullet } from './Boss';
import { Level } from './Level';
import { ParticleSystem } from './Particle';
import { AudioManager } from './AudioManager';
import { TouchControls } from './TouchControls';
import { RoomTransition } from './RoomTransition';
import { Bullet, Vector2, Pickup, Room } from './types';
import { distance, normalize, multiply, add, random, circleCollision } from './utils';
import {
  createHealthPickup,
  createAmmoPickup,
  createExperiencePickup,
  createCoinPickup,
  createShieldPickup,
  createSpeedBoostPickup,
  createDamageBoostPickup,
  createRapidFirePickup,
  createMultiShotPickup,
  createInvincibilityPickup,
  createWeaponPickup,
  createShieldRegenPickup,
  createHealthRegenPickup,
  createDoubleCoinsPickup,
  createExplosiveRoundsPickup,
  createPiercingRoundsPickup,
  shouldDropPickup,
  getRandomPickupType
} from './Pickup';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private level: Level;
  private particles: ParticleSystem;
  private audio: AudioManager;
  private touchControls: TouchControls;
  private roomTransition: RoomTransition;
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private bossBullets: BossBullet[] = [];
  private lastTime = 0;
  private input = {
    keys: {} as { [key: string]: boolean },
    mouse: { x: 0, y: 0, pressed: false }
  };
  private gameState: 'start' | 'playing' | 'paused' | 'game_over' | 'boss_intro' = 'start';
  private score = 0;
  private screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  private lastEnemyShot = 0;
  private enemyShotCooldown = 600;
  private backgroundStars: Array<{ x: number; y: number; size: number; speed: number; brightness: number }> = [];
  private bossIntroTimer = 0;
  private survivalMode = false;
  private survivalTimer = 0;
  private survivalDuration = 300;
  private difficultyMultiplier = 1.0;
  private playerShipImage: HTMLImageElement | null = null;
  private enemyShipImages: Map<string, HTMLImageElement> = new Map();
  private bossImage: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player(400, 500);
    this.level = new Level();
    this.particles = new ParticleSystem();
    this.audio = new AudioManager();
    this.touchControls = new TouchControls(canvas);
    this.roomTransition = new RoomTransition();
    
    this.setupInput();
    this.generateStarfield();
    this.loadPlayerShip();
    this.loadEnemyShips();
    this.loadBossSprite();
    this.gameLoop();
  }

  private loadPlayerShip() {
    this.playerShipImage = new Image();
    this.playerShipImage.onload = () => {
      console.log('Player ship sprite loaded successfully!');
    };
    this.playerShipImage.onerror = () => {
      console.warn('Failed to load player ship sprite, using fallback rendering');
      this.playerShipImage = null;
    };
    this.playerShipImage.src = '/src/assets/playerShip3_blue.png';
  }

  private loadEnemyShips() {
    const enemyShips = [
      { type: 'basic', file: 'enemyRed1.png' },
      { type: 'scout', file: 'enemyRed2.png' },
      { type: 'soldier', file: 'enemyRed3.png' },
      { type: 'heavy', file: 'enemyRed4.png' },
      { type: 'sniper', file: 'enemyRed5.png' }
    ];

    enemyShips.forEach(ship => {
      const img = new Image();
      img.onload = () => {
        console.log(`Enemy ship ${ship.type} loaded successfully!`);
      };
      img.onerror = () => {
        console.warn(`Failed to load enemy ship ${ship.type}, using fallback rendering`);
      };
      img.src = `/src/assets/${ship.file}`;
      this.enemyShipImages.set(ship.type, img);
    });
  }

  private loadBossSprite() {
    this.bossImage = new Image();
    this.bossImage.onload = () => {
      console.log('🛸 Boss UFO sprite loaded successfully!');
    };
    this.bossImage.onerror = () => {
      console.warn('Failed to load boss sprite, using fallback rendering');
      this.bossImage = null;
    };
    this.bossImage.src = '/src/assets/ufoRed.png';
  }

  private generateStarfield() {
    for (let i = 0; i < 200; i++) {
      this.backgroundStars.push({
        x: random(0, this.canvas.width),
        y: random(0, this.canvas.height),
        size: random(0.5, 3.0),
        speed: random(20, 120),
        brightness: random(0.2, 1.0)
      });
    }
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
      
      if (this.gameState === 'start' && (e.code === 'Space' || e.code === 'Enter')) {
        this.startGame();
      }
      
      if (e.code === 'KeyR' && this.gameState === 'playing') {
        if (this.player.reload()) {
          this.audio.playSound('reload');
        }
      }
      
      if (e.code === 'Escape' && this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (e.code === 'Escape' && this.gameState === 'paused') {
        this.gameState = 'playing';
      }
      
      if (e.code === 'KeyT' && this.gameState === 'start') {
        this.survivalMode = !this.survivalMode;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouse.x = e.clientX - rect.left;
      this.input.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.input.mouse.pressed = true;
        
        if (this.gameState === 'start') {
          this.startGame();
        }
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.input.mouse.pressed = false;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private startGame() {
    this.gameState = 'playing';
    this.level.generateLevel();
    this.score = 0;
    this.player = new Player(400, 500);
    this.bullets = [];
    this.enemyBullets = [];
    this.bossBullets = [];
    this.particles = new ParticleSystem();
    this.survivalTimer = 0;
    this.difficultyMultiplier = 1.0;
    
    this.roomTransition.startTransition('fade');
  }

  private gameLoop = (currentTime: number = 0) => {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016);
    this.lastTime = currentTime;

    if (this.gameState === 'playing' || this.gameState === 'boss_intro') {
      this.update(deltaTime);
    }
    
    this.render();
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    this.roomTransition.update(deltaTime);
    this.level.update(deltaTime);
    
    if (this.gameState === 'boss_intro') {
      this.bossIntroTimer += deltaTime;
      if (this.bossIntroTimer >= 3.0) {
        this.gameState = 'playing';
        this.bossIntroTimer = 0;
      }
      return;
    }
    
    if (this.survivalMode) {
      this.survivalTimer += deltaTime;
      this.difficultyMultiplier = 1.0 + (this.survivalTimer / 60) * 0.8;
      
      if (this.survivalTimer >= this.survivalDuration) {
        this.gameState = 'game_over';
        this.audio.playSound('wave_complete');
      }
    }
    
    const combinedInput = this.getCombinedInput();
    this.player.update(deltaTime, combinedInput);
    
    if ((this.input.keys['Space'] || this.input.mouse.pressed || combinedInput.shooting) && this.player.canShoot()) {
      this.shoot();
    }
    
    if (combinedInput.reload && this.player.canReload()) {
      if (this.player.reload()) {
        this.audio.playSound('reload');
      }
    }
    
    const currentRoom = this.level.getCurrentRoom();
    if (currentRoom) {
      if (isBossWave(currentRoom.waveNumber) && currentRoom.enemies.length === 0 && !currentRoom.boss) {
        this.spawnBoss(currentRoom);
      }
      
      currentRoom.enemies.forEach(enemy => {
        enemy.update(deltaTime, this.player.position);
      });
      
      if (currentRoom.boss) {
        currentRoom.boss.update(deltaTime, this.player.position);
        this.handleBossShooting(currentRoom.boss, deltaTime);
      }
      
      this.handleEnemyShooting(currentRoom, deltaTime);
      
      currentRoom.pickups.forEach(pickup => {
        pickup.lifetime -= deltaTime;
      });
      
      currentRoom.pickups = currentRoom.pickups.filter(pickup => pickup.lifetime > 0);
      this.level.checkRoomCleared(currentRoom);
    }
    
    this.updateBullets(deltaTime);
    this.updateEnemyBullets(deltaTime);
    this.updateBossBullets(deltaTime);
    this.particles.update(deltaTime);
    this.updateScreenShake(deltaTime);
    this.updateStarfield(deltaTime);
    this.checkCollisions();
    
    if (this.player.health <= 0) {
      this.gameState = 'game_over';
      this.audio.playSound('game_over');
    }
  }

  private getCombinedInput() {
    const touchInput = this.touchControls.getInput();
    
    return {
      keys: this.input.keys,
      mouse: this.input.mouse,
      movement: touchInput.movement,
      shooting: touchInput.shooting,
      reload: touchInput.reload
    };
  }

  private spawnBoss(room: Room) {
    room.boss = createBoss(room.waveNumber);
    this.gameState = 'boss_intro';
    this.bossIntroTimer = 0;
    
    this.addScreenShake(12, 1.5);
    this.particles.addExplosion({ x: 400, y: 100 }, '#FF0000', 80);
    this.audio.playSound('boss_intro', 1.5);
    this.roomTransition.startTransition('zoom');
  }

  private handleBossShooting(boss: Boss, deltaTime: number) {
    const attackData = boss.getBossAttackData();
    if (attackData && boss.shoot()) {
      attackData.bullets.forEach(bullet => {
        this.bossBullets.push({
          position: bullet.position,
          velocity: bullet.velocity,
          damage: bullet.damage,
          lifetime: 6.0,
          size: bullet.size,
          color: bullet.color,
          isPlayerBullet: false,
          homing: bullet.homing,
          target: bullet.target
        });
      });
      
      this.audio.playSound('boss_shoot', 1.8);
      
      if (attackData.type === 'burst' || attackData.type === 'charge' || attackData.type === 'laser') {
        this.addScreenShake(5, 0.3);
      }
    }
  }

  private handleEnemyShooting(room: Room, deltaTime: number) {
    const currentTime = Date.now();
    const adjustedCooldown = this.enemyShotCooldown / this.difficultyMultiplier;
    
    if (currentTime - this.lastEnemyShot >= adjustedCooldown) {
      const shootingEnemies = room.enemies.filter(enemy => {
        const distToPlayer = distance(enemy.position, this.player.position);
        return distToPlayer < 500 && enemy.canShoot();
      });
      
      if (shootingEnemies.length > 0) {
        const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
        
        if (shooter.shoot()) {
          const playerVel = this.player.velocity;
          const timeToHit = distance(shooter.position, this.player.position) / 450;
          const predictedPos = {
            x: this.player.position.x + playerVel.x * timeToHit,
            y: this.player.position.y + playerVel.y * timeToHit
          };
          
          const direction = normalize({
            x: predictedPos.x - shooter.position.x,
            y: predictedPos.y - shooter.position.y
          });
          
          const spread = Math.max(0.03, 0.15 - (this.difficultyMultiplier - 1) * 0.08);
          const angle = Math.atan2(direction.y, direction.x) + random(-spread, spread);
          const velocity = {
            x: Math.cos(angle) * 450,
            y: Math.sin(angle) * 450
          };
          
          this.enemyBullets.push({
            position: { ...shooter.position },
            velocity,
            damage: shooter.attackDamage,
            lifetime: 5.0,
            size: 5,
            color: '#FF4444',
            isPlayerBullet: false
          });
          
          this.particles.addMuzzleFlash(shooter.position, angle);
          this.audio.playSound('enemy_shoot', 0.7);
          this.lastEnemyShot = currentTime;
        }
      }
    }
  }

  private shoot() {
    if (this.player.shoot()) {
      const bulletCount = this.player.getBulletCount();
      const spread = this.player.weapon.spread;
      
      for (let i = 0; i < bulletCount; i++) {
        let angle = -Math.PI / 2;
        
        if (bulletCount > 1) {
          const spreadRange = spread * (bulletCount - 1);
          angle += (i - (bulletCount - 1) / 2) * (spreadRange / (bulletCount - 1));
        }
        
        const velocity = {
          x: Math.cos(angle) * this.player.weapon.bulletSpeed,
          y: Math.sin(angle) * this.player.weapon.bulletSpeed
        };
        
        const spawnPosition = {
          x: this.player.position.x + this.player.size.x / 2,
          y: this.player.position.y
        };
        
        this.bullets.push({
          position: spawnPosition,
          velocity,
          damage: this.player.getWeaponDamage(),
          lifetime: 4.0,
          size: 6,
          color: this.player.weapon.color,
          isPlayerBullet: true
        });
      }
      
      this.particles.addMuzzleFlash(
        {
          x: this.player.position.x + this.player.size.x / 2,
          y: this.player.position.y
        },
        -Math.PI / 2
      );
      
      this.audio.playSound('shoot');
      this.addScreenShake(2, 0.1);
    }
  }

  private updateBullets(deltaTime: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position = add(bullet.position, multiply(bullet.velocity, deltaTime));
      bullet.lifetime -= deltaTime;
      
      if (bullet.lifetime <= 0 || 
          bullet.position.x < 0 || bullet.position.x > this.canvas.width ||
          bullet.position.y < 0 || bullet.position.y > this.canvas.height) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateEnemyBullets(deltaTime: number) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.position = add(bullet.position, multiply(bullet.velocity, deltaTime));
      bullet.lifetime -= deltaTime;
      
      if (bullet.lifetime <= 0 || 
          bullet.position.x < 0 || bullet.position.x > this.canvas.width ||
          bullet.position.y < 0 || bullet.position.y > this.canvas.height) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private updateBossBullets(deltaTime: number) {
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bullet = this.bossBullets[i];
      
      // Homing behavior
      if (bullet.homing && bullet.target) {
        const direction = normalize({
          x: this.player.position.x - bullet.position.x,
          y: this.player.position.y - bullet.position.y
        });
        
        const homingStrength = 200;
        bullet.velocity.x += direction.x * homingStrength * deltaTime;
        bullet.velocity.y += direction.y * homingStrength * deltaTime;
        
        // Limit speed
        const speed = Math.sqrt(bullet.velocity.x ** 2 + bullet.velocity.y ** 2);
        if (speed > 600) {
          bullet.velocity.x = (bullet.velocity.x / speed) * 600;
          bullet.velocity.y = (bullet.velocity.y / speed) * 600;
        }
      }
      
      bullet.position = add(bullet.position, multiply(bullet.velocity, deltaTime));
      bullet.lifetime -= deltaTime;
      
      if (bullet.lifetime <= 0 || 
          bullet.position.x < -100 || bullet.position.x > this.canvas.width + 100 ||
          bullet.position.y < -100 || bullet.position.y > this.canvas.height + 100) {
        this.bossBullets.splice(i, 1);
      }
    }
  }

  private updateStarfield(deltaTime: number) {
    this.backgroundStars.forEach(star => {
      star.y += star.speed * deltaTime;
      if (star.y > this.canvas.height) {
        star.y = -5;
        star.x = random(0, this.canvas.width);
      }
    });
  }

  private checkCollisions() {
    const currentRoom = this.level.getCurrentRoom();
    if (!currentRoom) return;

    // Player bullets vs enemies
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      let bulletHit = false;
      
      for (let j = currentRoom.enemies.length - 1; j >= 0; j--) {
        const enemy = currentRoom.enemies[j];
        
        if (circleCollision(
          { position: bullet.position, size: bullet.size },
          { position: enemy.position, size: Math.max(enemy.size.x, enemy.size.y) }
        )) {
          enemy.takeDamage(bullet.damage);
          this.player.stats.shotsHit++;
          bulletHit = true;
          
          this.particles.addBulletImpact(bullet.position);
          this.audio.playSound('hit', 0.8);
          this.addScreenShake(1, 0.05);
          
          if (enemy.isDead()) {
            this.handleEnemyDeath(enemy, currentRoom);
            currentRoom.enemies.splice(j, 1);
          }
          break;
        }
      }
      
      if (!bulletHit && currentRoom.boss) {
        const boss = currentRoom.boss;
        if (circleCollision(
          { position: bullet.position, size: bullet.size },
          { position: boss.position, size: Math.max(boss.size.x, boss.size.y) }
        )) {
          boss.takeDamage(bullet.damage);
          this.player.stats.shotsHit++;
          bulletHit = true;
          
          this.particles.addBulletImpact(bullet.position);
          this.audio.playSound('boss_hit', 1.2);
          this.addScreenShake(3, 0.15);
          
          // Boss phase change effects
          if (boss.health <= boss.phaseHealth[boss.phase - 1] && boss.phase < 3) {
            this.audio.playSound('boss_phase', 1.0);
            this.addScreenShake(8, 0.5);
            this.particles.addExplosion(boss.position, boss.color, 40);
          }
          
          if (boss.isDead()) {
            this.handleBossDeath(boss, currentRoom);
            currentRoom.boss = undefined;
          }
        }
      }
      
      if (bulletHit) {
        this.bullets.splice(i, 1);
      }
    }

    // Enemy bullets vs player
    const allEnemyBullets = [...this.enemyBullets, ...this.bossBullets];
    for (let i = allEnemyBullets.length - 1; i >= 0; i--) {
      const bullet = allEnemyBullets[i];
      const bulletArray = i < this.enemyBullets.length ? this.enemyBullets : this.bossBullets;
      const bulletIndex = i < this.enemyBullets.length ? i : i - this.enemyBullets.length;
      
      if (circleCollision(
        { position: bullet.position, size: bullet.size },
        { position: this.player.position, size: Math.max(this.player.size.x, this.player.size.y) }
      )) {
        this.player.takeDamage(bullet.damage);
        
        this.particles.addBulletImpact(bullet.position);
        this.audio.playSound('hit', 1.5);
        this.addScreenShake(6, 0.25);
        
        bulletArray.splice(bulletIndex, 1);
      }
    }

    // Player vs enemies collision
    currentRoom.enemies.forEach(enemy => {
      if (circleCollision(
        { position: this.player.position, size: Math.max(this.player.size.x, this.player.size.y) },
        { position: enemy.position, size: Math.max(enemy.size.x, enemy.size.y) }
      )) {
        if (enemy.attack()) {
          this.player.takeDamage(enemy.attackDamage);
          this.audio.playSound('hit', 1.2);
          this.addScreenShake(8, 0.3);
        }
      }
    });

    // Player vs boss collision
    if (currentRoom.boss) {
      const boss = currentRoom.boss;
      if (circleCollision(
        { position: this.player.position, size: Math.max(this.player.size.x, this.player.size.y) },
        { position: boss.position, size: Math.max(boss.size.x, boss.size.y) }
      )) {
        if (boss.attack()) {
          this.player.takeDamage(boss.attackDamage * 2);
          this.audio.playSound('hit', 2.0);
          this.addScreenShake(12, 0.4);
        }
      }
    }

    // Player vs pickups
    for (let i = currentRoom.pickups.length - 1; i >= 0; i--) {
      const pickup = currentRoom.pickups[i];
      
      if (circleCollision(
        { position: this.player.position, size: Math.max(this.player.size.x, this.player.size.y) },
        { position: pickup.position, size: pickup.size * 2 }
      )) {
        this.collectPickup(pickup);
        this.particles.addPickupEffect(pickup.position, pickup.color);
        this.audio.playSound('pickup');
        currentRoom.pickups.splice(i, 1);
      }
    }
  }

  private handleEnemyDeath(enemy: Enemy, room: Room) {
    this.score += enemy.scoreValue;
    this.player.addExperience(enemy.experienceValue);
    this.player.stats.kills++;
    
    this.particles.addExplosion(enemy.position, enemy.color, 25);
    this.audio.playSound('explosion', 1.0);
    this.addScreenShake(5, 0.25);
    
    if (shouldDropPickup(enemy.type)) {
      const pickupType = getRandomPickupType(this.level.getCurrentWave());
      const pickup = this.createPickup(pickupType, enemy.position);
      if (pickup) {
        room.pickups.push(pickup);
      }
    }
  }

  private handleBossDeath(boss: Boss, room: Room) {
    this.score += boss.scoreValue;
    this.player.addExperience(boss.experienceValue);
    this.player.stats.kills++;
    
    this.particles.addExplosion(boss.position, boss.color, 120);
    this.audio.playSound('boss_death', 2.5);
    this.addScreenShake(20, 1.5);
    
    // Multiple guaranteed pickups
    for (let i = 0; i < 8; i++) {
      const pickupType = getRandomPickupType(this.level.getCurrentWave());
      const pickup = this.createPickup(pickupType, {
        x: boss.position.x + random(-80, 80),
        y: boss.position.y + random(-80, 80)
      });
      if (pickup) {
        room.pickups.push(pickup);
      }
    }
    
    this.roomTransition.startTransition('fade', undefined, () => {
      this.audio.playSound('wave_complete');
    });
  }

  private createPickup(pickupType: string, position: Vector2): Pickup | null {
    switch (pickupType) {
      case 'health':
        return createHealthPickup(position);
      case 'ammo':
        return createAmmoPickup(position);
      case 'experience':
        return createExperiencePickup(position);
      case 'coin':
        return createCoinPickup(position);
      case 'shield':
        return createShieldPickup(position);
      case 'speed_boost':
        return createSpeedBoostPickup(position);
      case 'damage_boost':
        return createDamageBoostPickup(position);
      case 'rapid_fire':
        return createRapidFirePickup(position);
      case 'multi_shot':
        return createMultiShotPickup(position);
      case 'invincibility':
        return createInvincibilityPickup(position);
      case 'shield_regen':
        return createShieldRegenPickup(position);
      case 'health_regen':
        return createHealthRegenPickup(position);
      case 'double_coins':
        return createDoubleCoinsPickup(position);
      case 'explosive_rounds':
        return createExplosiveRoundsPickup(position);
      case 'piercing_rounds':
        return createPiercingRoundsPickup(position);
      case 'weapon':
        const tier = Math.min(Math.floor(this.level.getCurrentWave() / 3) + 1, 3);
        return createWeaponPickup(position, tier);
      default:
        return createCoinPickup(position);
    }
  }

  private collectPickup(pickup: Pickup) {
    switch (pickup.type) {
      case 'health':
        this.player.heal(pickup.value);
        break;
      case 'ammo':
        this.player.addAmmo(pickup.value);
        break;
      case 'experience':
        this.player.addExperience(pickup.value);
        break;
      case 'coin':
        this.player.addCoins(pickup.value);
        break;
      case 'shield':
        this.player.addShield(pickup.value);
        break;
      case 'speed_boost':
        this.player.addPowerUp('speed_boost', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'damage_boost':
        this.player.addPowerUp('damage_boost', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'rapid_fire':
        this.player.addPowerUp('rapid_fire', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'multi_shot':
        this.player.addPowerUp('multi_shot', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'invincibility':
        this.player.addPowerUp('invincibility', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'shield_regen':
        this.player.addPowerUp('shield_regen', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'health_regen':
        this.player.addPowerUp('health_regen', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'double_coins':
        this.player.addPowerUp('double_coins', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'explosive_rounds':
        this.player.addPowerUp('explosive_rounds', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'piercing_rounds':
        this.player.addPowerUp('piercing_rounds', pickup.value);
        this.audio.playSound('powerup');
        break;
      case 'weapon':
        if (pickup.weapon) {
          this.player.equipWeapon(pickup.weapon);
          this.audio.playSound('powerup');
        }
        break;
    }
  }

  private addScreenShake(intensity: number, duration: number) {
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    this.screenShake.duration = Math.max(this.screenShake.duration, duration);
  }

  private updateScreenShake(deltaTime: number) {
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime;
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      
      if (this.screenShake.duration <= 0) {
        this.screenShake.x = 0;
        this.screenShake.y = 0;
        this.screenShake.intensity = 0;
      }
    }
  }

  private render() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.renderStarfield();
    
    if (this.gameState === 'start') {
      this.renderStartScreen();
      return;
    }
    
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);
    
    const currentRoom = this.level.getCurrentRoom();
    if (currentRoom) {
      this.renderRoom(currentRoom);
    }
    
    this.renderBullets();
    this.renderEnemyBullets();
    this.renderBossBullets();
    this.renderPlayer();
    this.particles.render(this.ctx);
    
    this.ctx.restore();
    
    this.roomTransition.render(this.ctx, this.canvas.width, this.canvas.height);
    this.renderUI();
    this.touchControls.render(this.ctx);
    
    if (this.gameState === 'boss_intro') {
      this.renderBossIntro();
    }
  }

  private renderStartScreen() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GUNGEON ASSAULT', centerX, centerY - 140);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Ultimate Boss Battle Experience', centerX, centerY - 100);
    
    this.ctx.fillStyle = this.survivalMode ? '#FFD700' : '#FFFFFF';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Mode: ${this.survivalMode ? 'SURVIVAL (5 min)' : 'WAVE PROGRESSION'}`, centerX, centerY - 60);
    
    this.ctx.fillStyle = '#AAAAAA';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press T to toggle mode', centerX, centerY - 40);
    
    const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    this.ctx.globalAlpha = pulseAlpha;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillText('PRESS SPACE OR CLICK TO START', centerX, centerY);
    this.ctx.globalAlpha = 1;
    
    this.ctx.fillStyle = '#AAAAAA';
    this.ctx.font = '18px Arial';
    this.ctx.fillText('WASD - Move', centerX - 150, centerY + 60);
    this.ctx.fillText('SPACE/CLICK - Shoot', centerX, centerY + 60);
    this.ctx.fillText('R - Reload', centerX + 150, centerY + 60);
    
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('• Epic Boss battles with multiple phases', centerX, centerY + 100);
    this.ctx.fillText('• Advanced AI with homing missiles and shields', centerX, centerY + 120);
    this.ctx.fillText('• Enhanced audio with realistic sound effects', centerX, centerY + 140);
    this.ctx.fillText('• Custom ship sprites for immersive gameplay', centerX, centerY + 160);
    this.ctx.fillText('• Intense difficulty scaling for hardcore players', centerX, centerY + 180);
    
    this.ctx.restore();
  }

  private renderBossIntro() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const pulseScale = 1 + Math.sin(Date.now() * 0.015) * 0.15;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    // this.ctx.scale(pulseScale, pulseScale);
    
    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = 'bold 72px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚠ WARNING ⚠', 0, -60);
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 56px Arial';
    this.ctx.fillText('BOSS APPROACHING', 0, 10);
    
    this.ctx.fillStyle = '#FF4444';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillText('PREPARE FOR ALIEN INVASION', 0, 60);
    
    this.ctx.restore();
    
    const timeLeft = Math.ceil(3 - this.bossIntroTimer);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${timeLeft}`, centerX, centerY + 120);
    
    this.ctx.restore();
  }

  private renderStarfield() {
    this.backgroundStars.forEach(star => {
      this.ctx.save();
      this.ctx.globalAlpha = star.brightness;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  private renderRoom(room: Room) {
    room.enemies.forEach(enemy => this.renderEnemy(enemy));
    
    if (room.boss) {
      this.renderBoss(room.boss);
    }
    
    room.pickups.forEach(pickup => this.renderPickup(pickup));
  }

  private renderPlayer() {
    this.ctx.save();
    
    const centerX = this.player.position.x + this.player.size.x / 2;
    const centerY = this.player.position.y + this.player.size.y / 2;
    
    if (this.player.hasPowerUp('invincibility')) {
      this.ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
    }
    
    if (this.playerShipImage && this.playerShipImage.complete) {
      // Use the custom ship sprite
      const scale = 0.8;
      const width = this.playerShipImage.width * scale;
      const height = this.playerShipImage.height * scale;
      
      this.ctx.drawImage(
        this.playerShipImage,
        centerX - width / 2,
        centerY - height / 2,
        width,
        height
      );
    } else {
      // Fallback to original rendering
      this.ctx.translate(centerX, centerY);
      
      const width = this.player.size.x;
      const height = this.player.size.y;
      
      this.ctx.fillStyle = '#4A90E2';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -height/2);
      this.ctx.lineTo(-width/3, height/2);
      this.ctx.lineTo(0, height/3);
      this.ctx.lineTo(width/3, height/2);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(0, -height/6, width/8, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Engine trail effect
    if (this.player.velocity.x !== 0 || this.player.velocity.y !== 0) {
      this.particles.addEngineTrail(
        {
          x: centerX,
          y: centerY + this.player.size.y / 2
        },
        Math.PI / 2
      );
    }
    
    this.ctx.restore();
  }

  private renderEnemy(enemy: Enemy) {
    this.ctx.save();
    
    const centerX = enemy.position.x + enemy.size.x / 2;
    const centerY = enemy.position.y + enemy.size.y / 2;
    
    const enemyImage = this.enemyShipImages.get(enemy.type);
    
    if (enemyImage && enemyImage.complete) {
      // Use custom enemy sprite - no rotation needed, ships face straight down
      const scale = 0.6;
      const width = enemyImage.width * scale;
      const height = enemyImage.height * scale;
      
      this.ctx.drawImage(
        enemyImage,
        centerX - width / 2,
        centerY - height / 2,
        width,
        height
      );
    } else {
      // Fallback to original rendering
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(enemy.rotation);
      
      const width = enemy.size.x;
      const height = enemy.size.y;
      
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.moveTo(0, height/2);
      this.ctx.lineTo(-width/3, -height/2);
      this.ctx.lineTo(0, -height/3);
      this.ctx.lineTo(width/3, -height/2);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    this.ctx.restore();
    
    // Health bar for damaged enemies
    if (enemy.health < enemy.maxHealth) {
      const barWidth = enemy.size.x;
      const barHeight = 4;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(
        enemy.position.x,
        enemy.position.y - 8,
        barWidth,
        barHeight
      );
      
      this.ctx.fillStyle = healthPercent > 0.5 ? '#44FF44' : healthPercent > 0.25 ? '#FFFF44' : '#FF4444';
      this.ctx.fillRect(
        enemy.position.x,
        enemy.position.y - 8,
        barWidth * healthPercent,
        barHeight
      );
    }
  }

  private renderBoss(boss: Boss) {
    this.ctx.save();
    
    const centerX = boss.position.x + boss.size.x / 2;
    const centerY = boss.position.y + boss.size.y / 2;
    
    // Shield effect
    if (boss.shieldActive) {
      const shieldGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, boss.size.x * 1.3);
      shieldGradient.addColorStop(0, '#00BFFF44');
      shieldGradient.addColorStop(0.8, '#00BFFF88');
      shieldGradient.addColorStop(1, '#00BFFF00');
      
      this.ctx.fillStyle = shieldGradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, boss.size.x * 1.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Use custom UFO boss sprite
    if (this.bossImage && this.bossImage.complete) {
      const scale = 1.2; // Make boss bigger and more imposing
      const width = this.bossImage.width * scale;
      const height = this.bossImage.height * scale;
      
      // Add pulsing glow effect for boss
      const glowIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.008);
      this.ctx.globalAlpha = glowIntensity;
      
      const glowGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
      glowGradient.addColorStop(0, boss.color + '00');
      glowGradient.addColorStop(0.7, boss.color + '60');
      glowGradient.addColorStop(1, boss.color + '00');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, width * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.globalAlpha = 1;
      
      // Render the UFO sprite
      this.ctx.drawImage(
        this.bossImage,
        centerX - width / 2,
        centerY - height / 2,
        width,
        height
      );
      
      // Add menacing red glow to the UFO
      this.ctx.globalAlpha = 0.4 + 0.3 * Math.sin(Date.now() * 0.01);
      this.ctx.fillStyle = '#FF0000';
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, width * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      
    } else {
      // Fallback to original boss rendering
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(boss.rotation);
      
      const width = boss.size.x;
      const height = boss.size.y;
      
      // Boss glow effect
      const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, width);
      glowGradient.addColorStop(0, boss.color + 'AA');
      glowGradient.addColorStop(0.5, boss.color + '44');
      glowGradient.addColorStop(1, boss.color + '00');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, width, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Boss body
      this.ctx.fillStyle = boss.color;
      this.ctx.beginPath();
      this.ctx.moveTo(0, height/2);
      this.ctx.lineTo(-width/2, 0);
      this.ctx.lineTo(-width/3, -height/2);
      this.ctx.lineTo(0, -height/3);
      this.ctx.lineTo(width/3, -height/2);
      this.ctx.lineTo(width/2, 0);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Boss core
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, width/6, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
    
    // Boss health bar
    const barWidth = boss.size.x * 2.2;
    const barHeight = 15;
    const healthPercent = boss.health / boss.maxHealth;
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(
      centerX - barWidth / 2,
      boss.position.y - 30,
      barWidth,
      barHeight
    );
    
    this.ctx.fillStyle = healthPercent > 0.66 ? '#44FF44' : healthPercent > 0.33 ? '#FFFF44' : '#FF4444';
    this.ctx.fillRect(
      centerX - barWidth / 2,
      boss.position.y - 30,
      barWidth * healthPercent,
      barHeight
    );
    
    // Phase indicator
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `🛸 UFO BOSS - Phase ${boss.phase} ${boss.shieldActive ? '🛡️' : ''}`,
      centerX,
      boss.position.y - 35
    );
  }

  private renderBullets() {
    this.bullets.forEach(bullet => {
      this.ctx.save();
      
      const glowGradient = this.ctx.createRadialGradient(
        bullet.position.x, bullet.position.y, 0,
        bullet.position.x, bullet.position.y, bullet.size * 3
      );
      glowGradient.addColorStop(0, bullet.color + 'FF');
      glowGradient.addColorStop(0.5, bullet.color + '80');
      glowGradient.addColorStop(1, bullet.color + '00');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = bullet.color;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderEnemyBullets() {
    this.enemyBullets.forEach(bullet => {
      this.ctx.save();
      
      const glowGradient = this.ctx.createRadialGradient(
        bullet.position.x, bullet.position.y, 0,
        bullet.position.x, bullet.position.y, bullet.size * 2
      );
      glowGradient.addColorStop(0, '#FF4444FF');
      glowGradient.addColorStop(0.5, '#FF444880');
      glowGradient.addColorStop(1, '#FF444400');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = bullet.color;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderBossBullets() {
    this.bossBullets.forEach(bullet => {
      this.ctx.save();
      
      // Homing bullets have special effects
      if (bullet.homing) {
        const time = Date.now() * 0.01;
        this.ctx.translate(bullet.position.x, bullet.position.y);
        this.ctx.rotate(time);
        this.ctx.translate(-bullet.position.x, -bullet.position.y);
      }
      
      const glowGradient = this.ctx.createRadialGradient(
        bullet.position.x, bullet.position.y, 0,
        bullet.position.x, bullet.position.y, bullet.size * 3
      );
      glowGradient.addColorStop(0, bullet.color + 'FF');
      glowGradient.addColorStop(0.5, bullet.color + '80');
      glowGradient.addColorStop(1, bullet.color + '00');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = bullet.color;
      this.ctx.beginPath();
      this.ctx.arc(bullet.position.x, bullet.position.y, bullet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderPickup(pickup: Pickup) {
    this.ctx.save();
    this.ctx.translate(pickup.position.x, pickup.position.y);
    
    const time = Date.now() * 0.005;
    const floatOffset = Math.sin(time + pickup.position.x * 0.01) * 3;
    this.ctx.translate(0, floatOffset);
    
    this.ctx.rotate(time * 0.5);
    
    const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pickup.size * 4);
    glowGradient.addColorStop(0, pickup.color + 'AA');
    glowGradient.addColorStop(0.5, pickup.color + '44');
    glowGradient.addColorStop(1, pickup.color + '00');
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, pickup.size * 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = pickup.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, pickup.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderUI() {
    const padding = 20;
    const barHeight = 20;
    const barWidth = 200;
    
    this.renderBar(
      padding, padding,
      barWidth, barHeight,
      this.player.health, this.player.maxHealth,
      '#FF4444', '#444444',
      'Health'
    );
    
    if (this.player.maxShield > 0) {
      this.renderBar(
        padding, padding + 30,
        barWidth, barHeight,
        this.player.shield, this.player.maxShield,
        '#00BFFF', '#444444',
        'Shield'
      );
    }
    
    const expNeeded = this.player.level * 150;
    this.renderBar(
      padding, padding + (this.player.maxShield > 0 ? 60 : 30),
      barWidth, barHeight,
      this.player.experience, expNeeded,
      '#00FFFF', '#444444',
      `Level ${this.player.level}`
    );
    
    const ammoY = padding + (this.player.maxShield > 0 ? 90 : 60);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Ammo: ${this.player.weapon.ammo}/${this.player.weapon.maxAmmo}`, padding, ammoY + 20);
    
    if (this.player.isReloading) {
      const reloadProgress = this.player.getReloadProgress();
      this.renderBar(
        padding, ammoY + 30,
        barWidth, 10,
        reloadProgress, 1,
        '#FFFF00', '#444444',
        'Reloading...'
      );
    }
    
    const rightX = this.canvas.width - 250;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Score: ${this.score.toLocaleString()}`, rightX, padding + 20);
    this.ctx.fillText(`Wave: ${this.level.getCurrentWave()}`, rightX, padding + 45);
    this.ctx.fillText(`Level: ${this.player.level}`, rightX, padding + 70);
    this.ctx.fillText(`Kills: ${this.player.stats.kills}`, rightX, padding + 95);
    
    if (this.survivalMode) {
      const timeLeft = Math.max(0, this.survivalDuration - this.survivalTimer);
      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60);
      this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, rightX, padding + 120);
      this.ctx.fillText(`Difficulty: ${this.difficultyMultiplier.toFixed(1)}x`, rightX, padding + 145);
    }
    
    if (!this.touchControls.isActive()) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.font = '14px Arial';
      this.ctx.fillText('WASD: Move | Space/Click: Shoot | R: Reload | ESC: Pause', 20, this.canvas.height - 20);
    }
    
    this.renderActivePowerUps();
    this.renderWaveStatus();
    
    if (this.gameState === 'paused') {
      this.renderPauseScreen();
    } else if (this.gameState === 'game_over') {
      this.renderGameOverScreen();
    }
  }

 private renderBar(
  x: number, y: number,
  width: number, height: number,
  current: number, max: number,
  fillColor: string, bgColor: string,
  label: string
) {
  // Background
  this.ctx.fillStyle = bgColor;
  this.ctx.fillRect(x, y, width, height);

  // Clamp fill width to prevent overflow
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(current / safeMax, 1);
  const fillWidth = ratio * width;

  // Filled bar
  this.ctx.fillStyle = fillColor;
  this.ctx.fillRect(x, y, fillWidth, height);

  // Border
  this.ctx.strokeStyle = '#FFFFFF';
  this.ctx.lineWidth = 1;
  this.ctx.strokeRect(x, y, width, height);

  // Label
  this.ctx.fillStyle = '#FFFFFF';
  this.ctx.font = '12px Arial';
  this.ctx.fillText(label, x + 5, y + height / 2 + 4); // center inside bar

  // Value text
  this.ctx.fillText(`${Math.ceil(current)}/${Math.ceil(max)}`, x + width + 10, y + height - 5);
}

  private renderActivePowerUps() {
    const startY = this.canvas.height - 120;
    let yOffset = 0;
    
    this.player.powerUps.forEach(powerUp => {
      const timeLeft = this.player.getPowerUpTimeRemaining(powerUp.type);
      if (timeLeft > 0) {
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(
          `${powerUp.type.replace('_', ' ').toUpperCase()}: ${timeLeft.toFixed(1)}s`,
          20,
          startY + yOffset
        );
        yOffset += 20;
      }
    });
  }

  private renderWaveStatus() {
    const room = this.level.getCurrentRoom();
    if (!room) return;
    
    const centerX = this.canvas.width / 2;
    const centerY = 50;
    
    if (this.level.isWaveTransitioning()) {
      const timeLeft = this.level.getWaveTransitionTimeRemaining();
      
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(centerX - 150, centerY - 30, 300, 60);
      
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Wave ${room.waveNumber} Complete!`, centerX, centerY - 5);
      
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = '18px Arial';
      this.ctx.fillText(`Next wave in: ${timeLeft.toFixed(1)}s`, centerX, centerY + 20);
      
      this.ctx.restore();
    } else if (room.enemies.length > 0 || room.boss) {
      const enemyCount = room.enemies.length + (room.boss ? 1 : 0);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      
      if (room.boss) {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`🛸 UFO BOSS BATTLE - Wave ${room.waveNumber} 🛸`, centerX, centerY);
      } else {
        this.ctx.fillText(`Enemies Remaining: ${enemyCount}`, centerX, centerY);
      }
    }
    
    this.ctx.textAlign = 'left';
  }

  private renderPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.restore();
  }

  private renderGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.fillStyle = '#FF4444';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    
    if (this.survivalMode && this.survivalTimer >= this.survivalDuration) {
      this.ctx.fillStyle = '#00FF00';
      this.ctx.fillText('SURVIVAL COMPLETE!', centerX, centerY - 120);
    } else {
      this.ctx.fillText('GAME OVER', centerX, centerY - 120);
    }
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score.toLocaleString()}`, centerX, centerY - 60);
    this.ctx.fillText(`Wave Reached: ${this.level.getCurrentWave()}`, centerX, centerY - 30);
    this.ctx.fillText(`Level Reached: ${this.player.level}`, centerX, centerY);
    this.ctx.fillText(`Kills: ${this.player.stats.kills}`, centerX, centerY + 30);
    this.ctx.fillText(`Accuracy: ${this.player.stats.accuracy.toFixed(1)}%`, centerX, centerY + 60);
    
    if (this.survivalMode) {
      const minutes = Math.floor(this.survivalTimer / 60);
      const seconds = Math.floor(this.survivalTimer % 60);
      this.ctx.fillText(`Survival Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, centerX, centerY + 90);
    }
    
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Refresh to play again', centerX, centerY + 130);
    
    this.ctx.restore();
  }
}