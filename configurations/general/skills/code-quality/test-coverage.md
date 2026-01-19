# Test Coverage

Test coverage is about testing the right things, not testing everything. Focus on tests that catch bugs and give confidence to refactor.

## What to Test

### 1. Business Logic
The core rules that define how your application works:

```python
# Critical business logic - definitely test this
def calculate_shipping_cost(order, destination):
    base_cost = 5.00

    if order.total >= 50:
        return 0  # Free shipping over $50

    if destination.is_international:
        return base_cost * 3

    if order.is_expedited:
        return base_cost * 2

    return base_cost

# Tests cover the business rules
def test_free_shipping_over_50():
    order = Order(total=50)
    assert calculate_shipping_cost(order, domestic) == 0

def test_international_shipping_multiplier():
    order = Order(total=20)
    assert calculate_shipping_cost(order, international) == 15.00

def test_expedited_shipping_multiplier():
    order = Order(total=20, is_expedited=True)
    assert calculate_shipping_cost(order, domestic) == 10.00
```

### 2. Edge Cases and Boundaries

```javascript
// Test boundaries where behavior changes
describe("passwordValidator", () => {
    test("rejects passwords under 8 characters", () => {
        expect(isValidPassword("1234567")).toBe(false);  // 7 chars
    });

    test("accepts passwords of exactly 8 characters", () => {
        expect(isValidPassword("12345678")).toBe(true);  // 8 chars
    });

    test("accepts passwords over 8 characters", () => {
        expect(isValidPassword("123456789")).toBe(true); // 9 chars
    });

    test("handles empty string", () => {
        expect(isValidPassword("")).toBe(false);
    });

    test("handles null/undefined", () => {
        expect(isValidPassword(null)).toBe(false);
        expect(isValidPassword(undefined)).toBe(false);
    });
});
```

### 3. Error Handling

```python
def test_raises_error_for_invalid_user_id():
    with pytest.raises(ValueError, match="User ID must be positive"):
        get_user(-1)

def test_returns_none_for_nonexistent_user():
    result = get_user(99999)
    assert result is None

def test_handles_database_connection_failure():
    with mock.patch("db.connect", side_effect=ConnectionError):
        with pytest.raises(ServiceUnavailableError):
            get_user(1)
```

### 4. Integration Points

```typescript
// Test that components work together correctly
describe("UserRegistrationFlow", () => {
    test("saves user and sends welcome email", async () => {
        const mockDb = new MockDatabase();
        const mockEmailer = new MockEmailer();
        const service = new RegistrationService(mockDb, mockEmailer);

        await service.register({
            email: "test@example.com",
            password: "securepass123"
        });

        // Verify the integration
        expect(mockDb.users).toHaveLength(1);
        expect(mockDb.users[0].email).toBe("test@example.com");
        expect(mockEmailer.sentEmails).toHaveLength(1);
        expect(mockEmailer.sentEmails[0].to).toBe("test@example.com");
    });
});
```

### 5. Regression Tests

When you fix a bug, add a test that would have caught it:

```python
# Bug: division by zero when cart is empty
def test_average_item_price_with_empty_cart():
    """Regression test for issue #123"""
    cart = ShoppingCart(items=[])
    # Should return 0, not raise ZeroDivisionError
    assert cart.average_item_price() == 0
```

## What NOT to Test

### Trivial Code

```python
# Don't test simple getters/setters
class User:
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        return self._name  # No need to test this
```

### Framework/Library Code

```javascript
// Don't test that React renders or Express routes
// The framework authors already tested this

// Bad - testing framework behavior
test("component renders", () => {
    render(<Button />);
    expect(document.querySelector("button")).toBeTruthy();
});

// Good - test YOUR logic
test("button calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Implementation Details

```python
# Bad - tests internal implementation
def test_uses_binary_search():
    searcher = Searcher()
    with mock.patch.object(searcher, "_binary_search") as mock_search:
        searcher.find([1, 2, 3], 2)
        mock_search.assert_called_once()

# Good - tests behavior
def test_finds_element_in_sorted_list():
    searcher = Searcher()
    assert searcher.find([1, 2, 3], 2) == 1  # Returns index
```

## Test Structure

### Arrange-Act-Assert (AAA)

```python
def test_apply_discount_to_order():
    # Arrange - set up test data
    order = Order(items=[
        Item(price=100),
        Item(price=50)
    ])
    discount = Discount(percentage=10)

    # Act - perform the action
    discounted_order = apply_discount(order, discount)

    # Assert - verify the result
    assert discounted_order.total == 135  # 150 - 10%
```

### Given-When-Then (BDD Style)

```javascript
describe("ShoppingCart", () => {
    describe("when applying a percentage discount", () => {
        it("should reduce total by the discount percentage", () => {
            // Given
            const cart = new ShoppingCart();
            cart.addItem({ price: 100 });
            cart.addItem({ price: 50 });

            // When
            cart.applyDiscount({ percentage: 10 });

            // Then
            expect(cart.total).toBe(135);
        });
    });
});
```

## Test Categories

### Unit Tests
- Test individual functions/classes in isolation
- Fast (milliseconds)
- No external dependencies
- Should be the majority of your tests

```python
def test_email_validator():
    assert is_valid_email("user@example.com") == True
    assert is_valid_email("invalid") == False
```

### Integration Tests
- Test multiple components working together
- May use test databases, mock servers
- Slower than unit tests

```python
def test_user_service_creates_and_retrieves_user(test_db):
    service = UserService(test_db)

    user_id = service.create_user("test@example.com")
    retrieved = service.get_user(user_id)

    assert retrieved.email == "test@example.com"
```

### End-to-End Tests
- Test complete user flows
- Slowest, most brittle
- Use sparingly for critical paths

```javascript
test("user can complete checkout", async () => {
    await page.goto("/products");
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout"]');
    await page.fill('[name="email"]', "test@example.com");
    await page.click('[data-testid="submit-order"]');

    await expect(page.locator(".confirmation")).toBeVisible();
});
```

## Coverage Metrics

### Line/Statement Coverage
Percentage of code lines executed by tests. Useful baseline, but can be misleading.

### Branch Coverage
Percentage of decision branches (if/else, switch cases) covered. More meaningful than line coverage.

```python
def categorize_age(age):
    if age < 13:
        return "child"
    elif age < 20:      # Branch 1
        return "teen"
    else:               # Branch 2
        return "adult"

# 100% line coverage with just:
test_categorize_age(15)  # Hits lines but misses branches

# Branch coverage requires:
test_categorize_age(10)  # child branch
test_categorize_age(15)  # teen branch
test_categorize_age(25)  # adult branch
```

### Meaningful Coverage Targets

- **80-90%** line coverage is a reasonable goal
- **100%** coverage doesn't mean bug-free code
- Focus on **critical path coverage** over raw percentages
- **Untested code** should be a conscious decision, not an oversight

## Testing Strategies

### Test the Public API

```typescript
// Focus on public interface, not internals
class Calculator {
    // Public API - test this
    public calculate(expression: string): number {
        const tokens = this.tokenize(expression);
        const ast = this.parse(tokens);
        return this.evaluate(ast);
    }

    // Private implementation - don't test directly
    private tokenize(expr: string): Token[] { }
    private parse(tokens: Token[]): AST { }
    private evaluate(ast: AST): number { }
}

// Test through public method
test("calculator evaluates expressions", () => {
    const calc = new Calculator();
    expect(calc.calculate("2 + 3")).toBe(5);
    expect(calc.calculate("10 / 2")).toBe(5);
});
```

### Parameterized Tests

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("World", "WORLD"),
    ("", ""),
    ("123", "123"),
    ("hElLo WoRlD", "HELLO WORLD"),
])
def test_uppercase(input, expected):
    assert uppercase(input) == expected
```

### Property-Based Testing

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_maintains_length(lst):
    sorted_lst = sort(lst)
    assert len(sorted_lst) == len(lst)

@given(st.lists(st.integers()))
def test_sort_is_ordered(lst):
    sorted_lst = sort(lst)
    for i in range(len(sorted_lst) - 1):
        assert sorted_lst[i] <= sorted_lst[i + 1]
```

## Summary

- **Test behavior, not implementation**
- **Focus on business logic and edge cases**
- **Write tests that catch real bugs**
- **Maintain tests like production code**
- **Coverage is a guide, not a goal**
