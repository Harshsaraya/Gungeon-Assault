import { Vector2 } from './types';

export interface TouchInput {
  movement: Vector2;
  shooting: boolean;
  reload: boolean;
}

export class TouchControls {
  private canvas: HTMLCanvasElement;
  private touchInput: TouchInput;
  private movementStick: TouchStick;
  private shootButton: TouchButton;
  private reloadButton: TouchButton;
  private isEnabled: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.touchInput = {
      movement: { x: 0, y: 0 },
      shooting: false,
      reload: false
    };
    
    this.movementStick = new TouchStick(80, canvas.height - 120, 60);
    this.shootButton = new TouchButton(canvas.width - 80, canvas.height - 120, 50, '#FF4444');
    this.reloadButton = new TouchButton(canvas.width - 80, canvas.height - 200, 40, '#FFD700');
    
    this.setupTouchEvents();
    this.detectMobile();
  }
  
  private detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
    
    this.isEnabled = isMobile;
  }
  
  private setupTouchEvents() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Check movement stick
      if (this.movementStick.isInside(x, y)) {
        this.movementStick.startTouch(touch.identifier, x, y);
      }
      
      // Check shoot button
      if (this.shootButton.isInside(x, y)) {
        this.shootButton.startTouch(touch.identifier);
        this.touchInput.shooting = true;
      }
      
      // Check reload button
      if (this.reloadButton.isInside(x, y)) {
        this.reloadButton.startTouch(touch.identifier);
        this.touchInput.reload = true;
      }
    }
  }
  
  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Update movement stick
      if (this.movementStick.touchId === touch.identifier) {
        this.movementStick.updateTouch(x, y);
        this.touchInput.movement = this.movementStick.getDirection();
      }
    }
  }
  
  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      
      // End movement stick
      if (this.movementStick.touchId === touch.identifier) {
        this.movementStick.endTouch();
        this.touchInput.movement = { x: 0, y: 0 };
      }
      
      // End shoot button
      if (this.shootButton.touchId === touch.identifier) {
        this.shootButton.endTouch();
        this.touchInput.shooting = false;
      }
      
      // End reload button
      if (this.reloadButton.touchId === touch.identifier) {
        this.reloadButton.endTouch();
        this.touchInput.reload = false;
      }
    }
  }
  
  getInput(): TouchInput {
    return { ...this.touchInput };
  }
  
  isActive(): boolean {
    return this.isEnabled;
  }
  
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    if (!this.isEnabled) return;
    
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    // Render movement stick
    this.movementStick.render(ctx);
    
    // Render buttons
    this.shootButton.render(ctx, 'FIRE');
    this.reloadButton.render(ctx, 'R');
    
    ctx.restore();
  }
  
  updateLayout(canvasWidth: number, canvasHeight: number) {
    this.movementStick.x = 80;
    this.movementStick.y = canvasHeight - 120;
    
    this.shootButton.x = canvasWidth - 80;
    this.shootButton.y = canvasHeight - 120;
    
    this.reloadButton.x = canvasWidth - 80;
    this.reloadButton.y = canvasHeight - 200;
  }
}

class TouchStick {
  x: number;
  y: number;
  radius: number;
  touchId: number | null = null;
  knobX: number;
  knobY: number;
  knobRadius: number;
  
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.knobX = x;
    this.knobY = y;
    this.knobRadius = radius * 0.4;
  }
  
  isInside(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
  
  startTouch(touchId: number, x: number, y: number) {
    this.touchId = touchId;
    this.updateTouch(x, y);
  }
  
  updateTouch(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= this.radius) {
      this.knobX = x;
      this.knobY = y;
    } else {
      const angle = Math.atan2(dy, dx);
      this.knobX = this.x + Math.cos(angle) * this.radius;
      this.knobY = this.y + Math.sin(angle) * this.radius;
    }
  }
  
  endTouch() {
    this.touchId = null;
    this.knobX = this.x;
    this.knobY = this.y;
  }
  
  getDirection(): Vector2 {
    const dx = this.knobX - this.x;
    const dy = this.knobY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) return { x: 0, y: 0 };
    
    return {
      x: dx / this.radius,
      y: dy / this.radius
    };
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // Outer circle
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner knob
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.knobX, this.knobY, this.knobRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class TouchButton {
  x: number;
  y: number;
  radius: number;
  color: string;
  touchId: number | null = null;
  pressed: boolean = false;
  
  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  
  isInside(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
  
  startTouch(touchId: number) {
    this.touchId = touchId;
    this.pressed = true;
  }
  
  endTouch() {
    this.touchId = null;
    this.pressed = false;
  }
  
  render(ctx: CanvasRenderingContext2D, label: string) {
    // Button background
    ctx.fillStyle = this.pressed ? this.color : this.color + '80';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Button border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Button label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.x, this.y);
  }
}