# Single Responsibility Principle

A function, class, or module should have one reason to change. It should do one thing and do it well.

## The Problem

```python
# This function does too many things
def process_user_registration(form_data):
    # Validate input
    if not form_data.get("email"):
        raise ValueError("Email required")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", form_data["email"]):
        raise ValueError("Invalid email format")
    if len(form_data.get("password", "")) < 8:
        raise ValueError("Password too short")

    # Hash password
    salt = os.urandom(32)
    hashed = hashlib.pbkdf2_hmac("sha256", form_data["password"].encode(), salt, 100000)

    # Save to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, password_hash, salt) VALUES (%s, %s, %s)",
        (form_data["email"], hashed, salt)
    )
    conn.commit()

    # Send welcome email
    msg = MIMEText(f"Welcome {form_data['email']}!")
    msg["Subject"] = "Welcome to our service"
    smtp = smtplib.SMTP("smtp.example.com")
    smtp.send_message(msg)

    # Log analytics
    requests.post("https://analytics.example.com/events", json={
        "event": "user_registered",
        "email": form_data["email"]
    })

    return {"status": "success"}
```

Problems with this approach:
- Hard to test (need database, SMTP server, analytics API)
- Hard to reuse (can't validate without saving)
- Hard to modify (changing email logic risks breaking database logic)
- Hard to understand (must read entire function to find specific logic)

## The Solution

Separate each responsibility into focused units:

```python
# Validation
class UserValidator:
    def validate_registration(self, form_data: dict) -> list[str]:
        errors = []
        if not form_data.get("email"):
            errors.append("Email required")
        elif not re.match(r"[^@]+@[^@]+\.[^@]+", form_data["email"]):
            errors.append("Invalid email format")
        if len(form_data.get("password", "")) < 8:
            errors.append("Password too short")
        return errors

# Password hashing
class PasswordHasher:
    def hash(self, password: str) -> tuple[bytes, bytes]:
        salt = os.urandom(32)
        hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return hashed, salt

# Data persistence
class UserRepository:
    def __init__(self, connection):
        self.conn = connection

    def create(self, email: str, password_hash: bytes, salt: bytes) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, password_hash, salt) VALUES (%s, %s, %s) RETURNING id",
            (email, password_hash, salt)
        )
        self.conn.commit()
        return cursor.fetchone()[0]

# Email notifications
class WelcomeEmailSender:
    def __init__(self, smtp_client):
        self.smtp = smtp_client

    def send(self, email: str):
        msg = MIMEText(f"Welcome {email}!")
        msg["Subject"] = "Welcome to our service"
        self.smtp.send_message(msg)

# Orchestration - coordinates the pieces
class RegistrationService:
    def __init__(self, validator, hasher, repository, email_sender, analytics):
        self.validator = validator
        self.hasher = hasher
        self.repository = repository
        self.email_sender = email_sender
        self.analytics = analytics

    def register(self, form_data: dict) -> dict:
        errors = self.validator.validate_registration(form_data)
        if errors:
            return {"status": "error", "errors": errors}

        password_hash, salt = self.hasher.hash(form_data["password"])
        user_id = self.repository.create(form_data["email"], password_hash, salt)

        self.email_sender.send(form_data["email"])
        self.analytics.track("user_registered", {"email": form_data["email"]})

        return {"status": "success", "user_id": user_id}
```

## Benefits

1. **Testability**: Each component can be tested in isolation with mocks
2. **Reusability**: `PasswordHasher` can be used for password resets too
3. **Maintainability**: Email template changes don't risk breaking database logic
4. **Readability**: Each class is small and focused
5. **Flexibility**: Easy to swap implementations (different email provider, database)

## Applying SRP at Different Levels

### Functions
Each function should perform one logical operation:

```javascript
// Bad - multiple operations
function updateUserAndNotify(userId, data) {
    db.users.update(userId, data);
    emailService.send(userId, "Profile updated");
    cache.invalidate(`user:${userId}`);
    logger.info(`User ${userId} updated`);
}

// Good - separate concerns
function updateUser(userId, data) {
    db.users.update(userId, data);
}

function notifyUserUpdated(userId) {
    emailService.send(userId, "Profile updated");
}

function invalidateUserCache(userId) {
    cache.invalidate(`user:${userId}`);
}
```

### Classes
Each class should represent one concept:

```python
# Bad - User class does too much
class User:
    def save(self): pass
    def send_email(self): pass
    def generate_report(self): pass
    def validate(self): pass

# Good - separate concerns
class User:
    """Represents user data and behavior"""
    pass

class UserRepository:
    """Handles user persistence"""
    pass

class UserNotifier:
    """Handles user notifications"""
    pass
```

### Modules/Files
Each module should have a cohesive purpose:

```
# Bad - everything in one file
utils.py  # Contains validation, formatting, API calls, file operations

# Good - organized by responsibility
validators/
    user_validator.py
    order_validator.py
formatters/
    date_formatter.py
    currency_formatter.py
clients/
    payment_api.py
    shipping_api.py
```

## Signs of SRP Violation

- Function/class names include "and" or "or"
- You need to mock many dependencies to test something
- Changes in one area frequently break unrelated features
- Class has many imports from different domains
- Difficult to name something because it does multiple things
- Comments separating "sections" within a function

## Finding the Right Granularity

SRP doesn't mean "every function does one line." Find the right level of abstraction:

```python
# Too granular - every tiny step is a function
def get_first_char(s): return s[0]
def uppercase_char(c): return c.upper()
def capitalize(s): return uppercase_char(get_first_char(s)) + s[1:]

# Just right - one logical operation
def capitalize(s):
    return s[0].upper() + s[1:] if s else s
```

The goal is cohesion: everything in a unit should be related and work together toward one purpose.
