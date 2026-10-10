## 2025-05-18 - Avoid Duplicate Native Tooltips when using Custom Radix TooltipTriggers

**Learning:** When replacing browser native `title` attribute tooltips with custom Radix UI Tooltip components, retaining `title={title}` on the `<button>` inside `<TooltipTrigger asChild>` causes browsers to show redundant native tooltips over the custom styled UI tooltip.
**Action:** Remove `title={title}` from trigger elements when wrapping them in custom UI Tooltip triggers while retaining `aria-label={title}` for screen reader accessibility.
