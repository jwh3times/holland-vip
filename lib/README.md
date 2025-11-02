# Lib Directory

Utility functions, helpers, and shared code used throughout the application.

## 📁 Contents

### `utils.ts`

Core utility functions for the application.

**Functions:**

- `cn(...inputs)` - Merges Tailwind CSS classes intelligently using `clsx` and `tailwind-merge`
  - Handles conditional classes
  - Resolves conflicting Tailwind utilities
  - Used throughout components for dynamic styling

**Usage:**

```typescript
import { cn } from "@/lib/utils";

// Merge classes with conditionals
<div className={cn(
  "base-class",
  isActive && "active-class",
  "hover:opacity-80"
)} />
```

## 🔧 Purpose

This directory centralizes:

- **Utility functions** - Reusable helpers used across components
- **Type definitions** - Shared TypeScript interfaces and types
- **Constants** - App-wide configuration values
- **Helpers** - Business logic separate from UI components
- **API utilities** - Data fetching and transformation functions

## 📝 Best Practices

- Keep utilities pure and side-effect free
- Use TypeScript for type safety
- Write small, focused, single-purpose functions
- Document complex utilities with JSDoc comments
- Add unit tests for critical utility functions

## 🎯 Common Utilities to Add

As the project grows, consider adding:

- `formatDate.ts` - Date formatting helpers
- `validation.ts` - Form validation utilities
- `api.ts` - API client configuration
- `constants.ts` - App-wide constants
- `types.ts` - Shared TypeScript types
