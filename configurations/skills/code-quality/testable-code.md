# Writing Testable Code

Code that's easy to test is usually well-designed code. Testability encourages separation of concerns, clear interfaces, and explicit dependencies.

## Core Principles

### 1. Dependency Injection

Instead of creating dependencies internally, accept them as parameters:

```python
# Hard to test - creates its own dependencies
class OrderService:
    def __init__(self):
        self.db = PostgresDatabase()  # Hardcoded dependency
        self.emailer = SMTPEmailer()  # Hardcoded dependency

    def place_order(self, order):
        self.db.save(order)
        self.emailer.send(order.customer.email, "Order placed!")

# Easy to test - dependencies are injected
class OrderService:
    def __init__(self, db, emailer):
        self.db = db
        self.emailer = emailer

    def place_order(self, order):
        self.db.save(order)
        self.emailer.send(order.customer.email, "Order placed!")

# In tests, inject mocks
def test_place_order():
    mock_db = Mock()
    mock_emailer = Mock()
    service = OrderService(mock_db, mock_emailer)

    service.place_order(sample_order)

    mock_db.save.assert_called_once_with(sample_order)
    mock_emailer.send.assert_called_once()
```

### 2. Pure Functions

Functions that depend only on their inputs and have no side effects are trivially testable:

```javascript
// Hard to test - depends on external state
let taxRate = 0.08;

function calculateTotal(items) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    return subtotal * (1 + taxRate);  // Uses global state
}

// Easy to test - pure function
function calculateTotal(items, taxRate) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    return subtotal * (1 + taxRate);
}

// Test is straightforward
test("calculates total with tax", () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items, 0.08)).toBe(32.40);
});
```

### 3. Separate Logic from I/O

Keep business logic separate from external interactions:

```python
# Hard to test - logic mixed with I/O
def process_file(filename):
    with open(filename) as f:
        data = json.load(f)

    # Business logic buried here
    results = []
    for item in data["items"]:
        if item["status"] == "active":
            item["processed"] = True
            results.append(item)

    with open(f"{filename}.out", "w") as f:
        json.dump(results, f)

# Easy to test - logic separated from I/O
def filter_active_items(items):
    """Pure business logic - easy to test"""
    return [
        {**item, "processed": True}
        for item in items
        if item["status"] == "active"
    ]

def process_file(filename):
    """I/O orchestration - test with integration tests"""
    with open(filename) as f:
        data = json.load(f)

    results = filter_active_items(data["items"])

    with open(f"{filename}.out", "w") as f:
        json.dump(results, f)

# Unit test the logic
def test_filter_active_items():
    items = [
        {"id": 1, "status": "active"},
        {"id": 2, "status": "inactive"},
    ]
    result = filter_active_items(items)
    assert len(result) == 1
    assert result[0]["processed"] == True
```

### 4. Small, Focused Functions

Smaller functions with single responsibilities are easier to test:

```typescript
// Hard to test - does too many things
function processUserRegistration(formData: FormData) {
    // Validate
    if (!formData.email.includes("@")) throw new Error("Invalid email");
    if (formData.password.length < 8) throw new Error("Password too short");

    // Hash password
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(formData.password, salt, 1000, 64, "sha512");

    // Save to database
    const user = db.users.create({ email: formData.email, hash, salt });

    // Send email
    emailService.send(formData.email, "Welcome!");

    return user;
}

// Easy to test - each function has one job
function validateEmail(email: string): boolean {
    return email.includes("@");
}

function validatePassword(password: string): boolean {
    return password.length >= 8;
}

function hashPassword(password: string): { hash: Buffer; salt: Buffer } {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512");
    return { hash, salt };
}

// Each function can be tested independently
test("validateEmail rejects invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("valid@example.com")).toBe(true);
});
```

## Patterns for Testability

### Interface-Based Design

```typescript
// Define interfaces for dependencies
interface EmailSender {
    send(to: string, subject: string, body: string): Promise<void>;
}

interface UserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}

// Class depends on interfaces, not implementations
class UserService {
    constructor(
        private users: UserRepository,
        private emailer: EmailSender
    ) {}

    async resetPassword(userId: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new Error("User not found");

        const token = generateToken();
        user.resetToken = token;
        await this.users.save(user);

        await this.emailer.send(
            user.email,
            "Password Reset",
            `Your reset token: ${token}`
        );
    }
}

// Test with mock implementations
class MockEmailSender implements EmailSender {
    sentEmails: Array<{to: string; subject: string; body: string}> = [];

    async send(to: string, subject: string, body: string) {
        this.sentEmails.push({ to, subject, body });
    }
}
```

### Factory Functions

```python
# Instead of hardcoding how objects are created
class ReportGenerator:
    def generate(self, data):
        formatter = PDFFormatter()  # Hardcoded
        return formatter.format(data)

# Use factories for flexibility
class ReportGenerator:
    def __init__(self, formatter_factory):
        self.formatter_factory = formatter_factory

    def generate(self, data):
        formatter = self.formatter_factory()
        return formatter.format(data)

# Test with different formatters
def test_generate_report():
    mock_formatter = Mock()
    mock_formatter.format.return_value = "formatted"

    generator = ReportGenerator(lambda: mock_formatter)
    result = generator.generate({"key": "value"})

    assert result == "formatted"
```

### Time and Randomness

```javascript
// Hard to test - uses system time directly
function isExpired(token) {
    return token.expiresAt < Date.now();
}

// Easy to test - time is injectable
function isExpired(token, currentTime = Date.now()) {
    return token.expiresAt < currentTime;
}

// Test with controlled time
test("token expires after expiration time", () => {
    const token = { expiresAt: 1000 };
    expect(isExpired(token, 999)).toBe(false);
    expect(isExpired(token, 1000)).toBe(false);
    expect(isExpired(token, 1001)).toBe(true);
});
```

### Configuration as Parameters

```python
# Hard to test - reads from environment
def connect_to_database():
    host = os.environ["DB_HOST"]
    port = int(os.environ["DB_PORT"])
    return Database(host, port)

# Easy to test - configuration is passed in
def connect_to_database(config):
    return Database(config.host, config.port)

# Or use a configuration object with defaults
@dataclass
class DatabaseConfig:
    host: str = "localhost"
    port: int = 5432

def connect_to_database(config: DatabaseConfig = None):
    config = config or DatabaseConfig()
    return Database(config.host, config.port)
```

## Anti-Patterns to Avoid

### Global State

```python
# Bad - global state makes tests interfere with each other
_cache = {}

def get_user(user_id):
    if user_id in _cache:
        return _cache[user_id]
    user = db.fetch_user(user_id)
    _cache[user_id] = user
    return user

# Better - cache is scoped to instance
class UserService:
    def __init__(self, db):
        self.db = db
        self.cache = {}

    def get_user(self, user_id):
        if user_id in self.cache:
            return self.cache[user_id]
        user = self.db.fetch_user(user_id)
        self.cache[user_id] = user
        return user
```

### Hidden Dependencies

```typescript
// Bad - imports create hidden dependencies
import { logger } from "./logger";
import { metrics } from "./metrics";

function processOrder(order: Order) {
    logger.info("Processing order");  // Hidden dependency
    metrics.increment("orders");      // Hidden dependency
    // ...
}

// Better - dependencies are explicit
function processOrder(
    order: Order,
    logger: Logger,
    metrics: Metrics
) {
    logger.info("Processing order");
    metrics.increment("orders");
    // ...
}
```

### Static Methods for Stateful Operations

```java
// Hard to test - static method can't be mocked
public class OrderProcessor {
    public void process(Order order) {
        // Can't mock this in tests
        PaymentGateway.charge(order.getTotal());
    }
}

// Better - instance method with injected dependency
public class OrderProcessor {
    private final PaymentGateway paymentGateway;

    public OrderProcessor(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public void process(Order order) {
        paymentGateway.charge(order.getTotal());
    }
}
```

## Testing Checklist

Before writing code, ask:

- [ ] Can I test this function without a database/network/filesystem?
- [ ] Are all dependencies passed in explicitly?
- [ ] Does this function do only one thing?
- [ ] Can I predict the output given the inputs?
- [ ] Can I test edge cases without complex setup?

If the answer is "no" to any of these, consider refactoring for testability.
