
# Code Structure Guidelines

## File Organization

### Component Structure
```typescript
// ComponentName.tsx
import { ComponentProps } from './types';
import { useComponentLogic } from './hooks';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  const { logic } = useComponentLogic(props);
  
  return (
    <div className="component-wrapper">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Hook Structure
```typescript
// useHookName.tsx
import { useState, useEffect } from 'react';
import { HookReturn, HookParams } from './types';

export const useHookName = (params: HookParams): HookReturn => {
  const [state, setState] = useState(initialState);
  
  // Hook logic
  
  return {
    // Return object
  };
};
```

### Service Structure
```typescript
// service-name.ts
import { ApiResponse } from '../types';

export class ServiceName {
  static async methodName(params: ParamsType): Promise<ApiResponse<DataType>> {
    try {
      // Service logic
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

## Naming Conventions

### Files and Folders
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useUserProfile.tsx`)
- **Services**: kebab-case (`user-service.ts`)
- **Utilities**: kebab-case (`string-utils.ts`)
- **Types**: kebab-case (`user-types.ts`)

### Variables and Functions
- **Variables**: camelCase (`userName`, `isLoading`)
- **Functions**: camelCase (`handleSubmit`, `validateForm`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`, `DEFAULT_CONFIG`)
- **Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## Code Organization Principles

### Single Responsibility
- One component per file
- One hook per file
- One service per file
- Clear separation of concerns

### Dependency Management
- Import order: external libraries → internal modules → relative imports
- Barrel exports for cleaner imports
- Avoid circular dependencies

### Error Handling
- Consistent error response format
- Graceful error boundaries
- User-friendly error messages
- Proper error logging

### TypeScript Best Practices
- Strict type checking
- Interface over type aliases
- Generic types where appropriate
- Avoid 'any' type

## Component Guidelines

### Props Interface
```typescript
interface ComponentProps {
  // Required props first
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props with defaults
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}
```

### State Management
- Use useState for local state
- Use useReducer for complex state
- Custom hooks for reusable logic
- Context for global state

### Event Handling
```typescript
const handleSubmit = useCallback((e: React.FormEvent) => {
  e.preventDefault();
  // Handle submission
}, [dependencies]);
```

## Testing Structure

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.tsx`
- Utility tests: `utility-name.test.ts`

### Test Organization
```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    // Rendering tests
  });
  
  describe('interactions', () => {
    // User interaction tests
  });
  
  describe('edge cases', () => {
    // Edge case tests
  });
});
```

## Performance Considerations

### Component Optimization
- Use React.memo for pure components
- Implement useCallback for event handlers
- Use useMemo for expensive calculations
- Code splitting with React.lazy

### Bundle Optimization
- Tree shaking
- Dynamic imports
- Asset optimization
- Dependency analysis

## Documentation Standards

### Component Documentation
```typescript
/**
 * UserProfile component displays user information and allows editing
 * 
 * @param user - User object containing profile data
 * @param onUpdate - Callback fired when user data is updated
 * @param editable - Whether the profile can be edited
 * 
 * @example
 * <UserProfile 
 *   user={currentUser} 
 *   onUpdate={handleUserUpdate}
 *   editable={true}
 * />
 */
```

### Code Comments
- Explain "why" not "what"
- Document complex business logic
- Add TODO comments for future improvements
- Keep comments up to date
