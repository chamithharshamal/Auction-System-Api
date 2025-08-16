# Test Execution Guide

## Running Tests

### Run All Tests
```bash
mvn test
```

### Run Specific Test Categories

#### Unit Tests Only
```bash
mvn test -Dtest="*Test" -DexcludeGroups="integration"
```

#### Integration Tests Only
```bash
mvn test -Dtest="*IntegrationTest"
```

#### Controller Tests Only
```bash
mvn test -Dtest="*ControllerTest"
```

#### Service Tests Only
```bash
mvn test -Dtest="*ServiceTest"
```

#### Exception Handler Tests
```bash
mvn test -Dtest="GlobalExceptionHandlerTest"
```

#### Validation Tests
```bash
mvn test -Dtest="ValidationTest,PasswordMatchesValidatorTest"
```

### Run Specific Test Classes
```bash
mvn test -Dtest=AuthControllerTest
mvn test -Dtest=UserServiceTest
mvn test -Dtest=AuthIntegrationTest
```

### Run Tests with Coverage (if Jacoco is configured)
```bash
mvn test jacoco:report
```

### Run Tests in Debug Mode
```bash
mvn test -Dmaven.surefire.debug
```

## Test Structure

```
src/test/java/
├── controller/           # Controller unit tests
├── service/             # Service layer tests  
├── exception/           # Exception handling tests
├── dto/                 # DTO validation tests
├── validation/          # Custom validator tests
├── integration/         # Full integration tests
└── AuctionAppApiApplicationTests.java  # Context loading test
```

## Test Categories

1. **Unit Tests** - Fast, isolated tests for individual components
2. **Integration Tests** - Full application tests with database (using Testcontainers)
3. **Validation Tests** - DTO and custom validation testing
4. **Exception Tests** - Global exception handler testing

## Test Database

Integration tests use Testcontainers with MongoDB to provide a real database environment without affecting your development database.