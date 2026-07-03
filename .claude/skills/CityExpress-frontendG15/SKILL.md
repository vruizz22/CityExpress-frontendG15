```markdown
# CityExpress-frontendG15 Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and workflows used in the CityExpress-frontendG15 React codebase. You'll learn how to structure files, write code that matches the project's style, add new features with API integration, update existing pages, and write effective tests using Vitest.

## Coding Conventions

### File Naming

- **Components & Pages:** Use PascalCase.
  - Example: `UserProfile.jsx`, `BookingPage.jsx`
- **Service Files:** Use PascalCase for service files.
  - Example: `BookingService.js`

### Import Style

- Use **relative imports** for all modules.
  - Example:
    ```javascript
    import UserProfile from '../components/UserProfile';
    import { fetchBookings } from '../../services/api/BookingService';
    ```

### Export Style

- Use **named exports** for all modules.
  - Example:
    ```javascript
    // BookingService.js
    export function fetchBookings() { ... }
    export function createBooking() { ... }
    ```

### Commit Messages

- Follow **Conventional Commits** with these prefixes:
  - `feat`: New features
  - `fix`: Bug fixes
  - `ci`: Continuous integration changes
  - `style`: Code style changes
- Keep commit messages concise (~37 characters on average).
  - Example: `feat: add booking confirmation modal`

## Workflows

### Add New Feature with API and Tests

**Trigger:** When you want to add a new feature that requires both frontend views and API integration.  
**Command:** `/new-feature`

1. **Create or update component/page files** for the new feature.
   - Example: `src/components/BookingForm.jsx`, `src/pages/BookingPage.jsx`
2. **Add or update the corresponding API service file.**
   - Example: `src/services/api/BookingService.js`
3. **Write or update test files** for components/pages and API service.
   - Example: `src/pages/BookingPage.test.jsx`, `src/services/api/BookingService.test.js`
4. **Update router or navigation** as needed.
   - Example: Add new route in `src/router/AppRouter.jsx`

**Example:**
```javascript
// src/services/api/BookingService.js
export function createBooking(data) {
  return fetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) });
}
```

```javascript
// src/pages/BookingPage.jsx
import { createBooking } from '../services/api/BookingService';
```

### Update Existing Page with Tests

**Trigger:** When you want to enhance or fix an existing page's functionality.  
**Command:** `/update-page`

1. **Edit the relevant page file(s).**
   - Example: `src/pages/BookingPage.jsx`
2. **Update or add corresponding test file(s) for the page(s).**
   - Example: `src/pages/BookingPage.test.jsx`

**Example:**
```javascript
// src/pages/BookingPage.jsx
// ...update logic or UI as needed

// src/pages/BookingPage.test.jsx
import { render } from '@testing-library/react';
import BookingPage from './BookingPage';

test('renders booking form', () => {
  render(<BookingPage />);
  // assertions...
});
```

## Testing Patterns

- **Framework:** [Vitest](https://vitest.dev/)
- **Test File Pattern:** Place tests alongside source files, named as `*.test.js`.
  - Example: `BookingPage.test.jsx`, `BookingService.test.js`
- **Typical Test Structure:**
  ```javascript
  import { render } from '@testing-library/react';
  import MyComponent from './MyComponent';

  test('renders correctly', () => {
    render(<MyComponent />);
    // assertions...
  });
  ```

## Commands

| Command       | Purpose                                               |
|---------------|-------------------------------------------------------|
| /new-feature  | Scaffold a new feature with UI, API, and tests        |
| /update-page  | Update an existing page and its tests                 |
```
