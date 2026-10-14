## 2025-05-18 - Localized and Context-Rich ARIA Labels for Dynamic Tag Badges

**Learning:** Icon-only removal buttons inside badge tags should include both the action and the specific tag text in localized `aria-label`s (e.g. `aria-label={`移除标签 ${t}`}`) rather than generic English text (`aria-label="Remove tag"`).
**Action:** When creating or editing tag lists or badge elements with close buttons, ensure `aria-label` includes the item name to provide precise screen reader context.
