export function findById<T extends { id: number }>(
  items: readonly T[], 
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}