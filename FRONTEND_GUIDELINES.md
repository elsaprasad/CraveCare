# FRONTEND_GUIDELINES.md — CraveCare

**Style Direction:** Modern, Warm, and Minimal (The "Big Sister" aesthetic).

**Brand Colors:** Soft Corals, Warm Oranges, and Creamy Neutrals.

**Target Audience:** Gen Z female students living in hostels/PGs.

---

## 1. Design Principles

1. **Compassionate Clarity:** Use warm language and soft edges to reduce stress during health-related tracking.
2. **Thumb-First Efficiency:** Since hostel cooking is often a one-handed operation (holding a kettle in the other), all major actions must be within reach of the thumb.
3. **Contextual Intelligence:** Show only what is needed based on the current cycle phase or appliance selection.
4. **Low Cognitive Load:** Use simple icons and short lists to keep the interface "scannable."

---

## 2. Design Tokens

### Color Palette

| Level | Primary (Coral-Warm) | Neutral (Sand-Cream) | Semantic (Alerts) |
| --- | --- | --- | --- |
| **50** | `#FFF5F5` | `#FAF9F6` | **Error:** `#FEF2F2` |
| **100** | `#FFE3E3` | `#F3F2EE` | **Success:** `#F0FDF4` |
| **500 (Base)** | `#FF7F50` (Coral) | `#D6D3D1` | **Warning:** `#FFFBEB` |
| **700** | `#E66A45` | `#78716C` | **Info:** `#EFF6FF` |
| **900** | `#B84B2B` | `#1C1917` | **Cycle High:** `#881337` |

### Typography (Inter Font Family)

* **Body:** `Inter, system-ui, sans-serif`
* **Scale:**
* `text-xs`: 0.75rem (12px) | Leading: 1rem
* `text-base`: 1rem (16px) | Leading: 1.5rem
* `text-xl`: 1.25rem (20px) | Leading: 1.75rem
* `text-4xl`: 2.25rem (36px) | Leading: 2.5rem


* **Weights:** Normal (400), Medium (500), SemiBold (600).

### Spacing & Borders

* **Scale:** 0 (0px) to 16 (64px) in 4px increments.
* **Radius:** `rounded-lg` (8px) for inputs, `rounded-2xl` (16px) for cards, `rounded-full` for buttons.
* **Shadow:** `shadow-sm` (subtle depth), `shadow-lg` (modals).

---

## 3. Layout System

* **Mobile-First Grid:** 4-column grid with 16px margins.
* **Breakpoints:** * `sm`: 640px (Phones)
* `md`: 768px (Tablets)



```html
<div class="min-h-screen bg-neutral-50 px-4 pt-6 pb-24 max-w-md mx-auto">
  </div>

```

---

## 4. Component Library (Tailwind CSS)

### Buttons

```html
<button class="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-4 px-6 rounded-full transition-all active:scale-95 shadow-md h-[56px]">
  Generate Recipe
</button>

<button class="border-2 border-coral-500 text-coral-500 font-medium py-2 px-4 rounded-full text-sm h-[40px]">
  Edit Toolkit
</button>

```

### Input Fields

```html
<div class="flex flex-col gap-1.5">
  <label class="text-sm font-medium text-neutral-700">Next Period Date</label>
  <input type="date" class="w-full p-4 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none disabled:bg-neutral-100 placeholder:text-neutral-400" />
  <p class="text-xs text-red-500 hidden">Required field</p>
</div>

```

### Cards & Alerts

```html
<div class="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center gap-4">
  <div class="bg-rose-500 h-12 w-12 rounded-full flex items-center justify-center text-white text-xl">🩸</div>
  <div>
    <h3 class="font-bold text-rose-900">Menstrual Phase</h3>
    <p class="text-sm text-rose-700">Try warm ginger tea for cramps.</p>
  </div>
</div>

```

---

## 5. Accessibility Requirements (WCAG AA)

* **Contrast:** Minimum contrast ratio of 4.5:1 for text.
* **Touch Targets:** Minimum **44x44px** for all clickable elements.
* **Labels:** Every input must have an associated `<label>` or `aria-label`.
* **Color-Blindness:** Do not use color alone to convey meaning (e.g., add an icon to error messages).

---

## 6. Animation Guidelines

* **Duration:** 200ms (standard), 300ms (page transitions).
* **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Ease-in-out).
* **Reduced Motion:** Use `motion-safe:` utilities to disable animations for users with vestibular sensitivities.

---

## 7. Icon System

* **Library:** [Lucide Icons](https://lucide.dev/)
* **Sizes:** * Standard: 24px (for navigation/actions)
* Small: 16px (for inline labels)


* **Weight:** Medium (2px stroke).

---

## 8. Responsive Rules

* **Mobile-First:** Code for the smallest screen (360px width) and scale up using `md:` prefix.
* **Bottom Navigation:** Fixed to the bottom on mobile for easy reach.
* **Scroll:** Use `overscroll-behavior-y: contain` to prevent "pull-to-refresh" accidentally clearing unsaved input.

---

## 9. Browser Support

* Mobile Chrome (Latest 3 versions)
* Mobile Safari (iOS 15+)
* Firefox Mobile (Latest)

**Next Step:** Your design system is ready. Would you like me to provide the **Flutter Widget equivalents** for these Tailwind components so you can build them in Dart?
