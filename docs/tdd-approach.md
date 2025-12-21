# Test-Driven Development (TDD) Approach

## 1. Introduction

This document outlines the Test-Driven Development (TDD) methodology for the Circuit Forge project. TDD is a software development approach where tests are written before the implementation code, ensuring that all features are thoroughly tested and the codebase remains maintainable and reliable.

## 2. TDD Principles

### 2.1. The Red-Green-Refactor Cycle

TDD follows a strict cycle of three phases:

1. **Red**: Write a failing test that describes the desired behavior
2. **Green**: Write the minimum code necessary to make the test pass
3. **Refactor**: Improve the code while keeping all tests passing

This cycle ensures that:
- Every feature has tests before implementation
- Code is written only to satisfy tests
- Refactoring is safe because tests verify behavior

### 2.2. Core Principles

- **Test First**: Always write tests before implementation code
- **One Test at a Time**: Focus on one failing test, make it pass, then move to the next
- **Keep Tests Simple**: Tests should be easy to read and understand
- **Test Behavior, Not Implementation**: Tests should verify what the code does, not how it does it
- **Maintain Test Quality**: Tests are first-class code and should be well-maintained

## 3. Testing Strategy for Circuit Forge

### 3.1. Testing Pyramid

Our testing strategy follows the testing pyramid:

```
        /\
       /  \      E2E Tests (Few)
      /____\
     /      \    Integration Tests (Some)
    /________\
   /          \  Unit Tests (Many)
  /____________\
```

- **Unit Tests (70%)**: Test individual functions, services, and utilities in isolation
- **Integration Tests (20%)**: Test interactions between components and services
- **E2E Tests (10%)**: Test complete user workflows

### 3.2. What to Test

#### Unit Tests Should Cover:
- **Services** (`DataService`, `SettingsService`, `ProfileService`, `WorkoutHistoryService`)
  - CRUD operations
  - Data validation
  - Error handling
  - Edge cases

- **Business Logic** (`WorkoutGenerator`, `WorkoutEngine`)
  - Algorithm correctness
  - Input validation
  - State transitions
  - Boundary conditions

- **Utilities** (`TTSService`)
  - Function behavior
  - Error handling
  - Browser API interactions

#### Integration Tests Should Cover:
- Service interactions (e.g., `WorkoutGenerator` using `WorkoutHistoryService`)
- Component-service integration
- Data flow between layers
- localStorage operations

#### E2E Tests Should Cover:
- Complete workout flow (setup → execution → completion)
- Settings persistence
- Exercise database management
- PWA functionality (offline mode, installation)

### 3.3. What NOT to Test

- Third-party library internals
- React framework behavior (unless testing custom hooks)
- Browser APIs directly (use mocks)
- Implementation details (test behavior, not implementation)

## 4. Testing Tools and Setup

### 4.1. Recommended Testing Stack

- **Test Runner**: Vitest (fast, Vite-native, compatible with Jest API)
- **Testing Library**: React Testing Library (for component tests)
- **Assertion Library**: Vitest built-in assertions (Jest-compatible)
- **Mocking**: Vitest mocks + MSW (Mock Service Worker) for API mocking
- **Coverage**: Vitest coverage (using c8 or v8)

### 4.2. Test File Organization

```
src/
├── services/
│   ├── DataService.ts
│   └── DataService.test.ts
├── components/
│   ├── WorkoutScreen.tsx
│   └── WorkoutScreen.test.tsx
└── utils/
    ├── helpers.ts
    └── helpers.test.ts
```

### 4.3. Test Naming Convention

Use descriptive test names that explain what is being tested:

```typescript
describe('WorkoutGenerator', () => {
  it('should generate workout with correct number of exercises', () => {});
  it('should rotate muscle groups based on workout history', () => {});
  it('should throw error when exercise database is empty', () => {});
});
```

## 5. TDD Workflow

### 5.1. Starting a New Feature

1. **Understand Requirements**: Review architecture document and feature requirements
2. **Write Failing Test**: Write a test that describes the desired behavior
3. **Run Test**: Verify the test fails (Red phase)
4. **Implement Minimum Code**: Write just enough code to pass the test
5. **Run Test**: Verify the test passes (Green phase)
6. **Refactor**: Improve code quality while keeping tests green
7. **Repeat**: Continue with next test case

### 5.2. Example TDD Workflow

**Feature**: Add exercise to database

```typescript
// Step 1: Write failing test
describe('DataService', () => {
  it('should add a new exercise to the database', () => {
    const service = new DataService();
    const exercise = {
      id: '1',
      name: 'Push-ups',
      description: 'Basic push-up exercise',
      muscleGroup: 'грудь',
      difficulty: 'средний'
    };
    
    service.addExercise(exercise);
    const exercises = service.getAllExercises();
    
    expect(exercises).toContainEqual(exercise);
  });
});

// Step 2: Run test (should fail)
// Step 3: Implement minimum code
class DataService {
  private exercises: Exercise[] = [];
  
  addExercise(exercise: Exercise): void {
    this.exercises.push(exercise);
  }
  
  getAllExercises(): Exercise[] {
    return this.exercises;
  }
}

// Step 4: Run test (should pass)
// Step 5: Refactor if needed
```

## 6. Best Practices

### 6.1. Test Quality Guidelines

- **Arrange-Act-Assert (AAA) Pattern**: Structure tests clearly
  ```typescript
  it('should do something', () => {
    // Arrange: Set up test data
    const input = { ... };
    
    // Act: Execute the code under test
    const result = functionUnderTest(input);
    
    // Assert: Verify the result
    expect(result).toBe(expected);
  });
  ```

- **One Assertion Per Test**: Focus each test on a single behavior
- **Descriptive Names**: Test names should read like documentation
- **Test Independence**: Tests should not depend on each other
- **Fast Tests**: Keep tests fast to enable quick feedback

### 6.2. Mocking Guidelines

- **Mock External Dependencies**: Mock localStorage, browser APIs, third-party libraries
- **Don't Mock What You're Testing**: Only mock dependencies, not the code under test
- **Use Real Objects When Possible**: Prefer real objects over mocks when practical

### 6.3. Test Coverage Goals

- **Minimum Coverage**: 80% code coverage
- **Critical Paths**: 100% coverage for business logic (WorkoutGenerator, WorkoutEngine)
- **Services**: 90%+ coverage for all services
- **Components**: Focus on user interactions and behavior, not implementation

## 7. Testing Specific Domains

### 7.1. Service Testing

Services should be tested in isolation with mocked localStorage:

```typescript
describe('DataService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });
  
  it('should persist exercises to localStorage', () => {
    const service = new DataService();
    const exercise = createMockExercise();
    
    service.addExercise(exercise);
    
    const stored = JSON.parse(localStorage.getItem('exercises') || '[]');
    expect(stored).toContainEqual(exercise);
  });
});
```

### 7.2. Component Testing

Use React Testing Library to test components from user perspective:

```typescript
describe('WorkoutScreen', () => {
  it('should display exercise name and timer', () => {
    const workout = createMockWorkout();
    render(<WorkoutScreen workout={workout} />);
    
    expect(screen.getByText(workout.currentExercise.name)).toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });
  
  it('should call onComplete when timer reaches zero', async () => {
    const onComplete = vi.fn();
    render(<WorkoutScreen workout={workout} onComplete={onComplete} />);
    
    // Simulate timer completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
```

### 7.3. Business Logic Testing

Test algorithms and complex logic thoroughly:

```typescript
describe('WorkoutGenerator', () => {
  it('should avoid repeating muscle groups from last workout', () => {
    const history = [{ muscleGroupsUsed: ['ноги', 'пресс'] }];
    const generator = new WorkoutGenerator(mockExerciseDB, history);
    
    const workout = generator.generate();
    const muscleGroups = workout.exercises.map(e => e.muscleGroup);
    
    expect(muscleGroups).not.toContain('ноги');
    expect(muscleGroups).not.toContain('пресс');
  });
});
```

## 8. Continuous Integration

### 8.1. Pre-commit Hooks

- Run tests before committing
- Ensure all tests pass
- Check test coverage thresholds

### 8.2. CI/CD Pipeline

- Run full test suite on every push
- Generate coverage reports
- Fail build if coverage drops below threshold
- Run tests in parallel for faster feedback

## 9. Maintenance and Evolution

### 9.1. Keeping Tests Maintainable

- Refactor tests when refactoring code
- Remove obsolete tests
- Update tests when requirements change
- Keep test data factories for consistency

### 9.2. Test Documentation

- Document complex test scenarios
- Explain why certain tests exist
- Keep test examples in documentation

## 10. Getting Started Checklist

When starting a new feature or component:

- [ ] Review architecture document for context
- [ ] Write failing test(s) for the feature
- [ ] Implement minimum code to pass tests
- [ ] Refactor code and tests
- [ ] Ensure test coverage meets thresholds
- [ ] Update documentation if needed

## 11. Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TDD by Example (Kent Beck)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

**Remember**: Tests are not just about finding bugs—they are living documentation of how your code should behave. Write tests that future developers (including yourself) will thank you for.
