import { Room, Vector2 } from './types';
import { Enemy, createRandomEnemy, getEnemyCountForWave, createFormationEnemies } from './Enemy';
import { randomInt, random } from './utils';

export class Level {
  rooms: Room[] = [];
  currentRoom: Room | null = null;
  roomSize = { width: 800, height: 600 };
  currentWave = 1;
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  nextWaveTimer: number = 0;
  isSpawningWave: boolean = false;
  waveTransitionTime: number = 0;
  showWaveComplete: boolean = false;
  
  generateLevel() {
    this.rooms = [];
    this.currentWave = 1;
    this.difficulty = 'easy';
    this.nextWaveTimer = 0;
    this.isSpawningWave = false;
    this.waveTransitionTime = 0;
    this.showWaveComplete = false;
    
    // Create the main battlefield
    const room: Room = {
      x: 0,
      y: 0,
      width: this.roomSize.width,
      height: this.roomSize.height,
      enemies: [],
      pickups: [],
      cleared: false,
      waveNumber: 1,
      enemiesRemaining: 0,
      waveCompleted: false
    };
    
    // Start first wave immediately
    this.populateRoom(room, this.currentWave);
    
    this.rooms.push(room);
    this.currentRoom = room;
    
    console.log('🎮 Level generated! Starting Wave 1');
  }
  
  private populateRoom(room: Room, waveNumber: number) {
    room.waveNumber = waveNumber;
    room.cleared = false;
    room.waveCompleted = false;
    this.isSpawningWave = true;
    this.showWaveComplete = false;
    
    // Update difficulty based on wave
    this.updateDifficulty(waveNumber);
    
    // Clear existing enemies
    room.enemies = [];
    
    // Create enemies in formation from the top
    const enemies = createFormationEnemies(waveNumber);
    room.enemies = enemies;
    room.enemiesRemaining = enemies.length;
    
    console.log(`🚀 Wave ${waveNumber} spawned! Difficulty: ${this.difficulty}, Enemies: ${enemies.length}`);
    this.isSpawningWave = false;
  }
  
  private updateDifficulty(waveNumber: number) {
    if (waveNumber <= 6) {
      this.difficulty = 'easy';
    } else if (waveNumber <= 15) {
      this.difficulty = 'medium';
    } else {
      this.difficulty = 'hard';
    }
  }
  
  getCurrentRoom(): Room | null {
    return this.currentRoom;
  }
  
  update(deltaTime: number) {
    // Handle wave transition timer
    if (this.waveTransitionTime > 0) {
      this.waveTransitionTime -= deltaTime;
      if (this.waveTransitionTime <= 0 && this.currentRoom) {
        console.log('⏰ Wave transition complete, spawning next wave...');
        this.spawnNextWave(this.currentRoom);
      }
    }
    
    // Handle next wave timer (backup system)
    if (this.nextWaveTimer > 0) {
      this.nextWaveTimer -= deltaTime;
      if (this.nextWaveTimer <= 0 && this.currentRoom) {
        console.log('⏰ Backup timer expired, spawning next wave...');
        this.spawnNextWave(this.currentRoom);
      }
    }
  }
  
  checkRoomCleared(room: Room): boolean {
    // Check if all enemies are dead and wave was active
    if (room.enemies.length === 0 && !room.cleared && room.enemiesRemaining > 0 && !this.isSpawningWave && !room.waveCompleted) {
      room.cleared = true;
      room.waveCompleted = true;
      this.showWaveComplete = true;
      
      console.log(`✅ Wave ${room.waveNumber} COMPLETED! Difficulty: ${this.difficulty}`);
      
      // Set mandatory transition time before next wave
      this.waveTransitionTime = this.difficulty === 'easy' ? 3.0 : 
                               this.difficulty === 'medium' ? 2.5 : 2.0;
      
      // Backup timer in case something goes wrong
      this.nextWaveTimer = this.waveTransitionTime + 1.0;
      
      console.log(`⏳ Next wave in ${this.waveTransitionTime} seconds... (MANDATORY WAIT)`);
      return true;
    }
    return false;
  }
  
  private spawnNextWave(room: Room) {
    if (this.isSpawningWave) {
      console.log('⚠️ Already spawning wave, skipping...');
      return;
    }
    
    // Reset timers
    this.waveTransitionTime = 0;
    this.nextWaveTimer = 0;
    this.showWaveComplete = false;
    
    this.currentWave++;
    console.log(`🌊 Starting wave ${this.currentWave} - Difficulty: ${this.difficulty}`);
    this.populateRoom(room, this.currentWave);
  }
  
  getCurrentWave(): number {
    return this.currentWave;
  }
  
  getDifficulty(): string {
    return this.difficulty;
  }
  
  isWaveTransitioning(): boolean {
    return this.waveTransitionTime > 0 || this.showWaveComplete;
  }
  
  getWaveTransitionTimeRemaining(): number {
    return Math.max(0, this.waveTransitionTime);
  }
  
  // Force spawn next wave (for testing)
  forceNextWave() {
    if (this.currentRoom && !this.isSpawningWave) {
      console.log('🔧 Force spawning next wave...');
      this.waveTransitionTime = 0;
      this.nextWaveTimer = 0;
      this.spawnNextWave(this.currentRoom);
    }
  }
  
  // Get status for debugging
  getStatus(): string {
    const room = this.currentRoom;
    if (!room) return 'No room';
    
    return `Wave: ${this.currentWave}, Enemies: ${room.enemies.length}, Transition: ${this.waveTransitionTime.toFixed(1)}s, Spawning: ${this.isSpawningWave}, Completed: ${room.waveCompleted}`;
  }
}