
# Contributing Guide

## Welcome

Thank you for your interest in contributing to AI Marketing Hub! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:5173 in your browser

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # Layout-specific components
│   └── settings/        # Settings page components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and services
├── contexts/           # React context providers
└── integrations/       # Third-party service integrations
```

## Development Guidelines

### Code Style

We follow these coding standards:

1. **TypeScript**: All new code should be written in TypeScript
2. **React Patterns**: Use functional components and hooks
3. **Naming Conventions**:
   - Components: PascalCase (`UserProfile`)
   - Functions: camelCase (`getUserData`)
   - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
   - Files: kebab-case (`user-profile.tsx`)

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composition patterns
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Exports**: Use default exports for components

**Example Component**:
```typescript
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      {onEdit && (
        <button onClick={onEdit} className="mt-2 text-blue-600">
          Edit
        </button>
      )}
    </div>
  );
};

export default UserCard;
```

### Custom Hooks

Create custom hooks for reusable logic:

```typescript
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user logic
  }, [userId]);

  return { user, loading, error };
};
```

### Styling Guidelines

1. **Tailwind CSS**: Use Tailwind classes for styling
2. **Responsive Design**: Always implement responsive designs
3. **Component Variants**: Use class-variance-authority for component variants
4. **Dark Mode**: Consider dark mode support where applicable

### State Management

1. **Local State**: Use `useState` for component-specific state
2. **Server State**: Use React Query for server data
3. **Global State**: Use React Context for app-wide state
4. **Form State**: Use react-hook-form for form management

## Contribution Process

### 1. Issue Creation
Before starting work:
- Check existing issues to avoid duplicates
- Create a detailed issue describing the bug or feature
- Wait for approval from maintainers for large features

### 2. Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names: `feature/user-authentication` or `fix/campaign-list-error`
- Keep branches focused on single features or fixes

### 3. Commit Guidelines
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(auth): add user authentication system
fix(campaigns): resolve campaign list loading issue
docs(readme): update installation instructions
```

### 4. Pull Request Process

1. **Create Pull Request**:
   - Use descriptive titles
   - Include detailed description
   - Reference related issues
   - Add screenshots for UI changes

2. **Pull Request Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Verified responsive design

## Screenshots
[Include screenshots for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

3. **Review Process**:
   - Address reviewer feedback
   - Keep discussions focused and constructive
   - Update PR based on feedback

## Testing Guidelines

### Unit Testing
```typescript
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

test('renders user information', () => {
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  render(<UserCard user={user} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

### Integration Testing
- Test component interactions
- Test API integration points
- Test user workflows

### Manual Testing
- Test across different screen sizes
- Verify accessibility with screen readers
- Test in different browsers

## Documentation

### Code Documentation
- Use JSDoc for complex functions
- Add inline comments for complex logic
- Document component props with TypeScript interfaces

### README Updates
Update relevant documentation when:
- Adding new features
- Changing API interfaces
- Modifying build processes
- Adding new dependencies

## Performance Considerations

### Optimization Guidelines
1. **Bundle Size**: Keep bundle size minimal
2. **Code Splitting**: Use dynamic imports for large components
3. **Memoization**: Use React.memo and useMemo appropriately
4. **Image Optimization**: Optimize images and use appropriate formats

### Performance Monitoring
- Monitor bundle size changes
- Check Core Web Vitals
- Test on slower devices and networks

## Accessibility

### Requirements
- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigation works
- Provide proper ARIA labels
- Test with screen readers

### Implementation
```typescript
// Good accessibility example
<button
  aria-label="Delete user account"
  onClick={handleDelete}
  className="text-red-600 hover:text-red-800"
>
  <TrashIcon className="h-4 w-4" />
</button>
```

## Security Guidelines

### Best Practices
1. **Input Validation**: Always validate user inputs
2. **XSS Prevention**: Sanitize user-generated content
3. **Authentication**: Use secure authentication patterns
4. **API Security**: Validate API requests and responses

### Code Examples
```typescript
// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Secure API calls
const apiCall = async (endpoint: string, data: any) => {
  const token = await getAuthToken();
  return fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
};
```

## Release Process

### Version Management
- Follow semantic versioning (semver)
- Update version numbers appropriately
- Create release notes for significant changes

### Deployment
- Test in staging environment
- Verify all features work correctly
- Monitor for issues after deployment

## Getting Help

### Resources
- Check existing documentation first
- Search through existing issues
- Join our Discord community (if available)

### Support Channels
- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and general discussion
- Email: For private or security-related issues

## Recognition

Contributors will be recognized in:
- README contributor section
- Release notes for significant contributions
- Project documentation

Thank you for contributing to AI Marketing Hub!
