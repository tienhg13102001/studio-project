---
applyTo: "**"
---

## Styling

Before writing any styles or Tailwind classes, always reference the design tokens defined in `src/index.css` first.

- Use CSS variables (`--primary`, `--background`, `--foreground`, `--border`, `--muted`, etc.) via Tailwind semantic classes (`bg-primary`, `text-foreground`, `border-border`, etc.) instead of hardcoded colors
- Font families are `--font-sans` (Outfit) and `--font-heading` (Lora) — use `font-sans` / `font-heading`
- Border radius tokens: `--radius-sm` → `--radius-4xl` — prefer `rounded-lg`, `rounded-xl`, etc.
- Dark mode is handled via the `.dark` class — always check both `:root` and `.dark` token values before styling
- Brand yellow is mapped to `--primary` — use `bg-primary`, `text-primary` instead of hardcoded `bg-yellow-*`
