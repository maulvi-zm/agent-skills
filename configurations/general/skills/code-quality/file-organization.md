# File Organization

Well-organized code is easier to navigate, understand, and maintain. Consistent structure helps developers find what they need quickly.

## Directory Structure Patterns

### Feature-Based (Recommended for Most Projects)

Group files by feature or domain:

```
src/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types.ts
│   └── index.ts
├── orders/
│   ├── components/
│   │   ├── OrderList.tsx
│   │   └── OrderDetail.tsx
│   ├── hooks/
│   │   └── useOrders.ts
│   ├── services/
│   │   └── orderService.ts
│   ├── types.ts
│   └── index.ts
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

**Benefits:**
- Related code is co-located
- Easy to understand feature boundaries
- Features can be developed independently
- Simpler to extract into packages/microservices later

### Layer-Based (Traditional)

Group files by technical role:

```
src/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── OrderList.tsx
│   └── OrderDetail.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useOrders.ts
├── services/
│   ├── authService.ts
│   └── orderService.ts
├── types/
│   ├── auth.ts
│   └── orders.ts
└── utils/
```

**When to use:**
- Small projects with few features
- Libraries/packages with clear API layers
- When team is familiar with this pattern

## File Naming Conventions

### Be Consistent
Pick a convention and stick to it:

```
# kebab-case (common in many ecosystems)
user-profile.ts
order-service.ts

# PascalCase (common for components)
UserProfile.tsx
OrderService.ts

# snake_case (Python standard)
user_profile.py
order_service.py
```

### Name Files by Content

```
# Bad - generic names
utils.ts        # What utilities?
helpers.py      # Helpers for what?
types.ts        # Which types?

# Good - specific names
string-utils.ts
date-formatters.py
user-types.ts
```

### Match Export Names

```typescript
// user-service.ts
export class UserService { }

// UserProfile.tsx
export function UserProfile() { }

// constants.ts (multiple exports are fine)
export const API_URL = "...";
export const TIMEOUT = 5000;
```

## Single File Structure

Organize code within files consistently:

### Recommended Order

```typescript
// 1. Imports - external first, then internal
import React from "react";
import { format } from "date-fns";

import { Button } from "@/components";
import { useAuth } from "@/hooks";
import type { User } from "@/types";

// 2. Type definitions (if not in separate file)
interface Props {
    user: User;
    onSave: (user: User) => void;
}

// 3. Constants
const MAX_NAME_LENGTH = 100;

// 4. Helper functions (private to this file)
function formatUserName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
}

// 5. Main export
export function UserProfile({ user, onSave }: Props) {
    // Component implementation
}

// 6. Secondary exports (if any)
export function UserProfileSkeleton() {
    // Loading state component
}
```

### Python Module Structure

```python
"""Module docstring explaining purpose."""

# Standard library imports
import os
from datetime import datetime

# Third-party imports
import requests
from sqlalchemy import Column

# Local imports
from .models import User
from .utils import format_date

# Constants
DEFAULT_TIMEOUT = 30

# Private helpers
def _validate_input(data):
    pass

# Public API
def fetch_user(user_id: int) -> User:
    pass

class UserService:
    pass

# Module-level initialization (if needed)
_cache = {}
```

## Index Files / Barrel Exports

Use index files to create clean public APIs:

```typescript
// components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";

// Usage elsewhere
import { Button, Input, Modal } from "@/components";
```

**Guidelines:**
- Only export public API through index
- Keep internal utilities private
- Avoid circular dependencies

## Co-location Principles

### Keep Related Files Close

```
# Good - test next to implementation
UserService.ts
UserService.test.ts

# Good - styles with component
Button/
├── Button.tsx
├── Button.styles.css
└── Button.test.tsx
```

### Keep Configuration at Root

```
project/
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── src/
```

### Separate Generated Code

```
project/
├── src/           # Source code
├── dist/          # Build output
├── generated/     # Auto-generated code
└── coverage/      # Test coverage reports
```

## File Size Guidelines

### When to Split a File

- **Over 300-500 lines**: Consider splitting
- **Multiple unrelated exports**: Separate by concern
- **Hard to navigate**: If you're constantly searching within the file

### How to Split

```
# Before - one large file
UserPage.tsx (800 lines)

# After - split by concern
UserPage/
├── index.tsx           # Main component, orchestration
├── UserHeader.tsx      # Header section
├── UserDetails.tsx     # Details section
├── UserActions.tsx     # Action buttons
├── hooks.ts            # Custom hooks for this page
└── types.ts            # Types specific to this page
```

## Avoid These Patterns

### God Files
```
# Bad
utils.ts      # 2000 lines of random utilities
helpers.py    # Everything that doesn't fit elsewhere
common.js     # Dumping ground
```

### Deep Nesting
```
# Bad - too many levels
src/modules/features/user/components/forms/inputs/TextInput.tsx

# Better - flatter structure
src/user/components/TextInput.tsx
```

### Inconsistent Structure
```
# Bad - mixed patterns
src/
├── components/UserList.tsx      # In components folder
├── OrderDetail.tsx              # At root
├── features/payments/           # In features folder
└── auth/components/             # Different nesting
```

## Migration Strategy

When reorganizing existing code:

1. **Document the target structure** before starting
2. **Move one feature at a time**, keeping the app working
3. **Update imports** using IDE refactoring tools
4. **Add lint rules** to enforce the new structure
5. **Update documentation** with the new conventions
