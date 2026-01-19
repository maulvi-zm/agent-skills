# Naming Conventions

Clear, consistent naming is one of the most impactful ways to improve code readability and maintainability.

## Core Principles

### Be Descriptive and Specific
Names should reveal intent. A reader should understand what a variable holds or what a function does without reading its implementation.

```python
# Bad
d = 86400
fn = "report.pdf"
def process(data):
    pass

# Good
seconds_per_day = 86400
output_filename = "report.pdf"
def generate_monthly_sales_report(transactions):
    pass
```

### Use Consistent Casing

Follow language conventions:

| Language   | Variables/Functions | Classes/Types | Constants      |
|------------|---------------------|---------------|----------------|
| Python     | snake_case          | PascalCase    | SCREAMING_SNAKE|
| JavaScript | camelCase           | PascalCase    | SCREAMING_SNAKE|
| Go         | camelCase           | PascalCase    | camelCase      |
| Ruby       | snake_case          | PascalCase    | SCREAMING_SNAKE|

### Name Length Should Match Scope

- **Small scope** (loop counters, lambdas): short names are acceptable
- **Large scope** (module-level, public APIs): longer, descriptive names

```javascript
// Short scope - short name is fine
users.map(u => u.name);

// Long scope - be descriptive
const maximumLoginAttemptsBeforeLockout = 5;
```

## Specific Guidelines

### Variables
- Use nouns or noun phrases
- Booleans should read as true/false questions: `isActive`, `hasPermission`, `canEdit`
- Collections should be plural: `users`, `orderItems`, `selectedIds`

```python
# Bad
flag = True
data = []
temp = get_user()

# Good
is_authenticated = True
pending_orders = []
current_user = get_user()
```

### Functions and Methods
- Use verbs or verb phrases
- Name should describe what it does, not how

```javascript
// Bad
function data() { }
function doIt() { }
function handleClick() { }  // too vague in large codebases

// Good
function fetchUserProfile() { }
function calculateTotalPrice() { }
function submitPaymentForm() { }
```

### Classes and Types
- Use nouns
- Avoid generic suffixes like `Manager`, `Handler`, `Data`, `Info` unless truly appropriate

```typescript
// Bad
class UserManager { }
class OrderData { }
class StringHelper { }

// Good
class UserRepository { }
class Order { }
class StringFormatter { }
```

### Constants
- Use SCREAMING_SNAKE_CASE for true constants
- Name should explain the meaning, not the value

```python
# Bad
FIVE = 5
NUM = 100

# Good
MAX_RETRY_ATTEMPTS = 5
DEFAULT_PAGE_SIZE = 100
```

## Common Patterns

### Paired Operations
Use symmetrical names for related operations:
- `open` / `close`
- `start` / `stop`
- `create` / `destroy`
- `add` / `remove`
- `get` / `set`
- `show` / `hide`

### Prefixes and Suffixes
- `is_`, `has_`, `can_`, `should_` for booleans
- `_count`, `_total`, `_sum` for aggregates
- `min_`, `max_` for boundaries
- `raw_`, `parsed_`, `formatted_` for data states

## What to Avoid

1. **Abbreviations** (unless universally understood): `usr`, `btn`, `mgr`
2. **Single letters** (except loop counters): `x`, `n`, `s`
3. **Misleading names**: `userList` when it's actually a `Set`
4. **Overly long names**: `getUserByIdFromDatabaseAndValidatePermissions()`
5. **Encoded types**: `strName`, `arrItems` (Hungarian notation)
6. **Negated booleans**: `isNotValid`, `disableFeature` (hard to reason about)

## Refactoring Signals

Consider renaming when:
- You need a comment to explain what a variable holds
- You confuse variables with similar names
- Code reviews frequently ask "what is this?"
- You can't understand code you wrote a month ago
