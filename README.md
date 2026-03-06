# Events Pagination Bug Demo

Небольшой фронтенд-проект для демонстрации бага пагинации на странице событий и вариантов его исправления.

## Links

- Task: [TEST_TASK_FRONTED.pdf](./docs/events-trigger/TEST_TASK_FRONTED.pdf)
- Solution: [solution.md](./docs/events-trigger/solution.md)
- Deployed: https://test-tasks-umber.vercel.app/

## Demo routes

- `/events` — версия **до фикса** (баг воспроизводится)
- `/events-fix` — версия **после фикса**

## Local run

```bash
git clone https://github.com/vova-dmitriev/test-tasks.git
cd test-tasks
npm install
npm run dev
```

## Tests

```bash
npm run test:e2e
```
