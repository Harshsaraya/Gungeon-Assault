import { Vector2 } from './types';

export interface BackgroundLayer {
  stars: Star[];
  speed: number;
  color: string;
  size: number;
}

export interface Star {
  position: Vector2;
  brightness: number;
  twinkle: number;
  size: number;
  parallaxSpeed: number;
}

export interface NebulaCloud {
  position: Vector2;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Planet {
  position: Vector2;
  size: number;
  color: string;
  rings: boolean;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  moons: Moon[];
}

export interface Moon {
  distance: number;
  angle: number;
  size: number;
  color: string;
  speed: number;
}

export class BackgroundRenderer {
  private layers: BackgroundLayer[] = [];
  private nebulaClouds: NebulaCloud[] = [];
  private planets: Planet[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private theme: string = 'space';
  private lightingEffects: LightingEffect[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initializeBackground();
  }

  private initializeBackground() {
    this.layers = [
      this.createStarLayer(200, 15, '#FFFFFF', 0.5, 0.8),
      this.createStarLayer(150, 25, '#CCCCFF', 0.8, 1.2),
      this.createStarLayer(100, 35, '#FFFFCC', 1.2, 1.8),
      this.createStarLayer(80, 45, '#FFCCCC', 1.8, 2.5),
      this.createStarLayer(50, 60, '#FFDDDD', 2.5, 3.2)
    ];

    this.createNebulaClouds();
    this.createPlanets();
    this.createLightingEffects();
  }

  private createStarLayer(count: number, speed: number, color: string, size: number, parallaxSpeed: number): BackgroundLayer {
    const stars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      stars.push({
        position: {
          x: Math.random() * this.canvas.width * 2,
          y: Math.random() * this.canvas.height * 2
        },
        brightness: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        size: Math.random() * size + 0.5,
        parallaxSpeed: parallaxSpeed
      });
    }

    return { stars, speed, color, size };
  }

  private createNebulaClouds() {
    for (let i = 0; i < 12; i++) {
      this.nebulaClouds.push({
        position: {
          x: Math.random() * this.canvas.width * 3,
          y: Math.random() * this.canvas.height * 3
        },
        size: Math.random() * 300 + 150,
        color: this.getRandomNebulaColor(),
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 8 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5
      });
    }
  }

  private createPlanets() {
    for (let i = 0; i < 4; i++) {
      const planet: Planet = {
        position: {
          x: Math.random() * this.canvas.width * 2,
          y: Math.random() * this.canvas.height * 2
        },
        size: Math.random() * 120 + 60,
        color: this.getRandomPlanetColor(),
        rings: Math.random() > 0.6,
        speed: Math.random() * 3 + 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        moons: []
      };

      // Add moons
      const moonCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < moonCount; j++) {
        planet.moons.push({
          distance: planet.size + 30 + j * 25,
          angle: Math.random() * Math.PI * 2,
          size: Math.random() * 8 + 4,
          color: this.lightenColor(planet.color, 20),
          speed: 0.5 + j * 0.3
        });
      }

      this.planets.push(planet);
    }
  }

  private createLightingEffects() {
    // Create dynamic lighting effects
    for (let i = 0; i < 5; i++) {
      this.lightingEffects.push({
        position: {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height
        },
        intensity: Math.random() * 0.3 + 0.1,
        color: this.getRandomLightColor(),
        radius: Math.random() * 200 + 100,
        pulseSpeed: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private getRandomNebulaColor(): string {
    const colors = [
      '#FF6B9D', '#C44569', '#F8B500', '#6C5CE7',
      '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894',
      '#00CEC9', '#6C5CE7', '#A29BFE', '#FD79A8'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomPlanetColor(): string {
    const colors = [
      '#3498DB', '#E74C3C', '#F39C12', '#27AE60',
      '#9B59B6', '#E67E22', '#1ABC9C', '#34495E',
      '#2ECC71', '#E67E22', '#9B59B6', '#F1C40F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomLightColor(): string {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(deltaTime: number) {
    this.time += deltaTime;

    // Update star layers with parallax
    this.layers.forEach(layer => {
      layer.stars.forEach(star => {
        star.position.y += layer.speed * star.parallaxSpeed * deltaTime;
        star.twinkle += deltaTime * 4;
        
        if (star.position.y > this.canvas.height + 20) {
          star.position.y = -20;
          star.position.x = Math.random() * this.canvas.width * 2;
        }
      });
    });

    // Update nebula clouds
    this.nebulaClouds.forEach(cloud => {
      cloud.position.y += cloud.speed * deltaTime;
      cloud.position.x += Math.sin(this.time * 0.3) * 15 * deltaTime;
      cloud.rotation += cloud.rotationSpeed * deltaTime;
      
      if (cloud.position.y > this.canvas.height + cloud.size) {
        cloud.position.y = -cloud.size;
        cloud.position.x = Math.random() * this.canvas.width * 3;
      }
    });

    // Update planets
    this.planets.forEach(planet => {
      planet.position.y += planet.speed * deltaTime;
      planet.rotation += planet.rotationSpeed * deltaTime;
      
      // Update moons
      planet.moons.forEach(moon => {
        moon.angle += moon.speed * deltaTime;
      });
      
      if (planet.position.y > this.canvas.height + planet.size) {
        planet.position.y = -planet.size;
        planet.position.x = Math.random() * this.canvas.width * 2;
      }
    });

    // Update lighting effects
    this.lightingEffects.forEach(light => {
      light.phase += light.pulseSpeed * deltaTime;
    });
  }

  render() {
    // Clear with deep space gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    
    switch (this.theme) {
      case 'nebula':
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(0.5, '#330066');
        gradient.addColorStop(1, '#660099');
        break;
      case 'void':
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        break;
      case 'battle':
        gradient.addColorStop(0, '#330000');
        gradient.addColorStop(0.5, '#660000');
        gradient.addColorStop(1, '#990000');
        break;
      default: // space
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render lighting effects (background)
    this.renderLightingEffects();
    
    // Render nebula clouds
    this.renderNebulaClouds();
    
    // Render planets
    this.renderPlanets();
    
    // Render star layers (back to front for proper depth)
    this.layers.forEach(layer => this.renderStarLayer(layer));
  }

  private renderStarLayer(layer: BackgroundLayer) {
    this.ctx.save();
    
    layer.stars.forEach(star => {
      const twinkleIntensity = Math.sin(star.twinkle) * 0.4 + 0.6;
      const alpha = star.brightness * twinkleIntensity;
      
      this.ctx.globalAlpha = alpha;
      
      // Create star with glow effect
      const glowGradient = this.ctx.createRadialGradient(
        star.position.x, star.position.y, 0,
        star.position.x, star.position.y, star.size * 4
      );
      glowGradient.addColorStop(0, layer.color);
      glowGradient.addColorStop(0.3, layer.color + '80');
      glowGradient.addColorStop(1, layer.color + '00');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(star.position.x, star.position.y, star.size * 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Render star core
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(star.position.x, star.position.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add star spikes for larger stars
      if (star.size > 1.5) {
        this.renderStarSpikes(star.position.x, star.position.y, star.size * 3, alpha);
      }
    });
    
    this.ctx.restore();
  }

  private renderStarSpikes(x: number, y: number, size: number, alpha: number) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.8;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    
    // Vertical spike
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.lineTo(x, y + size);
    this.ctx.stroke();
    
    // Horizontal spike
    this.ctx.beginPath();
    this.ctx.moveTo(x - size, y);
    this.ctx.lineTo(x + size, y);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private renderNebulaClouds() {
    this.ctx.save();
    
    this.nebulaClouds.forEach(cloud => {
      this.ctx.save();
      this.ctx.translate(cloud.position.x, cloud.position.y);
      this.ctx.rotate(cloud.rotation);
      this.ctx.globalAlpha = cloud.opacity;
      
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.size);
      gradient.addColorStop(0, cloud.color + '60');
      gradient.addColorStop(0.3, cloud.color + '40');
      gradient.addColorStop(0.7, cloud.color + '20');
      gradient.addColorStop(1, cloud.color + '00');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, cloud.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add some texture
      this.ctx.globalAlpha = cloud.opacity * 0.5;
      this.ctx.fillStyle = this.lightenColor(cloud.color, 20) + '40';
      this.ctx.beginPath();
      this.ctx.arc(-cloud.size * 0.3, -cloud.size * 0.2, cloud.size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
    
    this.ctx.restore();
  }

  private renderPlanets() {
    this.ctx.save();
    
    this.planets.forEach(planet => {
      this.ctx.save();
      this.ctx.translate(planet.position.x, planet.position.y);
      this.ctx.rotate(planet.rotation);
      
      // Planet shadow gradient
      const shadowGradient = this.ctx.createRadialGradient(
        -planet.size * 0.3, -planet.size * 0.3, 0,
        0, 0, planet.size
      );
      shadowGradient.addColorStop(0, planet.color);
      shadowGradient.addColorStop(0.6, this.darkenColor(planet.color, 30));
      shadowGradient.addColorStop(1, this.darkenColor(planet.color, 60));
      
      this.ctx.fillStyle = shadowGradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Planet atmosphere
      this.ctx.globalAlpha = 0.3;
      const atmosphereGradient = this.ctx.createRadialGradient(0, 0, planet.size * 0.8, 0, 0, planet.size * 1.2);
      atmosphereGradient.addColorStop(0, planet.color + '00');
      atmosphereGradient.addColorStop(1, this.lightenColor(planet.color, 40) + '80');
      
      this.ctx.fillStyle = atmosphereGradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, planet.size * 1.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      
      // Planet rings
      if (planet.rings) {
        this.ctx.strokeStyle = planet.color + '60';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, planet.size * 1.6, planet.size * 0.4, Math.PI * 0.2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, planet.size * 1.9, planet.size * 0.5, Math.PI * 0.2, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      this.ctx.restore();
      
      // Render moons
      planet.moons.forEach(moon => {
        const moonX = planet.position.x + Math.cos(moon.angle) * moon.distance;
        const moonY = planet.position.y + Math.sin(moon.angle) * moon.distance;
        
        this.ctx.fillStyle = moon.color;
        this.ctx.beginPath();
        this.ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
    
    this.ctx.restore();
  }

  private renderLightingEffects() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    
    this.lightingEffects.forEach(light => {
      const intensity = light.intensity * (0.5 + 0.5 * Math.sin(light.phase));
      this.ctx.globalAlpha = intensity;
      
      const gradient = this.ctx.createRadialGradient(
        light.position.x, light.position.y, 0,
        light.position.x, light.position.y, light.radius
      );
      gradient.addColorStop(0, light.color + '40');
      gradient.addColorStop(0.5, light.color + '20');
      gradient.addColorStop(1, light.color + '00');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(light.position.x, light.position.y, light.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.restore();
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

  setTheme(theme: 'space' | 'nebula' | 'void' | 'battle') {
    this.theme = theme;
    
    // Adjust lighting effects based on theme
    this.lightingEffects.forEach(light => {
      switch (theme) {
        case 'nebula':
          light.color = this.getRandomNebulaColor();
          light.intensity *= 1.5;
          break;
        case 'void':
          light.color = '#4B0082';
          light.intensity *= 0.5;
          break;
        case 'battle':
          light.color = '#FF0000';
          light.intensity *= 2;
          break;
        default:
          light.color = this.getRandomLightColor();
      }
    });
  }
}

interface LightingEffect {
  position: Vector2;
  intensity: number;
  color: string;
  radius: number;
  pulseSpeed: number;
  phase: number;
}