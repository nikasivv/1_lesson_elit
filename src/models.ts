export type TaskStatus = 'todo' | 'doing' | 'done';
export type Priority = 'low' | 'normal' | 'high';
export interface Task {
 readonly id: number;
 title: string;
 status: TaskStatus;
priority: Priority;
}
export type TaskPatch = Partial<Pick<Task, 'title' | 'priority'>>;
export type Result<T> =
 | { ok: true; value: T }
 | { ok: false; error: string };