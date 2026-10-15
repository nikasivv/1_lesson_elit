import type { Task, TaskStatus, Priority, TaskPatch, Result } from './models.js';
import { parseTitle } from './validation.js';
import { findById } from './utils.js';

// Внутреннее изменяемое хранилище данных
const tasks: Task[] = [];
let nextId = 1;

// Вспомогательная функция для безопасного копирования задачи
function cloneTask(task: Task): Task {
  return { ...task };
}

export function createTask(rawTitle: unknown, priority: Priority): Result<Task> {
  const titleResult = parseTitle(rawTitle);
  if (!titleResult.ok) {
    return titleResult;
  }

  const newTask: Task = {
    id: nextId,
    title: titleResult.value,
    status: 'todo',
    priority
  };

  tasks.push(newTask);
  nextId++;

  return { ok: true, value: cloneTask(newTask) };
}

export function updateTask(id: number, patch: TaskPatch): Result<Task> {
  const task = findById(tasks, id);
  if (!task) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  let updatedTitle = task.title;
  if ('title' in patch) {
    const titleResult = parseTitle(patch.title);
    if (!titleResult.ok) {
      return titleResult; // Если ошибка — вся операция отменяется
    }
    updatedTitle = titleResult.value;
  }

  if ('title' in patch) {
    task.title = updatedTitle;
  }
  if ('priority' in patch && patch.priority !== undefined) {
    task.priority = patch.priority;
  }

  return { ok: true, value: cloneTask(task) };
}

export function changeStatus(id: number, status: TaskStatus): Result<Task> {
  const task = findById(tasks, id);
  if (!task) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  task.status = status;
  return { ok: true, value: cloneTask(task) };
}

export function findTask(id: number): Task | undefined {
  const task = findById(tasks, id);
  return task ? cloneTask(task) : undefined;
}

export function listTasks(status?: TaskStatus): Task[] {
  if (status) {
    return tasks.filter((t) => t.status === status).map(cloneTask);
  }
  return tasks.map(cloneTask);
}

export function getStats(): Record<TaskStatus, number> {
  const stats: Record<TaskStatus, number> = {
    todo: 0,
    doing: 0,
    done: 0
  };

  for (const task of tasks) {
    stats[task.status]++;
  }

  return stats;
}

// Вспомогательная функция для тестов (очистка хранилища между сценариями)
export function resetStorage(): void {
  tasks.length = 0;
  nextId = 1;
}
