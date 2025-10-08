# Knip - Code Cleanup Tool

## ⚠️ STAGING ONLY - NEVER USE IN PRODUCTION

Knip is **strictly a development/staging tool** and is intentionally excluded from production builds.

---

## What is Knip?

Knip is an automated tool that helps maintain clean codebases by finding:

- 🗑️ **Unused files** - Source files that are never imported
- 📦 **Unused dependencies** - npm packages installed but never used
- 🔍 **Unused exports** - Functions, classes, and variables exported but never imported
- ❌ **Missing dependencies** - Packages used in code but not in package.json

Think of it as a linter for your project structure, not just your code.

---

## How Knip Works

1. **Entry Point Analysis**: Starts from your entry files (e.g., `src/main.tsx`, `src/App.tsx`)
2. **Dependency Graph**: Builds a complete graph of all imports/exports
3. **Dead Code Detection**: Compares the graph against your file system and package.json
4. **Report Generation**: Shows what's unused and can be safely removed

---

## Why Staging Only?

Knip is in `devDependencies` (not `dependencies`) for several reasons:

1. **Analysis Tool**: It's for analysis, not runtime functionality
2. **Performance**: No need to bloat production builds with dev tools
3. **Security**: Reduces attack surface in production
4. **Build Size**: Keeps production bundles minimal

**Automatic Exclusion:**
- ✅ Production builds automatically ignore `devDependencies`
- ✅ `npm ci --production` skips knip
- ✅ Build tools (Vite) exclude it from bundles
- ✅ Deployment platforms (Vercel, Netlify, Render) don't install it

---

## How to Use Knip

### Basic Usage

```bash
# Run knip to analyze your codebase
npm run knip
```

### Common Workflows

#### 1. Find Unused Dependencies
```bash
npm run knip
# Look for "Unused dependencies" section
# Example output:
# ❌ axios (installed but never imported)
# ❌ lodash (installed but never imported)
```

#### 2. Find Unused Exports
```bash
npm run knip
# Look for "Unused exports" section
# Example output:
# src/utils/helper.ts
#   ❌ formatDate (exported but never used)
#   ❌ parseJson (exported but never used)
```

#### 3. Find Unused Files
```bash
npm run knip
# Look for "Unused files" section
# Example output:
# ❌ src/components/OldButton.tsx
# ❌ src/pages/DeprecatedPage.tsx
```

#### 4. Auto-Fix (Careful!)
```bash
npx knip --fix
# This will automatically remove unused dependencies from package.json
# ⚠️ Review changes carefully before committing!
```

---

## Configuration

Knip works out-of-the-box for most TypeScript/React projects, but you can customize it:

### Create `.kniprc.json` (optional)

```json
{
  "entry": ["src/main.tsx"],
  "project": ["src/**/*.{ts,tsx}"],
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "src/types/**"
  ],
  "ignoreDependencies": [
    "@types/*"
  ]
}
```

---

## When to Run Knip

### Recommended Schedule

- **Before major refactors** - Clean slate for changes
- **After feature completion** - Remove experimental code
- **Weekly in staging** - Prevent accumulation
- **Before releases** - Final cleanup

### CI/CD Integration (Staging Only)

Add to your staging pipeline (NOT production):

```yaml
# .github/workflows/staging.yml
- name: Analyze unused code
  run: npm run knip
  continue-on-error: true  # Don't fail build, just report
```

---

## What to Do With Results

### Unused Dependencies

```bash
# Review the list
npm run knip

# If confirmed unused, remove them
npm uninstall axios lodash
```

### Unused Exports

```bash
# Option 1: Remove the export if truly unused
# Option 2: Remove the entire function/class if never called
# Option 3: Keep it if it's part of your public API
```

### Unused Files

```bash
# Verify the file is truly unused
npm run knip

# If confirmed, delete it
rm src/components/OldButton.tsx

# Or move to archive folder
mkdir -p archive
mv src/components/OldButton.tsx archive/
```

---

## Common False Positives

Knip might report some false positives. Here's how to handle them:

### 1. Dynamic Imports

Knip may not detect:
```typescript
const module = await import(`./components/${name}.tsx`)
```

**Solution:** Add to `.kniprc.json` ignore list

### 2. Type-Only Imports

Sometimes TypeScript types aren't detected:
```typescript
import type { User } from './types'
```

**Solution:** Usually safe to ignore, these don't affect bundle size

### 3. Environment-Specific Code

```typescript
if (import.meta.env.DEV) {
  // Dev-only code
}
```

**Solution:** Configure entry points per environment

---

## Example Output

```bash
$ npm run knip

✂️  Knip v5.64.2

Analyzing 487 files...

❌ Unused dependencies (3)
  axios          Installed but never imported
  lodash         Installed but never imported
  moment         Installed but never imported

❌ Unused exports (12)
  src/utils/format.ts
    formatCurrency
    parseDate
  src/components/Button.tsx
    ButtonVariant (type)

❌ Unused files (5)
  src/components/OldModal.tsx
  src/pages/DeprecatedDashboard.tsx
  src/utils/legacy.ts

✨ Potential savings: 2.3 MB
```

---

## Best Practices

1. **Don't Auto-Fix Blindly**: Review every suggestion before removing code
2. **Run Regularly**: Weekly analysis prevents large cleanups
3. **Commit Separately**: Keep knip-driven cleanups in dedicated commits
4. **Document Exceptions**: Add comments for intentional unused exports (public APIs)
5. **Team Communication**: Coordinate with team before removing shared code

---

## Safety Guarantees

### What Knip Is Safe For

✅ Finding unused code
✅ Identifying bloated dependencies
✅ Discovering dead exports
✅ Reducing bundle size

### What Knip Should NOT Do

❌ Run in production environments
❌ Automatically delete files without review
❌ Remove code without understanding context
❌ Replace human judgment

---

## Troubleshooting

### "Too many false positives"

Create `.kniprc.json` with custom ignore patterns

### "Knip is slow"

Use `--no-progress` flag or limit scope:
```bash
npx knip src/components
```

### "Can't find certain imports"

Check your tsconfig.json paths are configured correctly

---

## Resources

- **Official Docs**: https://knip.dev/
- **GitHub**: https://github.com/webpro-nl/knip
- **npm**: https://www.npmjs.com/package/knip

---

## Summary

**Knip helps keep your codebase clean by finding unused:**
- Dependencies
- Exports
- Files

**Remember:**
- 🎯 Use in **staging/development only**
- ⚠️ **Never in production**
- 📊 Review results before acting
- 🔄 Run regularly for best results

---

**Last Updated:** 2025-10-08
**Knip Version:** 5.64.2
**Status:** Installed in devDependencies ✅
