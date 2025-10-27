# Component Patterns

Reusable component patterns for Armchair Sleuths.

## 1. Animated Card Pattern

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.1 }}
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
>
  <div className="
    bg-noir-charcoal
    border-2 border-noir-fog hover:border-detective-gold
    rounded-lg p-6
    shadow-base
    transition-colors duration-200
  ">
    {children}
  </div>
</motion.div>
```

## 2. Modal Overlay Pattern

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-noir-deepBlack/95 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-noir-charcoal border-2 border-detective-gold rounded-xl p-6 max-w-2xl w-full">
          {children}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

## 3. Loading Skeleton Pattern

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-noir-gunmetal rounded w-3/4"></div>
  <div className="h-4 bg-noir-gunmetal rounded w-1/2"></div>
  <div className="h-32 bg-noir-gunmetal rounded"></div>
</div>
```

## 4. Toast Notification Pattern

```tsx
<motion.div
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 100 }}
  className="
    fixed top-4 right-4 z-50
    bg-noir-charcoal border-2 border-detective-gold
    rounded-lg p-4 shadow-xl
    min-w-72
  "
>
  <div className="flex items-start gap-3">
    <div className="text-2xl">{icon}</div>
    <div className="flex-1">
      <h3 className="font-semibold text-detective-gold">{title}</h3>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
    <button onClick={onClose} className="text-text-muted hover:text-text-primary">
      <X size={20} />
    </button>
  </div>
</motion.div>
```

## 5. Progressive Image Loading Pattern

```tsx
const [imageLoaded, setImageLoaded] = useState(false);

<div className="relative">
  {!imageLoaded && <LoadingSkeleton />}
  <img
    src={imageUrl}
    onLoad={() => setImageLoaded(true)}
    className={cn(
      "transition-opacity duration-300",
      imageLoaded ? "opacity-100" : "opacity-0"
    )}
  />
</div>
```

## 6. Responsive Grid Pattern

```tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4 sm:gap-6 lg:gap-8
">
  {items.map(item => (
    <div key={item.id}>{/* Item */}</div>
  ))}
</div>
```

## 7. Focus Trap Pattern (for Modals)

```tsx
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements && focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus();
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

## 8. Stagger Animation Pattern

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {/* Item */}
    </motion.div>
  ))}
</motion.div>
```
