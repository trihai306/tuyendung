---
trigger: always_on
glob: "**/*.{php,tsx,ts,jsx,js,vue,blade.php}"
description: Core coding standards for Laravel, React, InertiaJS, TailwindCSS, Radix UI
---

# Project Coding Standards

**CRITICAL RULE: DO NOT use any emojis (emo icons) in code, comments, documentation, commit messages, or responses.**

## 1. Backend Standards (Laravel)

### Architecture & Design Patterns
- **Standard Design Patterns**: The backend MUST follow standard patterns (Service Pattern, Action Pattern, or Repository Pattern).
- **Controller Responsibilities**: Controllers must be skinny.
  - **DO**: Only handle `Request` input, call the appropriate Service/Action class, and return a `Response` or `Resource`.
  - **DON'T**: Write business logic, complex data transformations, or database queries directly inside Controllers.
- **Validation**:
  - **DO**: Always use Form Request classes (`php artisan make:request`) for request validation.
  - **DON'T**: Call `$request->validate()` inside the Controller.
- **Responses**:
  - **DO**: Use Eloquent API Resources (`php artisan make:resource`) to format and transform outgoing data for APIs, or Inertia responses for web routes.
  - **DON'T**: Return raw Eloquent models directly.

### PHP Syntax & Typing
- **DO**: Apply strict typing (`declare(strict_types=1);` at the top of PHP files).
- **DO**: Explicitly declare property types, argument types, and return types for all methods and functions.
- **Naming Conventions**:
  - Classes/Interfaces/Traits: `PascalCase`.
  - Methods/Properties/Variables: `camelCase`.
  - Database tables/columns: `snake_case`.

### Database & Eloquent
- **DO**: Avoid N+1 query problems by using eager loading (`with()`, `load()`).
- **DO**: Keep database transactions (`DB::transaction`) inside the Service layer to ensure data integrity during complex operations.

---

## 2. Frontend Standards (React, InertiaJS, TypeScript)

### React & Component Architecture
- **Component Structure**: Keep components modular, reusable, and small. 
- **Separation of Concerns**: Use custom hooks (e.g., `useFeatureLogic.ts`) to extract complex business logic out of UI components.
- **Props & State Types**:
  - **DO**: Provide explicit TypeScript `interface` or `type` definitions for all component props and state.
  - **DON'T**: Use `any`. Use `unknown` if the type is truly unknown.

### API Calls & Service Layer
- **CRITICAL LOGIC**: **NEVER call `axios` or `fetch` directly within UI components or pages.**
- **DO**: All external API calls must be encapsulated in a centralized service layer (e.g., `resources/js/services/` or `resources/js/api/`). 
  - *Example*: Create `UserService.ts` with methods like `UserService.getUsers()`.
- Components should only import and call these service functions.

### InertiaJS Navigation
- **Internal Routing**:
  - **DO**: Use Inertia's `<Link>` component for all internal transitions.
  - **DON'T**: Use standard `<a>` tags for internal routing to prevent full page reloads.
- **Programmatic Navigation**:
  - **DO**: Use the `@inertiajs/react` `router` object (e.g., `router.visit()`, `router.post()`).

### TypeScript Syntax
- **DO**: Enable and adhere to strict mode (`strict: true` in `tsconfig.json`).
- **Naming Conventions**:
  - Components/Interfaces/Types: `PascalCase` (e.g., `UserProfile`, `ButtonProps`).
  - Functions/Variables/Hooks: `camelCase` (e.g., `formatDate`, `useWindowSize`).
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_PAGINATION_LIMIT`).

---

## 3. Styling and UI (Tailwind CSS, Radix UI)

### Tailwind CSS
- **DO**: Use Tailwind CSS utility classes for ALL styling.
- **DON'T**: Write custom CSS or use inline styles (`style={{...}}`) unless you are dynamically calculating values (e.g., positioning based on mouse coordinates).
- **Class Organization**: Keep class names ordered logically and consistently.

### Radix UI
- **DO**: Use Radix UI primitives as the foundation for complex, accessible interactive components (Dialogs, Dropdowns, Tooltips, Popovers, Accordions, etc.).
- **DO**: Style Radix primitives purely using Tailwind CSS utility classes.
- **DON'T**: Build complex accessible components from scratch if a reliable Radix primitive already exists for that use case.

### Theme & Consistency
- Keep the UI consistent. Adhere strictly to the established color variables and theme configuration defined in `tailwind.config.js` / `tailwind.config.ts` and `index.css`.
- Support responsive design through Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`).
- Support Dark Mode gracefully using Tailwind's `dark:` variant across all customized components.
