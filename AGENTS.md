# Repository Guidelines

## Project Structure & Module Organization

The application is split into two independently managed packages:

- `frontend/` contains the Next.js 15 client. Routes live in `src/app/`, UI in `src/components/`, utilities and types in `src/lib/`, and Zustand state in `src/stores/`.
- `backend/` contains the FastAPI service. API routes are under `app/api/v1/`, configuration and database setup under `app/core/`, SQLAlchemy models under `app/models/`, and provider integrations under `app/geo/`.
- Tests stay close to their domain: frontend files use `*.test.ts` or `*.test.tsx`; backend tests live in `backend/tests/`.
- `docs/plans/` records design and implementation plans.

## Build, Test, and Development Commands

Run commands from the package they target.

```powershell
cd frontend; npm ci; npm run dev       # install and start Next.js on port 3000
npm run build                           # create a production frontend build
npm run lint                            # run Next.js/TypeScript ESLint rules
npm run test:run                        # run Vitest once (CI-friendly)

cd backend; uv sync --dev
uv run uvicorn app.main:app --reload --port 8000
uv run pytest                           # run backend API tests
uv run ruff check .                     # lint imports and Python code
```

Copy `.env.example` files to local environment files before running services. Never commit credentials, AMap keys, SQLite databases, or generated `.next/` output.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF endings, final newline, two-space indentation generally, and four spaces for Python. TypeScript components use PascalCase filenames and exports (`RoutePanel.tsx`); hooks, functions, and variables use camelCase. Python modules and functions use snake_case, while models use PascalCase. Keep lines within Ruff's 100-character Python limit. Use the `@/` alias for frontend imports and run linting before review.

## Testing Guidelines

Vitest runs in `jsdom` with Testing Library setup in `frontend/src/test/setup.ts`. Place component tests beside components and test behavior through user-visible interactions. Pytest uses FastAPI's `TestClient`; add API flows under `backend/tests/test_*.py`. New behavior and bug fixes should include focused regression coverage. No numeric coverage threshold is configured, so prioritize changed paths and error states.

## Commit & Pull Request Guidelines

Recent commits follow Conventional Commit subjects such as `feat: add editable route spine` and `test: verify polished planner experience`. Use a short, imperative subject with an appropriate prefix (`feat:`, `fix:`, `test:`, `docs:`, or `chore:`). Pull requests should explain scope and user impact, link relevant issues or plans, list verification commands, and include screenshots for visual changes. Keep backend and frontend contract changes documented together.
