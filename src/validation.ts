import type { Result, Priority } from './models.js';

export function parseTitle(value: unknown): Result<string> {
  if (typeof value !== 'string') {
    return { ok: false, error: 'Заголовок должен быть строкой' };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < 1 || trimmed.length > 80) {
    return { ok: false, error: 'Длина заголовка должна быть от 1 до 80 символов' };
  }
  
  return { ok: true, value: trimmed };
}

export function parsePriority(value: unknown): Result<Priority> {
  if (value === 'low' || value === 'normal' || value === 'high') {
    return { ok: true, value: value as Priority };
  }
  
  return { ok: false, error: 'Неверное значение приоритета' };
}
