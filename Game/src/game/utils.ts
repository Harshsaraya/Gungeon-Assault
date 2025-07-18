import { Vector2 } from './types';

export function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function normalize(vector: Vector2): Vector2 {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

export function multiply(vector: Vector2, scalar: number): Vector2 {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkCollision(a: Vector2 & { size: Vector2 }, b: Vector2 & { size: Vector2 }): boolean {
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.position.y + a.size.y > b.position.y
  );
}

export function circleCollision(a: Vector2 & { size: number }, b: Vector2 & { size: number }): boolean {
  const dist = distance(a.position, b.position);
  return dist < (a.size + b.size) / 2;
}