# Animation Library

Framer Motion animations for detective game.

## Entrance Animations

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### Slide Up
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
```

### Scale Pop
```tsx
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3 }}
```

## Interactive Animations

### Card Hover
```tsx
whileHover={{ scale: 1.02, y: -4 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.2 }}
```

### Button Press
```tsx
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.1 }}
```

## Exit Animations

```tsx
exit={{ opacity: 0, scale: 0.9, y: 20 }}
transition={{ duration: 0.3 }}
```

## Page Transitions

```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
```

## Typing Effect

```tsx
const [displayedText, setDisplayedText] = useState('');
const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
  if (currentIndex < fullText.length) {
    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + fullText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, 30); // 30ms per character
    return () => clearTimeout(timer);
  }
}, [currentIndex, fullText]);
```

## Performance

- Target: 60fps
- Use `will-change: transform` for animated elements
- Avoid animating `width`, `height` - use `transform: scale()` instead
- Use `AnimatePresence` for exit animations
- Consider `prefers-reduced-motion` for accessibility
