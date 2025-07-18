import { Vector2 } from './types';
import { Enemy, createRandomEnemy } from './Enemy';
import { Boss, createBoss } from './Boss';

export interface CampaignLevel {
  id: number;
  name: string;
  description: string;
  objectives: string[];
  enemyTypes: string[];
  enemyCount: number;
  hasBoss: boolean;
  bossType?: string;
  difficulty: number;
  background: string;
  music: string;
  rewards: {
    coins: number;
    experience: number;
    unlocks?: string[];
  };
  completed: boolean;
  storyText: string[];
}

export interface CampaignData {
  currentLevel: number;
  levels: CampaignLevel[];
  storyProgress: number;
}

export class CampaignManager {
  private campaignData: CampaignData;
  private currentLevel: CampaignLevel | null = null;

  constructor() {
    this.campaignData = this.initializeCampaign();
  }

  private initializeCampaign(): CampaignData {
    return {
      currentLevel: 1,
      storyProgress: 0,
      levels: [
        {
          id: 1,
          name: "First Contact",
          description: "Unknown ships have appeared in the outer rim. Investigate and neutralize the threat.",
          objectives: ["Destroy all enemy scouts", "Survive the encounter"],
          enemyTypes: ['scout'],
          enemyCount: 6,
          hasBoss: false,
          difficulty: 1,
          background: 'space_nebula',
          music: 'ambient_tension',
          rewards: { coins: 100, experience: 150 },
          completed: false,
          storyText: [
            "Commander, we've detected unknown vessels in Sector 7.",
            "These ships don't match any known faction designs.",
            "Proceed with caution and eliminate the threat."
          ]
        },
        {
          id: 2,
          name: "Escalation",
          description: "The enemy has sent reinforcements. Prepare for a larger engagement.",
          objectives: ["Eliminate enemy patrol", "Collect intelligence data"],
          enemyTypes: ['scout', 'basic'],
          enemyCount: 10,
          hasBoss: false,
          difficulty: 1.2,
          background: 'asteroid_field',
          music: 'combat_light',
          rewards: { coins: 150, experience: 200 },
          completed: false,
          storyText: [
            "The enemy is adapting quickly to our tactics.",
            "Intelligence suggests they're testing our defenses.",
            "Show them what the Gungeon Fleet is capable of."
          ]
        },
        {
          id: 3,
          name: "Heavy Resistance",
          description: "Enemy forces are becoming more organized. Expect heavy opposition.",
          objectives: ["Destroy enemy squadron", "Protect civilian transports"],
          enemyTypes: ['basic', 'soldier'],
          enemyCount: 14,
          hasBoss: false,
          difficulty: 1.5,
          background: 'deep_space',
          music: 'combat_medium',
          rewards: { coins: 200, experience: 250, unlocks: ['plasma_cannon'] },
          completed: false,
          storyText: [
            "Civilian transports are under attack!",
            "These aren't random raiders - they're coordinated.",
            "Protect the innocents and push back the invasion."
          ]
        },
        {
          id: 4,
          name: "The Destroyer",
          description: "Intelligence reports a massive enemy vessel approaching. This is your first real test.",
          objectives: ["Survive the boss encounter", "Defeat the Destroyer"],
          enemyTypes: ['basic', 'soldier', 'scout'],
          enemyCount: 8,
          hasBoss: true,
          bossType: 'destroyer',
          difficulty: 2,
          background: 'battle_zone',
          music: 'boss_theme_1',
          rewards: { coins: 400, experience: 500, unlocks: ['twin_blaster'] },
          completed: false,
          storyText: [
            "Commander, massive energy signature detected!",
            "It's a Destroyer-class vessel - heavily armed and shielded.",
            "This is what we've been training for. Good luck."
          ]
        },
        {
          id: 5,
          name: "Behind Enemy Lines",
          description: "Infiltrate enemy territory and gather crucial intelligence.",
          objectives: ["Avoid detection", "Eliminate key targets", "Extract safely"],
          enemyTypes: ['scout', 'sniper'],
          enemyCount: 16,
          hasBoss: false,
          difficulty: 2.2,
          background: 'enemy_station',
          music: 'stealth_tension',
          rewards: { coins: 250, experience: 300 },
          completed: false,
          storyText: [
            "We need intel on their command structure.",
            "Stealth is key - avoid unnecessary engagement.",
            "Get in, gather data, and get out alive."
          ]
        },
        {
          id: 6,
          name: "Fortress Assault",
          description: "Launch a direct assault on an enemy stronghold.",
          objectives: ["Breach the defenses", "Destroy all resistance"],
          enemyTypes: ['soldier', 'heavy'],
          enemyCount: 18,
          hasBoss: false,
          difficulty: 2.5,
          background: 'space_fortress',
          music: 'combat_heavy',
          rewards: { coins: 300, experience: 400, unlocks: ['antimatter_cannon'] },
          completed: false,
          storyText: [
            "This fortress is their main supply depot.",
            "Heavy defenses expected - bring everything you've got.",
            "Failure is not an option."
          ]
        },
        {
          id: 7,
          name: "The Battlecruiser",
          description: "A massive battlecruiser blocks your path. Only superior tactics will prevail.",
          objectives: ["Disable the battlecruiser", "Survive the onslaught"],
          enemyTypes: ['soldier', 'heavy', 'sniper'],
          enemyCount: 12,
          hasBoss: true,
          bossType: 'battlecruiser',
          difficulty: 3,
          background: 'capital_ship',
          music: 'boss_theme_2',
          rewards: { coins: 600, experience: 750, unlocks: ['burst_laser'] },
          completed: false,
          storyText: [
            "Battlecruiser detected - this one's twice the size of the Destroyer!",
            "Multiple weapon systems and advanced shielding confirmed.",
            "Show them the fury of the Gungeon Fleet!"
          ]
        },
        {
          id: 8,
          name: "Swarm Tactics",
          description: "Face overwhelming numbers in this test of endurance.",
          objectives: ["Survive the swarm", "Maintain 80% accuracy"],
          enemyTypes: ['scout', 'basic', 'soldier'],
          enemyCount: 30,
          hasBoss: false,
          difficulty: 3.2,
          background: 'debris_field',
          music: 'combat_intense',
          rewards: { coins: 400, experience: 500 },
          completed: false,
          storyText: [
            "They're throwing everything they have at us!",
            "Stay calm, conserve ammo, and pick your targets.",
            "Endurance will win this battle."
          ]
        },
        {
          id: 9,
          name: "Elite Squadron",
          description: "Face the enemy's most skilled pilots in deadly combat.",
          objectives: ["Defeat elite enemies", "Take minimal damage"],
          enemyTypes: ['heavy', 'sniper'],
          enemyCount: 10,
          hasBoss: false,
          difficulty: 3.5,
          background: 'void_space',
          music: 'elite_combat',
          rewards: { coins: 500, experience: 600, unlocks: ['quantum_rifle'] },
          completed: false,
          storyText: [
            "These aren't regular troops - they're elite pilots.",
            "Expect advanced tactics and superior firepower.",
            "Only the best of the best survive this encounter."
          ]
        },
        {
          id: 10,
          name: "The Dreadnought",
          description: "Face the enemy's ultimate weapon in an epic showdown.",
          objectives: ["Destroy the Dreadnought", "Prove your supremacy"],
          enemyTypes: ['heavy', 'sniper', 'soldier'],
          enemyCount: 15,
          hasBoss: true,
          bossType: 'dreadnought',
          difficulty: 4,
          background: 'final_battle',
          music: 'boss_theme_final',
          rewards: { coins: 1000, experience: 1500, unlocks: ['annihilator'] },
          completed: false,
          storyText: [
            "This is it - their ultimate weapon.",
            "The Dreadnought has never been defeated in combat.",
            "Today, we make history."
          ]
        },
        {
          id: 11,
          name: "Void Emergence",
          description: "Something ancient stirs in the void between stars.",
          objectives: ["Investigate the anomaly", "Survive first contact"],
          enemyTypes: ['basic', 'scout', 'soldier'],
          enemyCount: 20,
          hasBoss: false,
          difficulty: 4.2,
          background: 'void_anomaly',
          music: 'mystery_theme',
          rewards: { coins: 600, experience: 700 },
          completed: false,
          storyText: [
            "Commander, we're detecting massive energy readings from the void.",
            "This isn't like anything we've encountered before.",
            "Proceed with extreme caution."
          ]
        },
        {
          id: 12,
          name: "The Mothership",
          description: "The true enemy reveals itself in all its terrifying glory.",
          objectives: ["Survive the Mothership", "Uncover the truth"],
          enemyTypes: ['heavy', 'sniper', 'soldier'],
          enemyCount: 16,
          hasBoss: true,
          bossType: 'mothership',
          difficulty: 4.5,
          background: 'mothership_interior',
          music: 'mothership_theme',
          rewards: { coins: 800, experience: 1000, unlocks: ['void_cannon'] },
          completed: false,
          storyText: [
            "By the void... it's massive beyond comprehension.",
            "This Mothership could house entire fleets.",
            "Whatever happens, we cannot let it reach inhabited space."
          ]
        },
        {
          id: 13,
          name: "Voidlord's Domain",
          description: "Enter the realm of the Voidlord, master of dark energy.",
          objectives: ["Navigate the void maze", "Confront the Voidlord"],
          enemyTypes: ['scout', 'basic', 'soldier', 'heavy', 'sniper'],
          enemyCount: 25,
          hasBoss: true,
          bossType: 'voidlord',
          difficulty: 5,
          background: 'void_realm',
          music: 'voidlord_theme',
          rewards: { coins: 1200, experience: 1500, unlocks: ['void_slayer'] },
          completed: false,
          storyText: [
            "The void itself seems alive here.",
            "Reality bends to the Voidlord's will.",
            "Steel yourself for a battle beyond mortal comprehension."
          ]
        },
        {
          id: 14,
          name: "The Titan Awakens",
          description: "Face the ultimate challenge - a Titan-class vessel of unimaginable power.",
          objectives: ["Awaken the ancient Titan", "Prove your worth"],
          enemyTypes: ['heavy', 'sniper'],
          enemyCount: 12,
          hasBoss: true,
          bossType: 'titan',
          difficulty: 5.5,
          background: 'titan_chamber',
          music: 'titan_theme',
          rewards: { coins: 1500, experience: 2000, unlocks: ['titan_slayer'] },
          completed: false,
          storyText: [
            "The Titan has slumbered for eons.",
            "Its power could reshape the galaxy.",
            "Only a true champion can hope to stand against it."
          ]
        },
        {
          id: 15,
          name: "Ascension",
          description: "Transcend mortal limits in the final test of skill and determination.",
          objectives: ["Achieve perfection", "Become legend"],
          enemyTypes: ['scout', 'basic', 'soldier', 'heavy', 'sniper'],
          enemyCount: 50,
          hasBoss: true,
          bossType: 'titan',
          difficulty: 6,
          background: 'ascension_realm',
          music: 'ascension_theme',
          rewards: { coins: 2500, experience: 3000, unlocks: ['ascended_form'] },
          completed: false,
          storyText: [
            "This is the final trial.",
            "Beyond this point lies transcendence.",
            "Show the universe what it means to be truly elite."
          ]
        }
      ]
    };
  }

  getCurrentLevel(): CampaignLevel | null {
    return this.currentLevel;
  }

  getLevelById(id: number): CampaignLevel | null {
    return this.campaignData.levels.find(level => level.id === id) || null;
  }

  getAllLevels(): CampaignLevel[] {
    return [...this.campaignData.levels];
  }

  getAvailableLevels(): CampaignLevel[] {
    return this.campaignData.levels.filter((level, index) => {
      if (index === 0) return true;
      return this.campaignData.levels[index - 1].completed;
    });
  }

  startLevel(levelId: number): boolean {
    const level = this.getLevelById(levelId);
    if (!level) return false;

    const availableLevels = this.getAvailableLevels();
    if (!availableLevels.includes(level)) return false;

    this.currentLevel = level;
    this.campaignData.currentLevel = levelId;
    return true;
  }

  completeLevel(levelId: number, performance: any): boolean {
    const level = this.getLevelById(levelId);
    if (!level || level.completed) return false;

    level.completed = true;
    
    let coinMultiplier = 1;
    let expMultiplier = 1;

    if (performance.accuracy >= 90) {
      coinMultiplier += 0.5;
      expMultiplier += 0.3;
    }

    if (performance.timeBonus) {
      coinMultiplier += 0.3;
      expMultiplier += 0.2;
    }

    if (performance.noDamage) {
      coinMultiplier += 1.0;
      expMultiplier += 0.5;
    }

    const finalCoins = Math.floor(level.rewards.coins * coinMultiplier);
    const finalExp = Math.floor(level.rewards.experience * expMultiplier);

    return true;
  }

  getProgress(): number {
    const completedLevels = this.campaignData.levels.filter(level => level.completed).length;
    return (completedLevels / this.campaignData.levels.length) * 100;
  }

  isLevelUnlocked(levelId: number): boolean {
    if (levelId === 1) return true;
    const previousLevel = this.getLevelById(levelId - 1);
    return previousLevel ? previousLevel.completed : false;
  }

  getNextLevel(): CampaignLevel | null {
    if (!this.currentLevel) return null;
    return this.getLevelById(this.currentLevel.id + 1);
  }

  generateLevelEnemies(level: CampaignLevel): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyCount = Math.floor(level.enemyCount * level.difficulty);

    for (let i = 0; i < enemyCount; i++) {
      const enemyType = level.enemyTypes[Math.floor(Math.random() * level.enemyTypes.length)];
      const x = Math.random() * 700 + 50;
      const y = Math.random() * 200 - 100;
      
      const enemy = createRandomEnemy(x, y, level.id);
      enemy.type = enemyType;
      
      enemy.health = Math.floor(enemy.health * level.difficulty);
      enemy.maxHealth = enemy.health;
      enemy.attackDamage = Math.floor(enemy.attackDamage * level.difficulty);
      enemy.speed *= Math.min(level.difficulty, 2.0);
      
      enemies.push(enemy);
    }

    return enemies;
  }

  generateLevelBoss(level: CampaignLevel): Boss | null {
    if (!level.hasBoss || !level.bossType) return null;

    const boss = createBoss(level.id, level.bossType);
    
    boss.health = boss.maxHealth = Math.floor(boss.health * level.difficulty);
    boss.attackDamage = Math.floor(boss.attackDamage * level.difficulty);

    return boss;
  }

  getCampaignStats(): any {
    const completed = this.campaignData.levels.filter(l => l.completed).length;
    const total = this.campaignData.levels.length;
    const progress = (completed / total) * 100;

    return {
      levelsCompleted: completed,
      totalLevels: total,
      progressPercentage: progress,
      currentLevel: this.campaignData.currentLevel,
      storyProgress: this.campaignData.storyProgress
    };
  }

  resetCampaign() {
    this.campaignData.levels.forEach(level => level.completed = false);
    this.campaignData.currentLevel = 1;
    this.campaignData.storyProgress = 0;
    this.currentLevel = null;
  }
}