import { Pickup, Vector2, Weapon } from './types';
import { random } from './utils';

export function createHealthPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'health',
    value: 60,
    color: '#44FF44',
    size: 12,
    lifetime: 40
  };
}

export function createAmmoPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'ammo',
    value: 50,
    color: '#FFD700',
    size: 10,
    lifetime: 40
  };
}

export function createExperiencePickup(position: Vector2, value: number = 80): Pickup {
  return {
    position: { ...position },
    type: 'experience',
    value,
    color: '#00FFFF',
    size: 9,
    lifetime: 35
  };
}

export function createCoinPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'coin',
    value: random(15, 35),
    color: '#FFD700',
    size: 8,
    lifetime: 45
  };
}

export function createShieldPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'shield',
    value: 80,
    color: '#00BFFF',
    size: 14,
    lifetime: 30
  };
}

export function createSpeedBoostPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'speed_boost',
    value: 15, // Duration in seconds
    color: '#FF69B4',
    size: 11,
    lifetime: 35
  };
}

export function createDamageBoostPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'damage_boost',
    value: 20, // Duration in seconds
    color: '#FF4500',
    size: 12,
    lifetime: 35
  };
}

export function createRapidFirePickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'rapid_fire',
    value: 18, // Duration in seconds
    color: '#ADFF2F',
    size: 11,
    lifetime: 35
  };
}

export function createMultiShotPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'multi_shot',
    value: 25, // Duration in seconds
    color: '#9370DB',
    size: 13,
    lifetime: 40
  };
}

export function createInvincibilityPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'invincibility',
    value: 8, // Duration in seconds
    color: '#FFD700',
    size: 16,
    lifetime: 25
  };
}

export function createShieldRegenPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'shield_regen',
    value: 12, // Duration in seconds
    color: '#00CED1',
    size: 13,
    lifetime: 30
  };
}

export function createHealthRegenPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'health_regen',
    value: 10, // Duration in seconds
    color: '#32CD32',
    size: 12,
    lifetime: 30
  };
}

export function createDoubleCoinsPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'double_coins',
    value: 20, // Duration in seconds
    color: '#DAA520',
    size: 14,
    lifetime: 35
  };
}

export function createExplosiveRoundsPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'explosive_rounds',
    value: 15, // Duration in seconds
    color: '#FF6347',
    size: 13,
    lifetime: 30
  };
}

export function createPiercingRoundsPickup(position: Vector2): Pickup {
  return {
    position: { ...position },
    type: 'piercing_rounds',
    value: 18, // Duration in seconds
    color: '#4169E1',
    size: 12,
    lifetime: 35
  };
}

export function createWeaponPickup(position: Vector2, tier: number): Pickup {
  const weapons: Weapon[] = [
    // Tier 1 weapons
    {
      name: 'Plasma Storm Cannon',
      damage: 150,
      fireRate: 180,
      bulletSpeed: 950,
      spread: 0.0, // Always straight
      bulletCount: 1,
      ammo: 45,
      maxAmmo: 45,
      reloadTime: 1200,
      color: '#FF6B6B',
      tier: 1
    },
    {
      name: 'Twin Quantum Blaster',
      damage: 110,
      fireRate: 140,
      bulletSpeed: 900,
      spread: 0.0, // Always straight
      bulletCount: 2,
      ammo: 50,
      maxAmmo: 50,
      reloadTime: 1400,
      color: '#4ECDC4',
      tier: 1
    },
    // Tier 2 weapons
    {
      name: 'Antimatter Cannon',
      damage: 220,
      fireRate: 250,
      bulletSpeed: 1100,
      spread: 0.0, // Always straight
      bulletCount: 1,
      ammo: 35,
      maxAmmo: 35,
      reloadTime: 1000,
      color: '#9B59B6',
      tier: 2
    },
    {
      name: 'Triple Burst Laser',
      damage: 140,
      fireRate: 120,
      bulletSpeed: 950,
      spread: 0.0, // Always straight
      bulletCount: 3,
      ammo: 42,
      maxAmmo: 42,
      reloadTime: 1300,
      color: '#E74C3C',
      tier: 2
    },
    // Tier 3 weapons
    {
      name: 'Quantum Annihilator',
      damage: 350,
      fireRate: 300,
      bulletSpeed: 1300,
      spread: 0.0, // Always straight
      bulletCount: 1,
      ammo: 30,
      maxAmmo: 30,
      reloadTime: 800,
      color: '#F1C40F',
      tier: 3
    },
    {
      name: 'Pentuple Plasma Array',
      damage: 120,
      fireRate: 100,
      bulletSpeed: 900,
      spread: 0.0, // Always straight
      bulletCount: 5,
      ammo: 55,
      maxAmmo: 55,
      reloadTime: 1600,
      color: '#E67E22',
      tier: 3
    }
  ];

  const tierWeapons = weapons.filter(w => w.tier === tier);
  const weapon = tierWeapons[Math.floor(Math.random() * tierWeapons.length)];

  return {
    position: { ...position },
    type: 'weapon',
    value: 0,
    color: weapon.color,
    size: 16,
    lifetime: 60,
    weapon: { ...weapon }
  };
}

export function shouldDropPickup(enemyType: string): boolean {
  const dropRates = {
    'basic': 0.65,
    'scout': 0.60,
    'soldier': 0.70,
    'heavy': 0.85,
    'sniper': 0.75
  };
  
  return Math.random() < (dropRates[enemyType as keyof typeof dropRates] || 0.65);
}

export function getRandomPickupType(waveNumber: number): string {
  const baseChances = {
    health: 0.15,
    ammo: 0.20,
    experience: 0.12,
    coin: 0.10,
    shield: 0.08,
    speed_boost: 0.07,
    damage_boost: 0.06,
    rapid_fire: 0.05,
    multi_shot: 0.04,
    invincibility: 0.03,
    shield_regen: 0.04,
    health_regen: 0.03,
    double_coins: 0.02,
    explosive_rounds: 0.02,
    piercing_rounds: 0.02,
    weapon: Math.min(0.03 + (waveNumber * 0.015), 0.20)
  };

  // Increase power-up chances on higher waves
  if (waveNumber >= 3) {
    baseChances.shield += 0.02;
    baseChances.speed_boost += 0.02;
    baseChances.damage_boost += 0.02;
    baseChances.shield_regen += 0.02;
  }
  
  if (waveNumber >= 6) {
    baseChances.rapid_fire += 0.03;
    baseChances.multi_shot += 0.02;
    baseChances.invincibility += 0.02;
    baseChances.explosive_rounds += 0.02;
    baseChances.piercing_rounds += 0.02;
  }

  if (waveNumber >= 10) {
    baseChances.double_coins += 0.03;
    baseChances.health_regen += 0.02;
  }

  const rand = Math.random();
  let cumulative = 0;

  for (const [type, chance] of Object.entries(baseChances)) {
    cumulative += chance;
    if (rand <= cumulative) {
      return type;
    }
  }

  return 'coin';
}