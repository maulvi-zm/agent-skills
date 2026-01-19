# Early Returns

Early returns (also called guard clauses) reduce nesting and make code easier to follow by handling edge cases upfront.

## The Problem: Deep Nesting

```javascript
function processOrder(order) {
    if (order) {
        if (order.items && order.items.length > 0) {
            if (order.customer) {
                if (order.customer.isActive) {
                    if (order.paymentMethod) {
                        // Finally, the actual logic buried 5 levels deep
                        const total = calculateTotal(order.items);
                        chargeCustomer(order.customer, order.paymentMethod, total);
                        sendConfirmation(order.customer.email);
                        return { success: true, total };
                    } else {
                        return { error: "No payment method" };
                    }
                } else {
                    return { error: "Customer inactive" };
                }
            } else {
                return { error: "No customer" };
            }
        } else {
            return { error: "No items" };
        }
    } else {
        return { error: "No order" };
    }
}
```

Problems:
- Hard to trace the "happy path"
- Error handling is far from the condition it checks
- Adding new conditions increases nesting
- Easy to misalign braces and logic

## The Solution: Guard Clauses

```javascript
function processOrder(order) {
    // Guard clauses handle edge cases early
    if (!order) {
        return { error: "No order" };
    }
    if (!order.items || order.items.length === 0) {
        return { error: "No items" };
    }
    if (!order.customer) {
        return { error: "No customer" };
    }
    if (!order.customer.isActive) {
        return { error: "Customer inactive" };
    }
    if (!order.paymentMethod) {
        return { error: "No payment method" };
    }

    // Happy path is clear and at the top level
    const total = calculateTotal(order.items);
    chargeCustomer(order.customer, order.paymentMethod, total);
    sendConfirmation(order.customer.email);
    return { success: true, total };
}
```

Benefits:
- Happy path is immediately visible
- Each condition is next to its error handling
- Flat structure is easier to scan
- Easy to add new validations

## Patterns and Examples

### Validation Guards

```python
def update_user(user_id: int, data: dict) -> User:
    # Validate inputs first
    if not user_id:
        raise ValueError("user_id is required")

    if not data:
        raise ValueError("data cannot be empty")

    user = db.get_user(user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")

    if not user.can_be_edited:
        raise PermissionError("User cannot be edited")

    # All validations passed, proceed with update
    user.update(data)
    return user
```

### Null/Undefined Checks

```typescript
function getDisplayName(user?: User): string {
    if (!user) {
        return "Anonymous";
    }
    if (!user.profile) {
        return user.email;
    }
    if (!user.profile.displayName) {
        return user.profile.firstName || user.email;
    }
    return user.profile.displayName;
}
```

### Loop Early Exits

```python
def find_user_by_email(users: list[User], email: str) -> User | None:
    for user in users:
        if user.email == email:
            return user  # Early return when found
    return None

def process_items(items: list[Item]) -> list[Result]:
    results = []
    for item in items:
        if not item.is_valid:
            continue  # Skip invalid items early

        if item.is_processed:
            continue  # Skip already processed

        # Process valid, unprocessed items
        results.append(process(item))
    return results
```

### Early Exit in Event Handlers

```javascript
function handleClick(event) {
    // Guard against invalid states
    if (isLoading) return;
    if (!isEnabled) return;
    if (event.defaultPrevented) return;

    // Actual handler logic
    submitForm();
}
```

## Converting Nested Code

### Step-by-Step Approach

1. **Identify the deepest nesting level** - this is usually the "success" case
2. **Invert each condition** and return early for the failure case
3. **Work from outside in**, converting one level at a time

```python
# Before
def get_discount(user, order):
    if user:
        if user.is_premium:
            if order.total > 100:
                return 0.2
            else:
                return 0.1
        else:
            return 0
    else:
        return 0

# After - step by step conversion
def get_discount(user, order):
    if not user:
        return 0
    if not user.is_premium:
        return 0
    if order.total <= 100:
        return 0.1
    return 0.2
```

### Complex Conditionals

```javascript
// Before - complex nested logic
function canUserAccessResource(user, resource) {
    if (user) {
        if (user.isAdmin) {
            return true;
        } else {
            if (resource.isPublic) {
                return true;
            } else {
                if (resource.owner === user.id) {
                    return true;
                } else {
                    if (resource.sharedWith.includes(user.id)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// After - early returns for success cases
function canUserAccessResource(user, resource) {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (resource.isPublic) return true;
    if (resource.owner === user.id) return true;
    if (resource.sharedWith.includes(user.id)) return true;
    return false;
}
```

## When to Use Early Returns

**Good candidates:**
- Validation and precondition checks
- Null/undefined handling
- Permission and access control checks
- Error conditions
- Simple branching with clear success/failure outcomes

**Less suitable:**
- When you need cleanup code that must always run (use try/finally)
- When multiple branches have equally important logic (not a clear "guard")
- When it would create too many exit points in a complex function

## Early Return vs. Single Exit

Some coding standards advocate for a single return statement. Here's the trade-off:

```python
# Single exit - all paths lead to one return
def process(data):
    result = None
    if data:
        if validate(data):
            result = transform(data)
    return result

# Multiple exits - early returns
def process(data):
    if not data:
        return None
    if not validate(data):
        return None
    return transform(data)
```

**Early returns win when:**
- Guards outnumber main logic
- Nesting would exceed 2-3 levels
- Each early return represents a distinct failure mode

**Single exit wins when:**
- You need guaranteed cleanup (though try/finally is better)
- The function is very short already
- Debugging requires tracking the single exit point

## Combining with Other Patterns

### With Guard Objects

```typescript
function processPayment(payment: Payment): Result {
    const validation = validatePayment(payment);
    if (!validation.isValid) {
        return Result.failure(validation.errors);
    }

    const authorization = authorizePayment(payment);
    if (!authorization.approved) {
        return Result.failure(authorization.reason);
    }

    return executePayment(payment);
}
```

### With Optional Chaining

```javascript
function getCity(user) {
    // Instead of nested checks
    return user?.address?.city ?? "Unknown";
}
```

## Summary

- **Flat is better than nested**: Aim for maximum 2-3 levels of indentation
- **Fail fast**: Check for invalid conditions immediately
- **Keep the happy path prominent**: Main logic shouldn't be buried in nesting
- **Each guard is self-contained**: Condition and its handling are together
