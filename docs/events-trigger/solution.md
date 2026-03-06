### Problem

При нажатии на кнопку «Load more» во вкладке `Archived` в список добавляются неархивные (предстоящие) события. Первая страница загружается корректно, но последующие сбрасывают фильтр по архиву.

Дефект проявляется «нестабильно» и чаще после поиска, потому что без ввода поискового запроса в архиве может быть меньше 20 элементов, из-за чего кнопка `Load more` просто не появляется (состояние `hasMore` равно `false`), и баг остается незамеченным. Поиск по популярным словам (например, `design`) возвращает больше данных, включает пагинацию и делает баг воспроизводимым.

### Hypotheses

1. **Пропущен параметр в API-вызове (Основная):** В функции `loadMore` при вызове `getEvents` явно отсутствует передача параметра `archived`. Из-за этого бэкенд применяет фильтрацию по умолчанию (вероятно, `archived=false` или без фильтра), и возвращает предстоящие события.
2. **Замыкание на устаревшее состояние (Stale Closure):** Если бы параметр `archived` всё-таки присутствовал в коде, проблема могла бы быть вызвана тем, что `loadMore` обернута в `useCallback` с забытыми зависимостями и использует старое значение `mode` (например, "upcoming" с первого рендера).
3. **Гонка состояний (Race Condition):** Быстрое переключение вкладок во время ввода текста может приводить к тому, что вызовы `loadFirstPage` и `loadMore` резолвятся в непредсказуемом порядке, смешивая списки.

### Root cause

Проблема кроется в первой гипотезе. В представленном фрагменте кода функции `loadMore` полностью отсутствует параметр `archived`. В то время как `loadFirstPage` корректно пробрасывает `archived: nextMode === "archived"`, функция `loadMore` отправляет запрос только с параметрами `page`, `limit` и `q`.

### Fix

Ниже 3 рабочих варианта фикса с разным уровнем надежности.

1. **Вариант A (минимальный):** добавить недостающий параметр `archived` в `loadMore`, опираясь на текущее `mode`.

```typescript
// diff
  async function loadMore() {
    const nextPage = page + 1;
    const response = await getEvents({
      page: nextPage,
      limit: 20,
      q: query || undefined,
+     archived: mode === "archived",
    });
    setItems((current) => [...current, ...response.items]);
    setPage(nextPage);
    setHasMore(response.hasMore);
  }
```

2. **Вариант B (более устойчивый, через `useRef`):** зафиксировать фильтры первой страницы и использовать тот же снимок фильтров для `Load more`. Это защищает от рассинхронизации между первой и следующей страницами.

```typescript
type ActiveFilters = { q?: string; archived: boolean };
const activeFiltersRef = useRef<ActiveFilters>({ q: undefined, archived: false });

async function loadFirstPage(nextQuery: string, nextMode: Mode) {
  const filters = {
    q: nextQuery || undefined,
    archived: nextMode === "archived",
  };

  const response = await getEvents({
    page: 1,
    limit: 20,
    ...filters,
  });

  activeFiltersRef.current = filters;
  setItems(response.items);
  setPage(1);
  setHasMore(response.hasMore);
}

async function loadMore() {
  const nextPage = page + 1;
  const response = await getEvents({
    page: nextPage,
    limit: 20,
    ...activeFiltersRef.current,
  });
  setItems((current) => [...current, ...response.items]);
  setPage(nextPage);
  setHasMore(response.hasMore);
}
```

3. **Вариант C (production-safe):** вариант B + защита от повторных кликов (`isLoadingMore`) и защита от гонок ответов (`requestId`/`AbortController`).

4. **Вариант D (через React Query / TanStack Query):** перенести пагинацию на `useInfiniteQuery`, где ключ запроса включает `query` и `mode`, а `pageParam` управляет страницами. В этом случае параметры фильтра всегда консистентны между первой и следующими страницами, потому что формируются в одном месте (`queryFn`) на основе query key.

```typescript
const eventsQuery = useInfiniteQuery({
  queryKey: ["events", { q: query || undefined, mode }],
  initialPageParam: 1,
  queryFn: async ({ pageParam }) => {
    const filters = {
      q: query || undefined,
      archived: mode === "archived",
    };

    return getEvents({
      page: pageParam,
      limit: 20,
      ...filters,
    });
  },
  getNextPageParam: (lastPage, allPages) => {
    if (!lastPage.hasMore) return undefined;
    return allPages.length + 1;
  },
});

const items = eventsQuery.data?.pages.flatMap((p) => p.items) ?? [];
```

### Test

Актуальный Playwright regression test: [e2e/events-page-regression.spec.ts](../../e2e/events-page-regression.spec.ts).

Тест покрывает 2 сценария:

1. `/events` (before fix): второй запрос `page=2&q=design` уходит **без** `archived`.
2. `/events-fix` (after fix): второй запрос `page=2&q=design` уходит с `archived=true`.

Запуск:

```bash
npm run test:e2e
```

### Risks

В границах текущего решения есть несколько архитектурных рисков, которые выходят за рамки фикса, но о которых стоит упомянуть:

1. **Отсутствие блокировки (Loading State):** В `loadMore` (и `loadFirstPage`) нет флага `isLoading`. Если пользователь быстро кликнет по кнопке "Load more" несколько раз до завершения первого запроса, произойдет дублирование запросов и одинаковые элементы добавятся в список несколько раз.
2. **Гонка сетевых запросов (Race Condition):** Если пользователь введет текст, нажмет `Archived` и тут же изменит запрос, пока грузится первая страница, результаты старого и нового запроса могут перезаписать друг друга в непредсказуемом порядке. Решается добавлением `AbortController` или хуками вроде SWR / React Query.
3. **Отсутствие обработки ошибок:** Вызовы API не обернуты в `try/catch`. Если запрос упадет (например, 500 ошибка), UI сломается молча, а кнопка "Load more" перестанет работать без обратной связи пользователю.

### Possible improvements

1. **Поиск с debounce при вводе:** вместо ручного запуска по кнопке/событию можно делать автоматический запрос через 250-400ms после остановки ввода. Это уменьшит количество лишних запросов и ускорит сценарий пользователя.
2. **Infinite scroll через `IntersectionObserver`:** вместо кнопки `Load more` можно использовать sentinel-элемент внизу списка. Когда sentinel попадает в viewport, автоматически грузится следующая страница. Это делает пагинацию более нативной и уменьшает количество ручных действий.
