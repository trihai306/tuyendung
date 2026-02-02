---
trigger: always_on
glob: frontend/**/*.{tsx,jsx,css}
description: Quy tắc responsive design với TailwindCSS v4 - mobile-first approach
---

# Rules: Responsive Design với TailwindCSS v4

## 1. Breakpoint Standards

### TailwindCSS v4 Breakpoints
```css
/* Mobile First Approach */
@theme {
  --breakpoint-sm: 640px;   /* Small phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large screens */
}
```

### Usage Pattern
```tsx
// BẮT BUỘC: Viết mobile-first
<div className="
  px-4                    // Mobile: padding nhỏ
  md:px-6                 // Tablet: padding trung bình
  lg:px-8                 // Desktop: padding lớn
">

// Container responsive
<div className="
  w-full                  // Mobile: full width
  max-w-sm               // Mobile: max 384px
  md:max-w-xl            // Tablet: max 576px
  lg:max-w-4xl           // Desktop: max 896px
">
```

## 2. Layout Patterns

### Grid Responsive
```tsx
// Cards grid
<div className="
  grid
  grid-cols-1           // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-3        // Desktop: 3 columns
  xl:grid-cols-4        // Large: 4 columns
  gap-4 md:gap-6 lg:gap-8
">

// Sidebar layout
<div className="
  flex
  flex-col              // Mobile: stack vertical
  lg:flex-row           // Desktop: horizontal
">
  <aside className="w-full lg:w-64 lg:shrink-0">
  <main className="flex-1">
</div>
```

### Typography Responsive
```tsx
// Headings
<h1 className="
  text-2xl              // Mobile: 24px
  md:text-3xl           // Tablet: 30px
  lg:text-4xl           // Desktop: 36px
  font-bold
">

// Body text
<p className="
  text-sm               // Mobile: 14px
  md:text-base          // Tablet: 16px
  leading-relaxed
">
```

## 3. Component Patterns

### Navigation
```tsx
// Mobile menu toggle, desktop visible
<nav>
  {/* Mobile menu button */}
  <button className="lg:hidden">
    <MenuIcon />
  </button>
  
  {/* Desktop nav items */}
  <div className="hidden lg:flex space-x-4">
    {navItems}
  </div>
</nav>
```

### Cards
```tsx
<div className="
  p-4 md:p-6            // Padding responsive
  rounded-lg md:rounded-xl
  shadow-sm md:shadow-md lg:shadow-lg
">
```

### Forms
```tsx
<form className="space-y-4 md:space-y-6">
  {/* Form fields stack or grid */}
  <div className="
    grid grid-cols-1
    md:grid-cols-2
    gap-4
  ">
    <input className="w-full" />
    <input className="w-full" />
  </div>
  
  {/* Button responsive */}
  <button className="
    w-full              // Mobile: full width
    md:w-auto           // Desktop: auto width
    px-4 md:px-6
    py-2 md:py-3
  ">
</form>
```

## 4. Image Responsive

```tsx
// Aspect ratio container
<div className="
  aspect-video          // 16:9 ratio
  md:aspect-[4/3]       // Tablet: 4:3
  lg:aspect-[16/9]      // Desktop: 16:9
">
  <img className="w-full h-full object-cover" />
</div>

// Responsive image sizes
<img
  className="
    w-full h-48         // Mobile
    md:h-56             // Tablet
    lg:h-64             // Desktop
    object-cover rounded-lg
  "
/>
```

## 5. Spacing System

```tsx
// Consistent spacing scale
const spacingClasses = {
  section: 'py-8 md:py-12 lg:py-16',
  container: 'px-4 md:px-6 lg:px-8',
  stack: 'space-y-4 md:space-y-6 lg:space-y-8',
  inline: 'space-x-2 md:space-x-4',
};
```

## 6. Hidden/Show Utilities

```tsx
// Show on specific breakpoints
<div className="hidden md:block">     // Hide mobile, show tablet+
<div className="md:hidden">           // Show mobile only
<div className="hidden lg:flex">      // Hide until desktop
<div className="block md:hidden lg:block"> // Hide only tablet
```

## 7. Testing Checklist

```
[ ] Mobile (375px): All content visible, no horizontal scroll
[ ] Tablet (768px): Proper grid columns, navigation works
[ ] Desktop (1024px): Full layout, hover states work
[ ] Large (1440px): Max-width containers centered
[ ] Touch targets: Minimum 44x44px on mobile
[ ] Text readable: Min 14px on mobile
```

## 8. Common Mistakes to Avoid

```tsx
// ❌ KHÔNG làm
<div className="lg:px-4 px-8">        // Desktop-first
<div className="md:flex-col flex-row"> // Backwards

// ✅ LÀM ĐÚNG
<div className="px-4 lg:px-8">        // Mobile-first
<div className="flex-col md:flex-row"> // Mobile-first
```
