# End-to-End Tests

This directory contains end-to-end tests for the Bing Scraper web application using Playwright.

## Test Coverage

### Authentication (`auth.spec.ts`)
- Sign-in page display and functionality
- Sign-up page display and functionality
- Navigation between auth pages
- Form validation

### Landing Page (`landing.spec.ts`)
- Landing page elements visibility
- Navigation links functionality
- Page transitions

### Navigation (`navigation.spec.ts`)
- Page header presence
- Page titles
- 404 handling

### Accessibility (`accessibility.spec.ts`)
- Form input accessibility
- Keyboard navigation
- Heading hierarchy

## Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# Run specific test file
pnpm exec playwright test auth.spec.ts

# Run tests matching a pattern
pnpm exec playwright test --grep "sign-in"
```

## Test Reports

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

## Writing Tests

Tests follow the Playwright best practices:
- Use semantic selectors (getByRole, getByPlaceholder, getByText)
- Use explicit waits with expect()
- Group related tests with describe()
- Keep tests independent and isolated

## CI/CD

Tests are configured to run in CI environments with:
- 2 retries on failure
- Single worker for stability
- Automatic server startup
