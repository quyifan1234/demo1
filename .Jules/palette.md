## 2025-05-18 - Localized ARIA Labels for Tag Removal & Dynamic Toggle Buttons

**Learning:** Interactive tag badges and custom pill buttons used for multi-selection often lack localized `aria-label` or `aria-pressed` states. Screen reader users need explicit element context (e.g., "移除标签 React" instead of generic English "Remove tag") and clear toggle state feedback (`aria-pressed="true|false"`).
**Action:** Always provide localized, context-aware `aria-label={`移除标签 ${tag}`}` for chip removal controls and `aria-pressed` for custom toggle options.
