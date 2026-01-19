# DRY Principle (Don't Repeat Yourself)

Every piece of knowledge should have a single, authoritative representation in a system.

## The Problem

```python
# Duplication across multiple functions
def create_user(data):
    if not data.get("email"):
        raise ValueError("Email is required")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
        raise ValueError("Invalid email format")
    if len(data.get("password", "")) < 8:
        raise ValueError("Password must be at least 8 characters")
    # ... create logic

def update_user(user_id, data):
    if not data.get("email"):
        raise ValueError("Email is required")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
        raise ValueError("Invalid email format")
    if len(data.get("password", "")) < 8:
        raise ValueError("Password must be at least 8 characters")
    # ... update logic

def invite_user(data):
    if not data.get("email"):
        raise ValueError("Email is required")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
        raise ValueError("Invalid email format")
    # ... invite logic
```

Problems:
- Bug fixes must be applied in multiple places
- Easy to update one place and forget others
- Inconsistencies creep in over time
- More code to read and maintain

## The Solution

Extract common logic into a single, reusable location:

```python
class UserValidator:
    EMAIL_PATTERN = r"[^@]+@[^@]+\.[^@]+"
    MIN_PASSWORD_LENGTH = 8

    @classmethod
    def validate_email(cls, email: str) -> None:
        if not email:
            raise ValueError("Email is required")
        if not re.match(cls.EMAIL_PATTERN, email):
            raise ValueError("Invalid email format")

    @classmethod
    def validate_password(cls, password: str) -> None:
        if len(password or "") < cls.MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {cls.MIN_PASSWORD_LENGTH} characters")

def create_user(data):
    UserValidator.validate_email(data.get("email"))
    UserValidator.validate_password(data.get("password"))
    # ... create logic

def update_user(user_id, data):
    UserValidator.validate_email(data.get("email"))
    UserValidator.validate_password(data.get("password"))
    # ... update logic

def invite_user(data):
    UserValidator.validate_email(data.get("email"))
    # ... invite logic
```

## Types of Duplication

### 1. Code Duplication
Identical or near-identical code blocks:

```javascript
// Before - duplicated formatting
function formatUserDisplay(user) {
    return `${user.firstName} ${user.lastName} (${user.email})`;
}

function formatAdminDisplay(admin) {
    return `${admin.firstName} ${admin.lastName} (${admin.email})`;
}

// After - single function
function formatPersonDisplay(person) {
    return `${person.firstName} ${person.lastName} (${person.email})`;
}
```

### 2. Logic Duplication
Same algorithm implemented differently:

```python
# Before - same logic, different implementations
def get_active_users(users):
    return [u for u in users if u.status == "active" and not u.deleted]

def count_active_users(users):
    count = 0
    for u in users:
        if u.status == "active" and not u.deleted:
            count += 1
    return count

# After - reuse the filter logic
def get_active_users(users):
    return [u for u in users if is_active(u)]

def count_active_users(users):
    return len(get_active_users(users))

def is_active(user):
    return user.status == "active" and not user.deleted
```

### 3. Data Duplication
Same information stored in multiple places:

```python
# Before - duplicated knowledge
class Order:
    def get_total(self):
        return sum(item.price * item.quantity for item in self.items)

    def get_item_count(self):
        return sum(item.quantity for item in self.items)

    def get_average_item_price(self):
        total = sum(item.price * item.quantity for item in self.items)
        count = sum(item.quantity for item in self.items)
        return total / count if count else 0

# After - compute once, reuse
class Order:
    @property
    def total(self):
        return sum(item.price * item.quantity for item in self.items)

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items)

    @property
    def average_item_price(self):
        return self.total / self.item_count if self.item_count else 0
```

## DRY Applied to Different Concerns

### Configuration
```yaml
# Before - repeated values
database:
  host: localhost
  port: 5432

cache:
  host: localhost
  port: 6379

# After - use variables/references
defaults:
  host: localhost

database:
  host: ${defaults.host}
  port: 5432

cache:
  host: ${defaults.host}
  port: 6379
```

### API Routes
```python
# Before - repeated pattern
@app.route("/api/users/<id>", methods=["GET"])
@app.route("/api/orders/<id>", methods=["GET"])
@app.route("/api/products/<id>", methods=["GET"])

# After - generic handler or generated routes
def register_crud_routes(app, resource_name, model):
    @app.route(f"/api/{resource_name}/<id>", methods=["GET"])
    def get_item(id):
        return model.query.get_or_404(id).to_dict()
```

### Error Messages
```javascript
// Before - duplicated strings
if (!email) throw new Error("Email is required");
if (!name) throw new Error("Name is required");
if (!password) throw new Error("Password is required");

// After - parameterized message
const required = (field) => { throw new Error(`${field} is required`); };

if (!email) required("Email");
if (!name) required("Name");
if (!password) required("Password");
```

## When NOT to Apply DRY

### Accidental Duplication
Code that looks similar but represents different concepts:

```python
# These look similar but serve different purposes
def validate_shipping_address(address):
    return bool(address.street and address.city and address.zip)

def validate_billing_address(address):
    return bool(address.street and address.city and address.zip)

# DON'T merge them! Requirements may diverge:
# - Billing might need card verification address
# - Shipping might need delivery instructions
```

### Over-Abstraction
Forcing DRY when it hurts readability:

```python
# Over-abstracted - hard to understand
def process(data, type):
    handler = get_handler(type)
    validator = get_validator(type)
    transformer = get_transformer(type)
    return handler(transformer(validator(data)))

# Sometimes explicit is better
def process_order(order):
    validate_order(order)
    return save_order(transform_order(order))

def process_refund(refund):
    validate_refund(refund)
    return save_refund(transform_refund(refund))
```

### The Rule of Three
Wait until you have three instances before extracting:

1. First time: Just write the code
2. Second time: Note the duplication, but it's okay to duplicate
3. Third time: Now extract the common pattern

This prevents premature abstraction based on incomplete patterns.

## Signs You Need DRY

- Copy-pasting code and changing small parts
- Bug fixes require updating multiple files
- "Find and replace" is your refactoring tool
- Changes in one place break seemingly unrelated features
- Same comment explaining the same logic in multiple places

## Signs You've Gone Too Far

- Abstractions require many parameters to handle all cases
- Simple changes require understanding complex shared code
- You're passing flags to toggle behavior in shared functions
- The abstraction is harder to understand than the duplication
