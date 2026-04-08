# 📱 Mobile-First Class Reference Card

## Quick Navigation
- [Text & Typography](#text--typography)
- [Spacing (Padding & Margin)](#spacing-padding--margin)
- [Layout & Grid](#layout--grid)
- [Sizing](#sizing)
- [Common Patterns](#common-patterns)

---

## Text & Typography

### Font Sizes
```jsx
// Small → Medium → Large → Extra Large
text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl

// Heading sizes
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
  Main Title
</h1>

<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
  Section Title
</h2>

<p className="text-sm sm:text-base md:text-lg leading-relaxed">
  Paragraph text
</p>
```

### Font Weights & Styles
```jsx
font-light sm:font-normal md:font-semibold  // Weight progression
italic sm:not-italic                         // Remove italic on larger screens
uppercase sm:capitalize md:normal-case       // Case variations
tracking-tight sm:tracking-normal lg:tracking-wide  // Letter spacing
```

---

## Spacing (Padding & Margin)

### Padding
```jsx
// Mobile (4px) → Tablet (8px) → Desktop (12px)
p-1 sm:p-2 md:p-3

// Asymmetric padding
px-4 sm:px-6 md:px-8  // Horizontal (left & right)
py-2 sm:py-3 md:py-4  // Vertical (top & bottom)

// Individual sides
pl-2 sm:pl-4 md:pl-6  // Padding-left
pr-2 sm:pr-4 md:pr-6  // Padding-right
pt-1 sm:pt-2 md:pt-3  // Padding-top
pb-1 sm:pb-2 md:pb-3  // Padding-bottom
```

### Margin
```jsx
// Mobile (4px) → Desktop (12px)
m-4 sm:m-6 md:m-8

// Asymmetric margins
mx-4 sm:mx-6 md:mx-8  // Margin left & right
my-2 sm:my-3 md:my-4  // Margin top & bottom

// Common pattern: Divide sections
mb-8 sm:mb-12 md:mb-16  // Margin-bottom for spacing
mt-4 sm:mt-6 md:mt-8    // Margin-top for spacing
```

---

## Layout & Grid

### Flexbox
```jsx
// Stack mobile, side-by-side on desktop
<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
  <div>Left</div>
  <div>Right</div>
</div>

// Center content
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  Content
</div>
```

### Grid (Most Used Pattern)
```jsx
// 1 column mobile → 2 columns tablet → 3 columns desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Responsive grid with different breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  <Item />
</div>
```

### Containers
```jsx
// Max width container with responsive padding
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Content
</div>

// Full width with padding
<div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
  Content
</div>
```

---

## Sizing

### Width
```jsx
// Full width on mobile, auto on desktop
w-full sm:w-auto

// Percentage widths
w-full sm:w-1/2 md:w-1/3 lg:w-1/4

// Fixed widths that respond
w-8 sm:w-10 md:w-12 lg:w-16
```

### Height
```jsx
// Min height responsive
min-h-screen sm:min-h-[600px] md:min-h-[800px]

// Height responsive
h-12 sm:h-16 md:h-20 lg:h-24
```

### Aspect Ratio
```jsx
// Square on mobile, 16:9 on desktop
aspect-square sm:aspect-video

// Video container
aspect-video w-full
```

---

## Common Patterns

### Button
```jsx
<button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-semibold transition-all active:scale-95">
  Click Me
</button>

// Full width mobile, auto desktop
<button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4">
  Full Mobile Button
</button>
```

### Card
```jsx
<div className="bg-glass-gradient rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border border-gold/30 shadow-lg sm:shadow-xl">
  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">
    Card Title
  </h3>
  <p className="text-sm sm:text-base text-gray-300">
    Card content
  </p>
</div>
```

### Navigation Item
```jsx
<Link 
  to="/path" 
  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base rounded-lg hover:bg-gold/10 transition-all"
>
  Nav Item
</Link>
```

### Hero Section
```jsx
<section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-screen flex items-center justify-center pt-20 sm:pt-28 px-4 sm:px-6 md:px-8">
  <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
      Big Title
    </h1>
    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">
      Subtitle text
    </p>
  </div>
</section>
```

### Form Input
```jsx
<input 
  type="text" 
  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-2"
  placeholder="Enter text..."
/>
```

### Icon with Text
```jsx
<div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
  <Icon className="w-5 sm:w-6 h-5 sm:h-6" />
  <span>Text Label</span>
</div>
```

---

## Display Classes

### Visibility
```jsx
// Hide on mobile, show on desktop
hidden md:block

// Show on mobile, hide on desktop
block md:hidden

// Responsive visibility
hidden sm:block        // Hide mobile, show sm+
block lg:hidden        // Show mobile-md, hide lg+
```

### Responsive Display
```jsx
// Start as block, change to flex/grid at breakpoint
block sm:flex          // Stack on mobile, flex on tablet+
flex-col sm:flex-row   // Column mobile, row on desktop
grid-cols-1 sm:grid-cols-2  // 1 column mobile, 2 on tablet+
```

---

## Touch-Friendly Sizes

### Buttons
```jsx
// Minimum 44px height for mobile
<button className="min-h-[44px] min-w-[44px] px-4 py-2 sm:p-3">
  Tap Me
</button>
```

### Links
```jsx
// Ensure tappable area
<a href="#" className="px-3 py-2 min-h-[44px] inline-flex items-center">
  Link
</a>
```

### Input Fields
```jsx
// Large touch target
<input 
  type="text" 
  className="px-4 py-3 sm:py-3 text-base min-h-[48px] rounded-lg"
/>
```

---

## Performance Tips

✅ **DO**
- Start with mobile styles, add breakpoints for larger screens
- Use standard Tailwind breakpoints (sm, md, lg)
- Group related responsive classes together
- Test on real devices

❌ **DON'T**
- Add desktop styles first then override with mobile (harder to maintain)
- Create too many custom breakpoints
- Mix mobile-first with desktop-first approaches
- Assume desktop behavior works on mobile

---

## Testing Checklist

When adding responsive classes:
- [ ] Tested on xs (320px)
- [ ] Tested on sm (640px)  
- [ ] Tested on md (768px)
- [ ] Tested on lg (1024px)
- [ ] Tested on xl (1280px)
- [ ] Tested on real mobile device
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable at all sizes
- [ ] No horizontal scrolling on mobile
- [ ] Buttons are easy to tap

---

## Useful Links

- **Tailwind Responsive**: https://tailwindcss.com/docs/responsive-design
- **Font Scaling**: https://www.smashingmagazine.com/2021/08/responsive-typography-challenges/
- **Mobile-First**: https://www.freecodecamp.org/news/mobile-first-css/
