# Step 7: Testing Strategy & QA Plan

**Date:** 2026-02-23
**Status:** Completed
**Role:** QA Engineer
**Subject:** CineLife Testing Strategy

---

## Executive Summary

This document defines the comprehensive testing strategy for CineLife MVP, ensuring quality across all user journeys. The strategy balances thorough testing with rapid development needs.

**Testing Philosophy:** "Quality at speed" - Automated where possible, manual where necessary.

---

## Testing Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲           10% - Critical user flows
                 ╱──────╲
                ╱        ╲
               ╱Integration╲       20% - API, AI services
              ╱────────────╲
             ╱              ╲
            ╱   Unit Tests   ╲     70% - Components, utilities
           ╱──────────────────╲
```

---

## Test Categories

### 1. Unit Tests

**Scope:** Individual components, functions, utilities

**Framework:** Vitest + React Testing Library

#### Component Tests

```javascript
// Button.test.jsx
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Utility Tests

```javascript
// formatters.test.js
describe('formatMovieTitle', () => {
  it('capitalizes first letter of each word', () => {
    expect(formatMovieTitle('the great journey')).toBe('The Great Journey');
  });

  it('handles empty string', () => {
    expect(formatMovieTitle('')).toBe('');
  });

  it('removes extra whitespace', () => {
    expect(formatMovieTitle('finding   sarah')).toBe('Finding Sarah');
  });
});

describe('validateInput', () => {
  it('validates required fields', () => {
    const result = validateInput({ name: '', age: 25 });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('validates age range', () => {
    const result = validateInput({ name: 'Test', age: 150 });
    expect(result.errors.age).toBe('Age must be between 1 and 120');
  });
});
```

#### Hook Tests

```javascript
// useMovieGeneration.test.js
describe('useMovieGeneration hook', () => {
  it('starts with null movie result', () => {
    const { result } = renderHook(() => useMovieGeneration());
    expect(result.current.movie).toBeNull();
  });

  it('sets loading state during generation', async () => {
    const { result } = renderHook(() => useMovieGeneration());

    act(() => {
      result.current.generate(mockInput);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### 2. Integration Tests

**Scope:** API endpoints, AI service integration, data flow

#### API Tests

```javascript
// api/generate/text.test.js
describe('Text Generation API', () => {
  it('generates movie title successfully', async () => {
    const response = await fetch('/api/generate/text', {
      method: 'POST',
      body: JSON.stringify({ type: 'title', input: mockInput })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(data.result.length).toBeGreaterThan(0);
  });

  it('returns 400 for invalid input', async () => {
    const response = await fetch('/api/generate/text', {
      method: 'POST',
      body: JSON.stringify({ type: 'invalid', input: {} })
    });

    expect(response.status).toBe(400);
  });

  it('handles rate limiting', async () => {
    // Make 11 requests
    const requests = Array(11).fill(null).map(() =>
      fetch('/api/generate/text', {
        method: 'POST',
        body: JSON.stringify({ type: 'title', input: mockInput })
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
});
```

#### AI Service Tests

```javascript
// services/aiService.test.js
describe('AI Service', () => {
  beforeEach(() => {
    vi.mock('openai', () => ({
      default: vi.fn(() => ({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'Test Movie Title' } }]
            })
          }
        }
      }))
    }));
  });

  it('generates title with correct prompt', async () => {
    const result = await generateTitle(mockInput);
    expect(result).toBe('Test Movie Title');
  });

  it('handles API errors gracefully', async () => {
    // Mock API failure
    vi.spyOn(openai.chat.completions, 'create')
      .mockRejectedValue(new Error('API Error'));

    await expect(generateTitle(mockInput))
      .rejects.toThrow('Failed to generate title');
  });
});
```

### 3. End-to-End Tests

**Scope:** Complete user journeys

**Framework:** Playwright

#### Critical User Flows

```javascript
// e2e/create-movie.spec.js
describe('Create Movie Flow', () => {
  it('completes full movie creation journey', async ({ page }) => {
    // Start at landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Your Life. The Movie.');

    // Click create button
    await page.click('text=Create Your Movie');
    await expect(page).toHaveURL('/create');

    // Fill wizard steps
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="age"]', '30');
    await page.click('text=Continue');

    // Add life events
    await page.fill('textarea[name="events"]', 'Graduated college\nStarted career');
    await page.click('text=Continue');

    // Complete remaining steps
    // ...

    // Submit and wait for generation
    await page.click('text=Generate My Movie');
    await expect(page.locator('.loading')).toBeVisible();

    // Verify results
    await expect(page.locator('.movie-poster')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('.movie-title')).toBeVisible();
  });

  it('validates required fields', async ({ page }) => {
    await page.goto('/create');
    await page.click('text=Continue');

    await expect(page.locator('.error-message')).toContainText('Name is required');
  });

  it('allows regeneration', async ({ page }) => {
    // ... complete generation

    const originalTitle = await page.locator('.movie-title').textContent();

    await page.click('text=Regenerate Title');
    await page.waitForSelector('.movie-title', { state: 'changed' });

    const newTitle = await page.locator('.movie-title').textContent();
    expect(newTitle).not.toBe(originalTitle);
  });
});
```

#### Sharing Flow

```javascript
// e2e/share.spec.js
describe('Sharing Flow', () => {
  it('downloads poster image', async ({ page }) => {
    // ... complete generation

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download')
    ]);

    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  it('opens share dialog', async ({ page, context }) => {
    // ... complete generation

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.click('text=Copy Link');

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    expect(clipboardText).toContain('cinelife.app/result/');
  });
});
```

---

## Test Data Management

### Mock Data

```javascript
// test/fixtures/mockData.js
export const mockUserInput = {
  name: 'Sarah Johnson',
  age: 28,
  events: [
    'Graduated from university in 2018',
    'Started first job at a tech startup',
    'Moved to San Francisco in 2020',
    'Launched my own app in 2023'
  ],
  challenge: 'Overcoming imposter syndrome in a competitive industry',
  achievement: 'Successfully launched and grew my app to 10,000 users',
  goal: 'Build a company that makes a positive impact',
  people: ['Mom - my biggest supporter', 'Alex - my co-founder'],
  mood: 'inspiring'
};

export const mockMovieResult = {
  title: 'Finding Sarah',
  logline: 'A young woman\'s journey from small-town dreamer to tech entrepreneur...',
  genre: 'Drama / Coming-of-Age',
  plot: {
    act1: 'Sarah graduates from college...',
    act2: 'Facing the challenges of Silicon Valley...',
    act3: 'Sarah launches her app and finds success...'
  },
  characters: [
    { name: 'Sarah', role: 'Protagonist', description: 'Determined and creative' }
  ],
  posterUrl: 'https://example.com/poster.png'
};
```

### AI Response Mocking

```javascript
// test/mocks/aiMocks.js
export const mockOpenAIResponse = {
  title: 'Finding Sarah',
  logline: 'A young woman\'s journey from small-town dreamer to tech entrepreneur.',
  genre: 'Drama / Coming-of-Age'
};

export const mockReplicateResponse = {
  imageUrl: 'https://replicate.delivery/example.png'
};

// Setup for tests
export const setupAIMocks = () => {
  vi.mock('openai', () => ({
    default: vi.fn(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(mockOpenAIResponse) } }]
          })
        }
      }
    }))
  }));
};
```

---

## Manual Testing Checklist

### Pre-Launch Checklist

#### Landing Page
- [ ] Hero section displays correctly
- [ ] CTA button is clickable
- [ ] Example posters load
- [ ] Mobile responsive
- [ ] All links work

#### Input Wizard
- [ ] All steps are navigable
- [ ] Progress bar updates
- [ ] Required field validation works
- [ ] Can go back to previous steps
- [ ] Data persists on refresh (localStorage)
- [ ] Mobile keyboard doesn't break layout

#### Generation
- [ ] Loading animation displays
- [ ] Progress steps update
- [ ] Generation completes within 60s
- [ ] All components are generated
- [ ] Error handling works

#### Results Display
- [ ] Poster displays correctly
- [ ] All text is readable
- [ ] Expandable sections work
- [ ] Regeneration works
- [ ] Regeneration limit enforced

#### Sharing
- [ ] Download works
- [ ] Copy link works
- [ ] Social share buttons appear
- [ ] Share text is correct
- [ ] Watermark is visible

### Cross-Browser Testing

| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | Latest | ✓ | ✓ |
| Safari | Latest | ✓ | ✓ |
| Firefox | Latest | ✓ | - |
| Edge | Latest | ✓ | - |

### Device Testing

| Device | Viewport | Priority |
|--------|----------|----------|
| iPhone SE | 375x667 | High |
| iPhone 14 | 390x844 | High |
| Pixel 5 | 393x851 | Medium |
| iPad | 768x1024 | Medium |
| Desktop | 1440x900 | High |

---

## Performance Testing

### Load Time Targets

| Metric | Target | Test Method |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |

### API Response Times

| Endpoint | Target | Test Method |
|----------|--------|-------------|
| Text generation | <5s | Integration test |
| Image generation | <30s | Integration test |
| Page load | <2s | E2E test |

### Stress Testing

```javascript
// stress/api-stress.test.js
describe('API Stress Tests', () => {
  it('handles concurrent requests', async () => {
    const concurrentRequests = 50;
    const requests = Array(concurrentRequests).fill(null).map((_, i) =>
      fetch('/api/generate/text', {
        method: 'POST',
        body: JSON.stringify({
          type: 'title',
          input: { ...mockInput, name: `User ${i}` }
        })
      })
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    const successCount = responses.filter(r => r.ok).length;
    expect(successCount).toBeGreaterThan(concurrentRequests * 0.9);
    expect(duration).toBeLessThan(60000);
  });
});
```

---

## Accessibility Testing

### Automated Checks

```javascript
// e2e/accessibility.spec.js
describe('Accessibility', () => {
  it('has no accessibility violations on landing page', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  it('has no accessibility violations on wizard', async ({ page }) => {
    await page.goto('/create');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  it('supports keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Create Your Movie');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/create');
  });
});
```

### Manual Accessibility Checklist

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Form labels are associated
- [ ] Error messages are announced
- [ ] Can navigate with keyboard only
- [ ] Screen reader compatible

---

## Security Testing

### Input Validation Tests

```javascript
// security/input-validation.test.js
describe('Input Validation Security', () => {
  it('sanitizes HTML in inputs', async () => {
    const maliciousInput = {
      name: '<script>alert("xss")</script>',
      age: 25
    };

    const response = await submitInput(maliciousInput);
    expect(response.data.name).not.toContain('<script>');
  });

  it('rejects SQL injection attempts', async () => {
    const maliciousInput = {
      name: "'; DROP TABLE users; --",
      age: 25
    };

    const response = await submitInput(maliciousInput);
    expect(response.status).toBe(400);
  });

  it('enforces input length limits', async () => {
    const longInput = {
      name: 'A'.repeat(10000),
      age: 25
    };

    const response = await submitInput(longInput);
    expect(response.status).toBe(400);
  });
});
```

### API Security Tests

```javascript
// security/api-security.test.js
describe('API Security', () => {
  it('requires valid origin header', async () => {
    const response = await fetch('/api/generate/text', {
      method: 'POST',
      headers: { Origin: 'https://malicious-site.com' },
      body: JSON.stringify({ type: 'title', input: mockInput })
    });

    expect(response.status).toBe(403);
  });

  it('rate limits by IP', async () => {
    // Make excessive requests
    for (let i = 0; i < 20; i++) {
      await fetch('/api/generate/text', {
        method: 'POST',
        body: JSON.stringify({ type: 'title', input: mockInput })
      });
    }

    const response = await fetch('/api/generate/text', {
      method: 'POST',
      body: JSON.stringify({ type: 'title', input: mockInput })
    });

    expect(response.status).toBe(429);
  });
});
```

---

## Bug Tracking

### Bug Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| Critical | App unusable, data loss | Immediate |
| High | Major feature broken | 24 hours |
| Medium | Feature partially broken | 1 week |
| Low | Minor issue, workaround exists | Backlog |

### Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g. Chrome 120]
- Device: [e.g. iPhone 14]
- OS: [e.g. iOS 17]

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]
```

---

## Test Automation Pipeline

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

---

## Quality Metrics

### Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | - |
| Integration Tests | 60% | - |
| E2E Tests | 100% critical paths | - |

### Quality Gates

**Pre-merge Requirements:**
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No new accessibility violations
- [ ] Lighthouse score > 90
- [ ] Code coverage not decreased

---

## Reflection

**What went well:**
- Comprehensive test strategy
- Clear coverage targets
- Automated CI/CD pipeline

**Issues identified:**
- AI testing requires mocking strategy
- E2E tests may be slow with real AI calls
- Need visual regression testing for posters

**Process improvements:**
- Add visual regression testing
- Implement contract testing for AI APIs
- Create test data factory for consistency

---

*Document created by QA Engineer*
