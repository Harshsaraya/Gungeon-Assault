import { Vector2 } from './types';

export class RoomTransition {
  private isTransitioning: boolean = false;
  private transitionType: 'fade' | 'slide' | 'zoom' = 'fade';
  private transitionProgress: number = 0;
  private transitionDuration: number = 1000; // ms
  private transitionStartTime: number = 0;
  private onComplete: (() => void) | null = null;
  private direction: Vector2 = { x: 0, y: 0 };
  
  startTransition(type: 'fade' | 'slide' | 'zoom', direction?: Vector2, onComplete?: () => void) {
    this.isTransitioning = true;
    this.transitionType = type;
    this.transitionProgress = 0;
    this.transitionStartTime = Date.now();
    this.onComplete = onComplete || null;
    this.direction = direction || { x: 0, y: 0 };
  }
  
  update(deltaTime: number): boolean {
    if (!this.isTransitioning) return false;
    
    const elapsed = Date.now() - this.transitionStartTime;
    this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);
    
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      if (this.onComplete) {
        this.onComplete();
      }
      return true; // Transition complete
    }
    
    return false;
  }
  
  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isTransitioning) return;
    
    ctx.save();
    
    switch (this.transitionType) {
      case 'fade':
        this.renderFadeTransition(ctx, canvasWidth, canvasHeight);
        break;
      case 'slide':
        this.renderSlideTransition(ctx, canvasWidth, canvasHeight);
        break;
      case 'zoom':
        this.renderZoomTransition(ctx, canvasWidth, canvasHeight);
        break;
    }
    
    ctx.restore();
  }
  
  private renderFadeTransition(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Smooth fade using easing function
    const easeProgress = this.easeInOutCubic(this.transitionProgress);
    const alpha = this.transitionProgress < 0.5 ? easeProgress * 2 : (1 - easeProgress) * 2;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }
  
  private renderSlideTransition(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const easeProgress = this.easeInOutCubic(this.transitionProgress);
    
    // Create sliding curtain effect
    if (this.transitionProgress < 0.5) {
      // Slide in
      const slideDistance = easeProgress * 2 * width;
      ctx.fillStyle = '#000000';
      
      if (this.direction.x > 0) {
        ctx.fillRect(0, 0, slideDistance, height);
      } else if (this.direction.x < 0) {
        ctx.fillRect(width - slideDistance, 0, slideDistance, height);
      } else if (this.direction.y > 0) {
        ctx.fillRect(0, 0, width, slideDistance);
      } else {
        ctx.fillRect(0, height - slideDistance, width, slideDistance);
      }
    } else {
      // Slide out
      const slideDistance = (1 - easeProgress) * 2 * width;
      ctx.fillStyle = '#000000';
      
      if (this.direction.x > 0) {
        ctx.fillRect(width - slideDistance, 0, slideDistance, height);
      } else if (this.direction.x < 0) {
        ctx.fillRect(0, 0, slideDistance, height);
      } else if (this.direction.y > 0) {
        ctx.fillRect(0, height - slideDistance, width, slideDistance);
      } else {
        ctx.fillRect(0, 0, width, slideDistance);
      }
    }
  }
  
  private renderZoomTransition(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const easeProgress = this.easeInOutCubic(this.transitionProgress);
    
    // Create zoom effect with circular mask
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    let radius;
    if (this.transitionProgress < 0.5) {
      // Zoom in (shrinking circle)
      radius = maxRadius * (1 - easeProgress * 2);
    } else {
      // Zoom out (expanding circle)
      radius = maxRadius * ((easeProgress - 0.5) * 2);
    }
    
    // Create circular clipping mask
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Fill the rest with black
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  isActive(): boolean {
    return this.isTransitioning;
  }
  
  getProgress(): number {
    return this.transitionProgress;
  }
  
  setDuration(duration: number) {
    this.transitionDuration = duration;
  }
}