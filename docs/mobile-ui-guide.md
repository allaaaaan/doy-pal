# Mobile UI Guide

This guide documents Doy-Pal's mobile-first design system, UI components, and user experience patterns for behavioral tracking on mobile devices.

## Overview

Doy-Pal is designed as a mobile-first Progressive Web App (PWA) with native-like user experience. The interface prioritizes touch interactions, readability, and accessibility on mobile devices while maintaining desktop compatibility.

## Design Philosophy

### Mobile-First Approach

- **Touch-Optimized**: Minimum 44px touch targets for accessibility
- **Thumb-Friendly**: Key actions within comfortable reach
- **Swipe Gestures**: Natural mobile navigation patterns
- **Safe Areas**: Proper handling of device notches and system UI

### Visual Design

- **Card-Based Layout**: Modern, clean card interfaces
- **Gradient Backgrounds**: Subtle visual hierarchy
- **Consistent Spacing**: 16px base unit system
- **Color-Coded Elements**: Point values and status indicators

## Core Components

### 1. FloatingActionButton

Primary action button for quick event creation.

```typescript
// components/FloatingActionButton.tsx
<button className="fixed bottom-safe-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors z-50">
  <PlusIcon className="h-6 w-6" />
</button>
```

**Features**:

- Fixed positioning with safe area consideration
- Smooth hover transitions
- High z-index for overlay visibility
- Accessible focus states

### 2. EventItem

Card-based event display with swipe actions.

```typescript
// app/home/EventItem.tsx
const EventItem = ({ event }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 mx-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {event.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {event.description}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPointsBadgeColor(
            event.points
          )}`}
        >
          {event.points} pts
        </span>
      </div>
    </div>

    {/* Template indicator */}
    {event.templates && (
      <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
        <SparklesIcon className="h-3 w-3" />
        <span>{event.templates.name}</span>
      </div>
    )}

    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
      <span>{formatDate(event.timestamp)}</span>
      <span>{event.day_of_week}</span>
    </div>
  </div>
);
```

**Features**:

- Responsive card layout
- Dark mode support
- Template indicators with icons
- Color-coded point badges
- Accessible text contrast

### 3. TemplateSelector

Smart template selection with search and preview.

```typescript
// components/TemplateSelector.tsx
const TemplateSelector = ({ onTemplateSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState([]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {template.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getPointsBadgeColor(
                    template.default_points
                  )}`}
                >
                  {template.default_points}
                </span>
                <span className="text-xs text-gray-500">
                  {template.frequency}x
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Features**:

- Real-time search filtering
- Usage frequency indicators
- Touch-optimized selection
- Responsive grid layout
- Keyboard navigation support

### 4. ConditionalMobileNav

Adaptive navigation based on screen size.

```typescript
// components/ConditionalMobileNav.tsx
const ConditionalMobileNav = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  return <MobileNav />;
};
```

**Features**:

- Responsive visibility
- Screen size detection
- Dynamic navigation switching
- Performance optimized

### 5. MobileNav

Bottom navigation for mobile devices.

```typescript
// components/MobileNav.tsx
const MobileNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
    <div className="flex justify-around items-center py-2">
      <Link href="/home" className="flex flex-col items-center p-2">
        <HomeIcon className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link href="/event" className="flex flex-col items-center p-2">
        <PlusIcon className="h-5 w-5" />
        <span className="text-xs mt-1">Add</span>
      </Link>
      <Link href="/offline" className="flex flex-col items-center p-2">
        <Cog6ToothIcon className="h-5 w-5" />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  </nav>
);
```

**Features**:

- Fixed bottom positioning
- Safe area padding
- Icon and text labels
- Dark mode support
- Touch-optimized spacing

## Layout Patterns

### 1. Safe Area Handling

Proper handling of device notches and system UI.

```css
/* globals.css */
.mobile-safe-top {
  padding-top: env(safe-area-inset-top);
}

.mobile-safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-safe-6 {
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
}
```

### 2. Responsive Grid System

Mobile-first responsive layouts.

```typescript
// Grid patterns used throughout the app
const gridClasses = {
  mobile: "grid-cols-1", // Single column on mobile
  tablet: "md:grid-cols-2", // Two columns on tablet
  desktop: "lg:grid-cols-3", // Three columns on desktop
  full: "grid-cols-1 gap-4", // Full width with consistent gaps
};
```

### 3. Card-Based Layouts

Consistent card styling across components.

```typescript
// Reusable card classes
const cardClasses = {
  base: "bg-white dark:bg-gray-800 rounded-lg shadow-md",
  padding: "p-4",
  margin: "mb-4 mx-4",
  hover: "hover:shadow-lg transition-shadow",
  full: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 mx-4 hover:shadow-lg transition-shadow",
};
```

## Color System

### Point Value Colors

Dynamic color coding based on point values.

```typescript
// Point badge color system
const getPointsBadgeColor = (points: number) => {
  if (points >= 5)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (points >= 3)
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (points >= 1)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
};
```

### AI Confidence Colors

Template confidence indicators.

```typescript
// AI confidence color coding
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
  if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};
```

### Status Colors

System status and feedback colors.

```typescript
// Status color system
const statusColors = {
  success: "bg-green-100 border-green-400 text-green-700",
  error: "bg-red-100 border-red-400 text-red-700",
  warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
  info: "bg-blue-100 border-blue-400 text-blue-700",
};
```

## Typography

### Font Hierarchy

Consistent typography scaling.

```typescript
// Typography scale
const typography = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-medium",
  body: "text-base",
  small: "text-sm",
  tiny: "text-xs",
};
```

### Responsive Text

Text that adapts to screen size.

```typescript
// Responsive typography
const responsiveText = {
  title: "text-xl md:text-2xl font-bold",
  subtitle: "text-lg md:text-xl font-semibold",
  body: "text-sm md:text-base",
  caption: "text-xs md:text-sm",
};
```

## Dark Mode Support

### Theme Implementation

Comprehensive dark mode with system preference detection.

```typescript
// components/ThemeProviderWrapper.tsx
const ThemeProviderWrapper = ({ children }) => {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return children;
};
```

### Dark Mode Classes

Consistent dark mode styling patterns.

```typescript
// Dark mode class patterns
const darkModeClasses = {
  background: "bg-white dark:bg-gray-900",
  card: "bg-white dark:bg-gray-800",
  text: "text-gray-900 dark:text-white",
  textSecondary: "text-gray-600 dark:text-gray-300",
  border: "border-gray-200 dark:border-gray-700",
  input: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
};
```

## Animation and Transitions

### Smooth Transitions

Performance-optimized animations.

```css
/* globals.css */
.transition-smooth {
  transition: all 0.2s ease-in-out;
}

.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
```

### Loading States

Skeleton screens and loading indicators.

```typescript
// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2"></div>
    <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4"></div>
  </div>
);
```

## Form Controls

### Mobile-Optimized Inputs

Touch-friendly form controls.

```typescript
// Mobile input component
const MobileInput = ({ label, type, value, onChange, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      {...props}
    />
  </div>
);
```

### Custom Date/Time Pickers

Native mobile date/time selection.

```typescript
// Mobile date picker
const MobileDatePicker = ({ value, onChange }) => (
  <input
    type="datetime-local"
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    style={{
      colorScheme: "light dark", // Enable native dark mode
    }}
  />
);
```

## Touch Interactions

### Swipe Gestures

Mobile-native swipe actions.

```typescript
// Swipe gesture handling
const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
```

### Haptic Feedback

Native haptic feedback for touch interactions.

```typescript
// Haptic feedback utility
const hapticFeedback = {
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  },
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  },
};
```

## Performance Optimizations

### Lazy Loading

Component lazy loading for performance.

```typescript
// Lazy loaded components
const LazyEventHistory = lazy(() => import("./EventHistory"));
const LazyTemplateSelector = lazy(() => import("./TemplateSelector"));

// Usage with Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <LazyEventHistory />
</Suspense>;
```

### Image Optimization

Responsive image handling.

```typescript
// Optimized image component
const OptimizedImage = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    decoding="async"
    style={{
      maxWidth: "100%",
      height: "auto",
    }}
  />
);
```

## Accessibility

### ARIA Labels

Comprehensive accessibility support.

```typescript
// Accessible button component
const AccessibleButton = ({ children, onClick, ariaLabel, ...props }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    {...props}
  >
    {children}
  </button>
);
```

### Screen Reader Support

Proper semantic HTML and ARIA attributes.

```typescript
// Screen reader friendly navigation
const ScreenReaderNav = () => (
  <nav aria-label="Main navigation">
    <ul role="list">
      <li>
        <Link href="/home" aria-current="page">
          <span className="sr-only">Navigate to </span>
          Home
        </Link>
      </li>
    </ul>
  </nav>
);
```

## Progressive Web App Features

### App Manifest

PWA configuration for mobile installation.

```json
// public/manifest.json
{
  "name": "Doy-Pal",
  "short_name": "Doy-Pal",
  "description": "AI-powered child behavior tracking",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

Offline capabilities and caching.

```typescript
// Service worker registration
const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  }
};
```

## Best Practices

### Mobile Performance

1. **Optimize Images**: Use appropriate formats and sizes
2. **Lazy Loading**: Load content as needed
3. **Bundle Splitting**: Code split for faster initial load
4. **Caching**: Implement effective caching strategies

### User Experience

1. **Touch Targets**: Minimum 44px for accessibility
2. **Feedback**: Immediate visual feedback for actions
3. **Loading States**: Show progress for async operations
4. **Error Handling**: Clear, actionable error messages

### Responsive Design

1. **Mobile First**: Design for mobile, enhance for desktop
2. **Flexible Layouts**: Use CSS Grid and Flexbox
3. **Breakpoints**: Consistent breakpoint system
4. **Testing**: Test on actual devices

## Testing

### Mobile Testing

```typescript
// Mobile-specific tests
describe("Mobile UI", () => {
  it("should handle touch interactions", () => {
    // Touch event testing
  });

  it("should display properly on mobile viewports", () => {
    // Viewport testing
  });

  it("should support swipe gestures", () => {
    // Gesture testing
  });
});
```

### Accessibility Testing

```typescript
// Accessibility testing
import { axe } from "jest-axe";

describe("Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

_This mobile UI guide covers the complete mobile-first design system and provides comprehensive guidance for maintaining consistent mobile user experience across all features._
