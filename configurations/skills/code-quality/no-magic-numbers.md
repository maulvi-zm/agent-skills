# No Magic Numbers

Magic numbers are unexplained numeric literals scattered throughout code. They obscure meaning and make maintenance difficult.

## The Problem

```javascript
// What do these numbers mean?
if (user.age >= 18) { }
if (retryCount > 3) { }
if (password.length < 8) { }
setTimeout(callback, 86400000);
const price = amount * 1.0825;
```

A reader must guess or research what each number represents. When requirements change, you must find and update every occurrence.

## The Solution

Extract magic numbers into named constants that explain their purpose.

```javascript
const LEGAL_ADULT_AGE = 18;
const MAX_RETRY_ATTEMPTS = 3;
const MIN_PASSWORD_LENGTH = 8;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TEXAS_SALES_TAX_RATE = 1.0825;

if (user.age >= LEGAL_ADULT_AGE) { }
if (retryCount > MAX_RETRY_ATTEMPTS) { }
if (password.length < MIN_PASSWORD_LENGTH) { }
setTimeout(callback, ONE_DAY_MS);
const price = amount * TEXAS_SALES_TAX_RATE;
```

## Benefits

1. **Self-documenting code**: The constant name explains the value's purpose
2. **Single source of truth**: Change the value in one place
3. **Easier searching**: Find all usages of `MAX_RETRY_ATTEMPTS` vs finding all `3`s
4. **Type safety**: Some languages can enforce constant types
5. **IDE support**: Autocomplete, refactoring, find references

## When Constants Are Acceptable Inline

Some numbers are universally understood and don't need extraction:

```python
# These are generally fine inline
for i in range(0, len(items)):  # 0 as starting index
    pass

midpoint = total / 2  # Dividing by 2 for half
percentage = value * 100  # Converting to percentage

# Array/string indexing
first_char = text[0]
last_item = items[-1]

# Common mathematical operations
squared = value ** 2
celsius = (fahrenheit - 32) * 5 / 9
```

## Best Practices

### Group Related Constants

```python
# Bad - scattered throughout codebase
MAX_USERNAME_LENGTH = 50
MAX_PASSWORD_LENGTH = 128
MAX_EMAIL_LENGTH = 255

# Good - grouped in a configuration module
class ValidationLimits:
    USERNAME_MAX = 50
    PASSWORD_MAX = 128
    EMAIL_MAX = 255
```

### Use Enums for Related Values

```typescript
// Bad
const STATUS_PENDING = 0;
const STATUS_APPROVED = 1;
const STATUS_REJECTED = 2;

// Good
enum OrderStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
```

### Calculate Derived Values

```javascript
// Bad - what if you need to change the base timeout?
const SHORT_TIMEOUT = 5000;
const MEDIUM_TIMEOUT = 15000;
const LONG_TIMEOUT = 30000;

// Good - relationships are clear
const BASE_TIMEOUT_MS = 5000;
const SHORT_TIMEOUT = BASE_TIMEOUT_MS;
const MEDIUM_TIMEOUT = BASE_TIMEOUT_MS * 3;
const LONG_TIMEOUT = BASE_TIMEOUT_MS * 6;
```

### Name by Meaning, Not Value

```python
# Bad - name describes the value
SIXTY = 60
ONE_HUNDRED = 100

# Good - name describes the purpose
SECONDS_PER_MINUTE = 60
MAX_PERCENTAGE = 100
```

## Magic Strings Too

The same principle applies to string literals:

```python
# Bad
if user.role == "admin":
    pass
if status == "pending_review":
    pass

# Good
ROLE_ADMIN = "admin"
STATUS_PENDING_REVIEW = "pending_review"

if user.role == ROLE_ADMIN:
    pass
if status == STATUS_PENDING_REVIEW:
    pass
```

## Configuration vs Constants

Distinguish between:

- **True constants**: Values that never change (mathematical constants, conversion factors)
- **Configuration**: Values that might change per environment or deployment

```python
# Constants - define in code
PI = 3.14159
BYTES_PER_KB = 1024

# Configuration - load from config files/environment
DATABASE_POOL_SIZE = config.get("db_pool_size")
API_RATE_LIMIT = config.get("rate_limit")
```

## Refactoring Signals

Extract a magic number when:
- You need a comment to explain what it means
- The same value appears in multiple places
- The value might need to change
- The value represents a business rule
- Code reviewers ask "why this number?"
