import { Particle as ParticleInterface, Vector2 } from './types';
import { add, multiply, random } from './utils';

export class Particle implements ParticleInterface {
  position: Vector2;
  velocity: Vector2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  
  constructor(
    position: Vector2,
    velocity: Vector2,
    color: string,
    size: number,
    lifetime: number
  ) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.color = color;
    this.size = size;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.alpha = 1;
    this.rotation = random(0, Math.PI * 2);
    this.rotationSpeed = random(-5, 5);
  }
  
  update(deltaTime: number) {
    this.position = add(this.position, multiply(this.velocity, deltaTime));
    this.lifetime -= deltaTime;
    this.alpha = this.lifetime / this.maxLifetime;
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Apply gravity and air resistance
    this.velocity.y += 80 * deltaTime;
    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;
    
    // Fade and shrink over time
    this.size *= 0.992;
  }
  
  isDead(): boolean {
    return this.lifetime <= 0 || this.size <= 0.1;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    
    // Create realistic particle with glow effect
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
    glowGradient.addColorStop(0, this.color + 'FF');
    glowGradient.addColorStop(0.3, this.color + '80');
    glowGradient.addColorStop(1, this.color + '00');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Core particle
    const coreGradient = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.4, this.color);
    coreGradient.addColorStop(1, this.darkenColor(this.color, 40));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }
}

export class ParticleSystem {
  particles: Particle[] = [];
  
  addExplosion(position: Vector2, color: string = '#FF6B6B', intensity: number = 15) {
    // Main explosion particles
    for (let i = 0; i < intensity; i++) {
      const angle = (Math.PI * 2 * i) / intensity;
      const speed = random(80, 200);
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          color,
          random(3, 8),
          random(0.8, 2.0)
        )
      );
    }
    
    // Secondary debris particles
    for (let i = 0; i < intensity / 2; i++) {
      const velocity = {
        x: random(-150, 150),
        y: random(-150, 150)
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          this.lightenColor(color, 30),
          random(1, 4),
          random(1.2, 2.5)
        )
      );
    }
    
    // Sparks
    for (let i = 0; i < intensity * 2; i++) {
      const velocity = {
        x: random(-300, 300),
        y: random(-300, 300)
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#FFFF00',
          random(0.5, 2),
          random(0.3, 1.0)
        )
      );
    }
  }
  
  addBulletImpact(position: Vector2) {
    // Impact sparks
    for (let i = 0; i < 8; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(50, 150);
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#FFD700',
          random(1, 3),
          random(0.3, 0.8)
        )
      );
    }
    
    // Smoke puffs
    for (let i = 0; i < 4; i++) {
      const velocity = {
        x: random(-50, 50),
        y: random(-80, -20)
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#888888',
          random(2, 5),
          random(0.5, 1.2)
        )
      );
    }
  }
  
  addMuzzleFlash(position: Vector2, direction: number) {
    // Bright muzzle flash
    for (let i = 0; i < 6; i++) {
      const spread = 0.8;
      const angle = direction + random(-spread, spread);
      const speed = random(150, 300);
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#FFFF00',
          random(3, 6),
          random(0.1, 0.4)
        )
      );
    }
    
    // Hot gases
    for (let i = 0; i < 4; i++) {
      const spread = 1.2;
      const angle = direction + random(-spread, spread);
      const speed = random(80, 150);
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#FF6600',
          random(2, 4),
          random(0.2, 0.6)
        )
      );
    }
  }
  
  addPickupEffect(position: Vector2, color: string) {
    // Magical pickup effect
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = random(40, 100);
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 50 // Upward bias
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          color,
          random(2, 5),
          random(0.5, 1.2)
        )
      );
    }
    
    // Glitter effect
    for (let i = 0; i < 8; i++) {
      const velocity = {
        x: random(-80, 80),
        y: random(-120, -40)
      };
      
      this.particles.push(
        new Particle(
          { ...position },
          velocity,
          '#FFFFFF',
          random(1, 3),
          random(0.3, 0.8)
        )
      );
    }
  }
  
  addEngineTrail(position: Vector2, direction: number) {
    // Engine exhaust
    const velocity = {
      x: Math.cos(direction + Math.PI) * random(50, 100) + random(-20, 20),
      y: Math.sin(direction + Math.PI) * random(50, 100) + random(-20, 20)
    };
    
    this.particles.push(
      new Particle(
        { ...position },
        velocity,
        '#FF6600',
        random(2, 4),
        random(0.2, 0.5)
      )
    );
  }
  
  update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // Sort particles by size for proper depth rendering
    this.particles.sort((a, b) => b.size - a.size);
    this.particles.forEach(particle => particle.render(ctx));
  }
  
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}