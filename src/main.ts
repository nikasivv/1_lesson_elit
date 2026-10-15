import { 
  createTask, updateTask, changeStatus, findTask, 
  listTasks, getStats, resetStorage 
} from './tasks.js';
import { parsePriority } from './validation.js';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

console.log('--- ЗАПУСК ТЕСТОВЫХ СЦЕНАРИЕВ ---');

// 1. Пустое хранилище
resetStorage();
assert(listTasks().length === 0, 'Список должен быть пуст');
const initialStats = getStats();
assert(initialStats.todo === 0 && initialStats.doing === 0 && initialStats.done === 0, 'Статистика пуста');
console.log('✓ Кейс 1: Пустое хранилище проверено');

// 2. Создание с валидным заголовком
const t1 = createTask("  Разобрать union  ", 'normal');
assert(t1.ok === true && t1.value.title === "Разобрать union" && t1.value.status === 'todo', 'Стрип пробелов и статус todo');
console.log('✓ Кейс 2: Успешное создание с обрезкой пробелов');

// 3. Невалидные заголовки (null, 42, пробелы)
const prevLength = listTasks().length;
assert(createTask(null, 'low').ok === false, 'null не должен приниматься');
assert(createTask(42, 'low').ok === false, 'число не должно приниматься');
assert(createTask("   ", 'low').ok === false, 'только пробелы не должны приниматься');
assert(listTasks().length === prevLength, 'Размер списка не должен измениться при ошибках');
console.log('✓ Кейс 3: Отклонение некорректных типов заголовка');

// 4. Длина заголовка 80 и 81
const long80 = "a".repeat(80);
const long81 = "a".repeat(81);
assert(createTask(long80, 'low').ok === true, '80 символов разрешено');
assert(createTask(long81, 'low').ok === false, '81 символ запрещен');
console.log('✓ Кейс 4: Граничные длины (80/81) проверены');

// 5. Парсинг приоритетов
assert(parsePriority('high').ok === true, 'high валиден');
assert(parsePriority('urgent').ok === false, 'urgent невалиден');
assert(parsePriority(' HIGH ').ok === false, 'Пробелы в приоритете запрещены');
console.log('✓ Кейс 5: Валидация приоритетов пройдена');

// 6. Несуществующий id (999)
assert(findTask(999) === undefined, 'Поиск 999 должен дать undefined');
assert(updateTask(999, { title: 'New' }).ok === false, 'Обновление 999 — ошибка');
console.log('✓ Кейс 6: Обработка несуществующих ID');

// 7. Атомарность обновления
const t2 = createTask('ДЗ по TypeScript', 'high');
if (t2.ok) {
  const badUpdate = updateTask(t2.value.id, { title: '', priority: 'low' });
  assert(badUpdate.ok === false, 'Пустой заголовок в патче запрещен');
  const checkTask = findTask(t2.value.id);
  assert(checkTask?.priority === 'high', 'Приоритет не должен измениться, если упал заголовок');
}
console.log('✓ Кейс 7: Атомарность изменений при частичной ошибке');

// 8. Изменение иммутабельности (Чтение не меняет хранилище)
const readList = listTasks();
if (readList[0]) {
  readList[0].title = "Хакерская атака на хранилище";
  const checkOriginal = findTask(readList[0].id);
  assert(checkOriginal?.title !== "Хакерская атака на хранилище", 'Внутреннее хранилище должно быть защищено');
}
console.log('✓ Кейс 8: Иммутабельность возвращаемых объектов');

// 9. Комплексный сценарий (А, B, C, D)
resetStorage();
const resA = createTask('Задача А', 'low');
const resB = createTask('Задача B', 'normal');
const resC = createTask('Задача C', 'high');
const resD = createTask('Задача D', 'normal');

if (resA.ok && resB.ok && resC.ok && resD.ok) {
  changeStatus(resB.value.id, 'doing');
  changeStatus(resC.value.id, 'done');
  
  const finalStats = getStats();
  assert(finalStats.todo === 2 && finalStats.doing === 1 && finalStats.done === 1, 'Распределение статистики');
  
  const todoList = listTasks('todo');
  assert(todoList.length === 2, 'В статусе todo ровно 2 задачи');
  assert(todoList[0]?.title === 'Задача А' && todoList[1]?.title === 'Задача D', 'Фильтр по статусу корректен');
}
console.log('✓ Кейс 9: Комплексный сценарий с четырьмя задачами выполнен успешно!');

console.log('\nВСЕ ТЕСТЫ СДАНЫ УСПЕШНО!');
