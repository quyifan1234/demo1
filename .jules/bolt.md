## 2025-03-31 - Memoizing relational lookups in list views

**Learning:** In React list views rendering relational items (e.g. API Keys linked to AI Apps via join tables), calculating associated names via per-item `array.filter().map().find()` inside render loops causes $O(N \times M \times A)$ operations every re-render (especially when called multiple times per row). Pre-building a `Map` indexed by parent ID with `useMemo` reduces runtime complexity to $O(A + M)$ map construction and $O(1)$ lookups.

**Action:** When displaying related entity labels in list views, replace inline nested array searches with a memoized `Map` lookup index.
