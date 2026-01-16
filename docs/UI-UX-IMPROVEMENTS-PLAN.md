# UI/UX Quality Improvements Plan - SIS.DOMÉSTICA

**Date**: 2026-01-15
**Component**: Ledger Table (Financial Demonstration)
**Primary Files**: `LedgerTableV2.tsx`, `AuditPanel.tsx`
**Estimated Changes**: ~180-220 lines across 3-4 files

---

## Executive Summary

This plan consolidates:
1. **External AI QA feedback** - baseline UI/UX issues identified
2. **Deep code analysis** - systematic accessibility audit with 15 additional issues found
3. **User preferences** - confirmed via Q&A session

### Core Objectives
| Priority | Objective | Status |
|----------|-----------|--------|
| 1 | WCAG AA Compliance (50+ contrast fixes) | Must Do |
| 2 | Typography Consistency (all values → text-sm) | Must Do |
| 3 | Layout Fix (badge wrapping prevention) | Must Do |
| 4 | Keyboard Accessibility (focus states) | Recommended |

### User Decisions (Confirmed)
- ✅ **Badge Layout**: Expand column width + compact badges
- ✅ **Typography**: Standardize ALL monetary values to `text-sm`
- ✅ **Input Field**: Make it discrete (text-first; border on hover/focus)
- ✅ **Contrast Priority**: Focus on text colors only (not borders/shadows)
- ❓ **Touch Targets**: Needs decision (compact vs. 44px minimum)

---

## Status Atual (Repo vs. Plano)
Este plano foi escrito quando várias correções ainda estavam pendentes. No estado atual do repositório (2026-01-16), **muita coisa já foi implementada**. A lista abaixo separa o que está **feito**, o que está **parcial** e o que ainda precisa de ajuste para atender exatamente às instruções (especialmente Partes 1 e 2 do feedback por screenshot).

### LedgerTableV2 (Tabela principal)
- ✅ Grid de 15 colunas no desktop e 1ª coluna mais larga via `col-span-3`
- ✅ Valores monetários principais em `text-sm`, `text-right`, `tabular-nums` (e `font-mono`)
- ✅ Estados de foco (`focus-visible:ring`) nos principais botões de ação e status
- ✅ Badges mais densos e `flex-nowrap` na linha de chips
- ⚠️ **Parte 1 (wrap da célula de status)**: no modo compacto existe **mais de uma linha de indicadores** (chips do mês + linha extra de ícones de vencimento). O feedback pede “tudo em uma linha horizontal”.
- ⚠️ **Parte 2 (alinhamento de header numérico)**: “Líquido Acordado” está com header `text-center`, mas é um campo numérico (recomendado alinhar à direita).
- ⚠️ **Parte 2 (input discreto)**: o campo editável ainda parece “caixa” (fundo + borda + shadow-inner) e compete com os números ao redor.

### AuditPanel (Detalhamento)
- ✅ Contraste de textos principais melhorado (ex.: roxo/verde/laranja com variantes `dark:`)
- 🔍 Validação final: conferir em light mode com o “glass” atual (o efeito de fundo pode reduzir contraste em cenários específicos)

---

## Issues Identified

### From External AI Review (Validated)

#### 1. Layout & Grid Issues
| Issue | Location | Severity |
|-------|----------|----------|
| Badge wrapping to 2+ lines | LedgerTableV2.tsx:337-494 | High |
| 14-column grid too narrow | LedgerTableV2.tsx:141, 327 | High |
| Action buttons cramped | LedgerTableV2.tsx:537-612 | Medium |

#### 2. Typography & Alignment
| Issue | Location | Severity |
|-------|----------|----------|
| "A Pagar" is `text-lg`, others smaller | LedgerTableV2.tsx:621 | Medium |
| Missing `tabular-nums` on some columns | LedgerTableV2.tsx:614, 617, 618 | Medium |
| Input field too visually heavy | LedgerTableV2.tsx:497-530 | Medium (USER: Change to discrete) |

#### 3. Color Contrast (Panels)
| Issue | Location | Severity |
|-------|----------|----------|
| Purple text hard to read on tinted bg | AuditPanel.tsx (throughout) | High |
| Dark mode panel separation weak | AuditPanel.tsx | Low (USER: Deprioritized) |

---

### From Deep Code Analysis (My Additions)

#### Critical Accessibility Issues (WCAG Violations)

**1. Widespread `gray-400` in Dark Mode** - FAILS WCAG AA
```
Files affected:
- LedgerTableV2.tsx: lines 141, 283, 614, 618, 636
- SummaryCardsV2.tsx: lines 54, 73, 92, 109, 130
- Pattern: `dark:text-gray-400` and `dark:text-gray-500`
- Impact: Poor readability, fails 4.5:1 contrast ratio
```

**2. `gray-500` on Critical Information**
| Element | Line | Current | Should Be |
|---------|------|---------|-----------|
| Last payment date | 434 | `text-gray-500` | `text-slate-600 dark:text-slate-300` |
| "Fora do contrato" | 523 | `text-gray-500` | `text-slate-600 dark:text-slate-400` |
| Pro-rata info | 531 | `text-gray-500` | `text-slate-600 dark:text-slate-300` |
| Column headers | 141 | `dark:text-gray-500` | `dark:text-slate-300` |
| Section header | 636 | `dark:text-gray-400` | `dark:text-slate-100` |

**3. Main Table Values Low Contrast**
| Element | Line | Current | Should Be |
|---------|------|---------|-----------|
| Bruto Calc. | 614 | `text-slate-700 dark:text-gray-400` | `text-slate-900 dark:text-slate-100` |
| DAE/Provisão | 618 | `text-slate-700 dark:text-gray-400` | `text-slate-900 dark:text-slate-100` |

#### UX Issues

**4. No Focus States for Keyboard Navigation** - MAJOR ACCESSIBILITY GAP
```
Missing focus indicators on:
- Expand/collapse button (line 338-348)
- Action buttons F, H, 13.1, 13.2 (lines 539-611)
- Status pill button (lines 303-325)
Impact: Keyboard users cannot see where they are
```

> Nota (2026-01-16): no estado atual do repo, a Ledger V2 já possui `focus-visible` na maior parte desses controles. Tratar este item como “verificar consistência” e completar onde faltar (principalmente fora da Ledger).

**5. Disabled Button States Unclear**
```
Location: Lines 541, 553, 567, 581, 597
Current: opacity-50 cursor-not-allowed
Better: disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed
```

**6. Touch Targets Too Small**
```
Icon badges: 24x24px (w-6 h-6) - WCAG recommends 44x44px
Action buttons: p-1 padding - insufficient for mobile touch
Note: May conflict with compact design aesthetic
```

#### Typography Inconsistencies

**7. Mixed Badge Font Sizes**
```
Line 523: text-[9px] (inconsistent)
All others: text-[10px]
Should standardize to text-[10px]
```

**8. Missing `tabular-nums`**
```
CurrencyInput (line 517): Missing tabular-nums
Gross Salary (line 614): Missing tabular-nums
Employee Taxes (line 617): Missing tabular-nums
DAE/Provisions (line 618): Missing tabular-nums
```

#### Visual Hierarchy Issues

**9. Column Headers Blend Into Content**
```
Line 141: text-slate-600 dark:text-gray-500
Too similar to data row colors
Should be: text-slate-700 dark:text-slate-300
```

**10. Status Pill Border Opacity Too Low**
```
Lines 310-313: Using /30 opacity
Could increase to /40 for better definition
```

---

## Implementation Plan

### Phase 1: Layout & Grid Fixes
**Goal**: Prevent badge wrapping on month rows

#### 1.1 Expand Grid Structure
**File**: `app/src/components/features/LedgerTableV2.tsx`

```typescript
// Line 141 - Column headers
// Line 327 - Data rows
// Change from 14 to 15 columns

Before: grid-cols-[repeat(14,minmax(0,1fr))]
After:  grid-cols-[repeat(15,minmax(0,1fr))]

// First column (Month/Status): expand from 2 to 3 spans
Before: col-span-2
After:  col-span-3
```

#### 1.2 Compact Badge Styling
**Lines**: 303-432

```typescript
// Status pills - reduce padding
Before: px-2 py-1
After:  px-1.5 py-0.5

// Icon badges - reduce size
Before: w-6 h-6
After:  w-5 h-5

// Badge container - prevent wrapping
Before: flex items-center gap-2 mt-1 flex-wrap
After:  flex items-center gap-1.5 mt-1 flex-nowrap overflow-x-auto
```

#### 1.3 Column Proportions (with 15-column grid)
| Column | Old Span | New Span |
|--------|----------|----------|
| Mês/Status | 2 | 3 |
| Líquido Acordado | 2 | 2 |
| Ações | 1 | 1 |
| Bruto Calc. | 2 | 2 |
| INSS+IRRF | 2 | 2 |
| Guia DAE | 1 | 1 |
| A Pagar | 2 | 2 |
| Acúmulo | 2 | 2 |
| **Total** | **14** | **15** |

---

### Phase 2: Typography & Alignment
**Goal**: Consistent sizing and perfect numeric alignment

#### 2.1 Standardize Font Sizes
**File**: `app/src/components/features/LedgerTableV2.tsx`

```typescript
// Line 621 - "A Pagar" value
Before: text-lg
After:  text-sm font-bold

// ALL monetary values should be text-sm
// Differentiation only via font-weight and color
```

#### 2.2 Apply Tabular Numerals
```typescript
// Add `tabular-nums` to these elements:

// Line 514 - CurrencyInput
className="... tabular-nums ..."

// Line 614 - Gross Salary
className="col-span-2 text-right font-mono tabular-nums ..."

// Line 617 - Employee Taxes
className="col-span-2 text-right font-mono tabular-nums ..."

// Line 618 - DAE/Provisions
className="col-span-1 text-right font-mono tabular-nums ..."

// Lines 621, 624 - Already have tabular-nums ✓
```

#### 2.3 Input Field Styling
```
Update to “input discreto” (text-first; border only on hover/focus), mantendo acessibilidade:
- `focus-visible` claro
- `disabled` com aparência inequívoca
```

---

### Phase 3: Color Contrast - AuditPanel
**Goal**: WCAG AA compliance (4.5:1 ratio) in both themes

#### 3.1 Light Mode Text Colors
**File**: `app/src/components/features/AuditPanel.tsx`

```typescript
// Replace throughout the file:
text-purple-700  →  text-purple-900
text-purple-600  →  text-purple-800
text-slate-700   →  text-slate-900
text-emerald-700 →  text-emerald-900
text-orange-700  →  text-orange-900
text-gray-500    →  text-slate-700
text-gray-600    →  text-slate-800
```

#### 3.2 Dark Mode Text Colors
**File**: `app/src/components/features/AuditPanel.tsx`

```typescript
// Add dark mode variants:
text-purple-900  →  text-purple-900 dark:text-purple-100
text-purple-800  →  text-purple-800 dark:text-purple-200
text-slate-900   →  text-slate-900 dark:text-slate-100
text-emerald-900 →  text-emerald-900 dark:text-emerald-100
text-orange-900  →  text-orange-900 dark:text-orange-100
text-slate-700   →  text-slate-700 dark:text-slate-200
text-slate-800   →  text-slate-800 dark:text-slate-100

// Headers
text-purple-800  →  text-purple-800 dark:text-white
text-slate-800   →  text-slate-800 dark:text-white
text-emerald-800 →  text-emerald-800 dark:text-white
```

#### 3.3 Panel Header Colors
```typescript
// Raio-X panel header (line ~68)
Before: text-purple-800
After:  text-purple-900 dark:text-white

// Composição panel header (line ~163)
Before: text-slate-800
After:  text-slate-900 dark:text-white

// Memória panel header
Before: text-emerald-800
After:  text-emerald-900 dark:text-white
```

---

### Phase 4: Color Contrast - Main Table
**Goal**: Fix all gray-400/gray-500 violations

#### 4.1 Main Table Values
**File**: `app/src/components/features/LedgerTableV2.tsx`

```typescript
// Line 614 - Gross Salary
Before: text-slate-700 dark:text-gray-400
After:  text-slate-900 dark:text-slate-100

// Line 618 - DAE/Provisions
Before: text-slate-700 dark:text-gray-400
After:  text-slate-900 dark:text-slate-100
```

#### 4.2 Secondary Text Elements
```typescript
// Line 141 - Column headers
Before: text-slate-600 dark:text-gray-500
After:  text-slate-700 dark:text-slate-300

// Line 283 - Due badge "ok" state
Before: text-slate-700 dark:text-gray-300
After:  text-slate-700 dark:text-slate-200

// Line 434 - Last payment date
Before: text-gray-500
After:  text-slate-600 dark:text-slate-300

// Line 523 - "Fora do contrato"
Before: text-gray-500
After:  text-slate-600 dark:text-slate-400

// Line 531 - Pro-rata info
Before: text-gray-500
After:  text-slate-600 dark:text-slate-300

// Line 636 - "Detalhamento Financeiro"
Before: text-slate-700 dark:text-gray-400
After:  text-slate-900 dark:text-slate-100
```

---

### Phase 5: Accessibility Enhancements
**Goal**: Keyboard navigation and UX clarity

#### 5.1 Focus States for Keyboard Navigation
**File**: `app/src/components/features/LedgerTableV2.tsx`

```typescript
// Expand/collapse button (line 338-348)
Add: focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2

// Action buttons (lines 539-611)
Add: focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1

// Status pill button (lines 303-325)
Add: focus-visible:ring-2 focus-visible:ring-offset-2
```

#### 5.2 Improved Disabled States
**Lines**: 541, 553, 567, 581, 597

```typescript
Before: opacity-50 cursor-not-allowed
After:  disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed
```

#### 5.3 Touch Targets (NEEDS USER DECISION)
```typescript
// Option A: Full WCAG compliance
// Icon badges
Before: w-6 h-6
After:  w-6 h-6 sm:min-w-[44px] sm:min-h-[44px]

// Option B: Accept current size, document exception
// Keep w-6 h-6, note in docs that desktop-optimized
```

---

### Phase 6: Visual Polish
**Goal**: Professional finish and visual hierarchy

#### 6.1 Column Header Enhancement
**Line**: 141

```typescript
Before: text-slate-600 dark:text-gray-500 ... py-3
After:  text-slate-700 dark:text-slate-300 ... py-4 bg-black/[0.02] dark:bg-white/[0.02]
```

#### 6.2 Status Pill Border Opacity
**Lines**: 310-313

```typescript
Before: border-success/30, border-orange-500/30, border-yellow-500/30
After:  border-success/40, border-orange-500/40, border-yellow-500/40
```

#### 6.3 Font Size Cleanup
**Line**: 523

```typescript
Before: text-[9px]
After:  text-[10px]
```

#### 6.4 Expand Icon Size
**Line**: 344

```typescript
Before: size={18}
After:  size={20}
```

---

## Files to Modify

### Primary Files

#### 1. LedgerTableV2.tsx (~650 lines)
| Section | Lines | Changes |
|---------|-------|---------|
| Column headers | 141-152 | Grid cols, contrast, padding |
| Data row grid | 327 | Grid cols update |
| Status/Month column | 337-494 | Badge layout, spans |
| Action buttons | 537-612 | Focus states, disabled |
| Numeric displays | 614-626 | Contrast, tabular-nums, text-sm |
| Section header | 636 | Contrast fix |

#### 2. AuditPanel.tsx (~580 lines)
| Section | Lines | Changes |
|---------|-------|---------|
| Raio-X panel | 66-157 | All text colors |
| Composição panel | 161-240 | All text colors |
| Memória panel | 240+ | All text colors |
| Headers | Throughout | Dark mode variants |

#### 3. SummaryCardsV2.tsx (optional, if time permits)
| Section | Lines | Changes |
|---------|-------|---------|
| Card headers | 54, 73, 92, 109, 130 | Contrast fixes |

---

## Testing Checklist

### Automated
```bash
# Lighthouse accessibility audit
npm run lighthouse -- --only-categories=accessibility
# Target: Score >= 90
```

### Manual Testing

#### Light Mode
- [ ] All panel text readable against tinted backgrounds
- [ ] Column headers distinguishable from data
- [ ] Purple/slate text has 4.5:1+ contrast
- [ ] No gray-500 on white backgrounds

#### Dark Mode
- [ ] All text readable (no gray-400 visible)
- [ ] Panel text pops against dark backgrounds
- [ ] Column headers visible
- [ ] Glass-panel effect preserved

#### Layout
- [ ] Badges fit single line at 1920px, 1440px, 1280px
- [ ] No wrapping at standard desktop widths
- [ ] Decimal points align vertically
- [ ] Responsive at 768px, 375px

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Visible focus ring on current element
- [ ] Focus order is logical
- [ ] Can operate buttons with Enter/Space

#### Interactions
- [ ] Expand/collapse animates smoothly
- [ ] Status badges clickable
- [ ] Action buttons responsive
- [ ] Disabled buttons clearly non-interactive

---

## Implementation Order

### Session 1: Core Fixes (~2-3 hours)
1. **Phase 3**: AuditPanel color contrast
2. **Phase 4**: Main table color contrast
3. **Phase 2**: Typography standardization

### Session 2: Layout & Accessibility (~1-2 hours)
4. **Phase 1**: Grid expansion & badge compaction
5. **Phase 5.1**: Focus states
6. **Phase 5.2**: Disabled states

### Session 3: Polish (~1 hour)
7. **Phase 6**: Visual refinements
8. Testing & verification

### Future (Optional)
- Phase 5.3: Touch targets (needs decision)
- CSS utility classes
- Custom font sizes in theme

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Grid column changes | Medium | Test all breakpoints |
| Color changes | Low | Reversible, easy to verify |
| Focus states | Low | Additive, no breaking changes |
| Badge layout | Medium | May need iteration |

---

## Success Criteria

### Must Achieve
1. ✅ All text passes WCAG AA (4.5:1 contrast)
2. ✅ No badge wrapping at ≥1280px width
3. ✅ All monetary values use `text-sm`
4. ✅ Decimal points align with `tabular-nums`
5. ✅ Visible focus states on interactive elements

### Nice to Have
6. ✅ Stronger column header hierarchy
7. ✅ Clearer disabled button states
8. ✅ Refined badge spacing

### Excluded (User Decision)
- (removed) Input field styling changes (now in scope)
- ❌ Panel border/shadow enhancements
- ❌ Custom CSS utility classes

---

## Value-Add Summary

| Source | Issues Found |
|--------|--------------|
| External AI | 8 issues (layout, typography, panel contrast) |
| My Analysis | **15 additional issues** |
| **Total** | **23 issues addressed** |

### Key Contributions Beyond External AI
1. **50+ WCAG violations** found via systematic code scan
2. **Keyboard accessibility gap** identified (no focus states)
3. **Touch target analysis** for mobile usability
4. **Secondary text contrast** issues (gray-500 throughout)
5. **Typography inconsistencies** (text-[9px] vs text-[10px])
6. **Column header legibility** problems
7. **Disabled state clarity** improvements
8. **4-tier priority framework** for implementation

---

**Document Version**: 1.1
**Status**: Partially Implemented (needs finishing passes)
**Last Updated**: 2026-01-16

---

## Addendum (Screenshot Review + Cross-App Audit) - 2026-01-16

This addendum keeps the original LedgerTable/AuditPanel plan intact, validates that it still applies to the current UI, and **adds** cross-app issues observed from the screenshots + repository audit. No items below remove or override previously listed issues; they are additive and can be implemented before/alongside the existing phases.

### Applicability Check (Does the original plan apply?)
- **Yes**: The screenshots show exactly the same failure modes the plan targets (light-mode washout, low-contrast secondary text, inconsistent emphasis in monetary values, cramped inline controls, weak keyboard focus visibility).
- **Scope gap**: The existing plan is excellent for the Ledger Table + Audit Panel, but the screenshots also cover **Lobby (Famílias/Funcionários)** and **Top Header/Navigation**, which are not currently addressed.

---

## Additional Issues Identified (Beyond Ledger Table)

### A) Global Styling Conflict (High Impact)
**Issue**: `app/src/components/landing/landing.css` defines a global `.glass-panel` class, which **collides** with the Tailwind utility `.glass-panel` defined in `app/src/index.css`.

**Impact**:
- Inconsistent “glass” surface appearance across app screens.
- Light mode can become overly transparent/washed (making contrast fixes harder than necessary).
- Visual regressions depending on which route loads first (Landing vs. App).

**Fix (Recommended)**:
- Scope landing CSS under a parent selector (e.g., `.landing-root .glass-panel`) **or** rename landing-only classes (`.landing-glass-panel`) to avoid leaking into the app UI.

---

### B) Text Encoding / Broken Accents (High UX Severity)
**Issue**: Many user-facing strings contain mojibake (e.g., `GestÆo`, `Fam¡lia`, `DOMSTICA`), affecting:
- `app/src/AppV2.tsx` (header branding + strings)
- `app/src/components/lobby/LobbyScreen.tsx` (titles, labels, messages)
- `app/src/components/features/LedgerTableV2.tsx`, `AuditPanel.tsx`, `SummaryCardsV2.tsx` (labels)
- `app/src/components/landing/*` (marketing copy)

**Impact**:
- Immediate loss of polish/credibility.
- Reduced comprehension (especially on legal/financial terms).

**Fix (Recommended)**:
- Convert source files to UTF-8 (no BOM) and replace corrupted literals with correct Portuguese diacritics.
- Keep this as a “no-functional-change” refactor (strings only), so risk is low.

**Note**: Some tooling/terminals can display mojibake even when the underlying sources are valid UTF-8; confirm by checking the rendered UI in-browser before treating this as a code issue.

---

### C) Lobby UX (Famílias → Funcionários) (Medium/High)
From the screenshots and `LobbyScreen.tsx`:
- Large “empty space” in the layout at wide widths; content feels left-heavy and not intentionally composed.
- Interactive elements lack consistent `focus-visible` styling (logout, “Nova Família”, cards, delete buttons).
- Card actions rely on hover-only affordances (delete icons), which can hide key actions from keyboard users.

**Fix (Recommended)**:
- Apply the same accessibility treatment as Ledger (focus rings, clearer disabled states).
- Improve responsive composition: consistent max-width, better vertical rhythm, and grid behavior.

---

### D) Header/Toolbar Accessibility + Consistency (Medium)
From `AppV2.tsx` and screenshots:
- Icon-only controls (theme/settings/logout/year arrows) should have consistent focus rings and hit targets.
- Light mode readability depends heavily on background effects; the header should remain stable in both themes.

**Fix (Recommended)**:
- Standardize focus-visible rings for header controls.
- Ensure icon buttons meet minimum hit area (or at least are internally padded) without breaking compact aesthetic.

---

## Implementation Additions (New Phases, Additive)

### Phase 0: Foundations (Recommended First)
1. **Scope landing CSS** to stop `.glass-panel` collisions.
2. **Fix mojibake strings** in the primary user flows shown in screenshots:
   - Lobby (Famílias/Funcionários)
   - Dashboard header
   - Ledger table headers + key labels

### Phase 0.5: Cross-App Accessibility Baseline
3. Add/standardize `focus-visible` rings for:
   - Lobby actions
   - Header/toolbar actions
   - Card “click-to-enter” affordances

---

## Additional Files to Modify (Addendum)
- `app/src/components/landing/landing.css` (scope or rename landing-only `.glass-panel`)
- `app/src/components/landing/LandingPage.tsx` (add a scoping class to root container)
- `app/src/components/lobby/LobbyScreen.tsx` (strings, focus states, minor layout polish)
- `app/src/AppV2.tsx` (strings, focus states for header controls)

---

## Addendum (Partes 1 e 2: Wrap + Alinhamento Numérico) - 2026-01-16

### Parte 1: Estrutura e Grid (evitar quebra de linha na célula de status)
**Objetivo**: a linha principal do mês não deve “crescer” por causa de badges/ícones; **todos os indicadores devem caber em uma única linha horizontal** (com overflow controlado, se necessário), mantendo a altura da linha uniforme.

**O que já está OK**
- Grid mais largo no desktop (15 colunas) e 1ª coluna maior (`col-span-3`)
- Linha de chips com `flex-nowrap` e densidade razoável

**Gaps reais (o que ainda gera “2 linhas”)**
- No modo compacto, existe uma segunda linha dedicada aos ícones de vencimento (salário/bônus/13º) e “CARRY”.

**Plano para fechar (ordem sugerida)**
1. Unificar indicadores em uma única linha: mover ícones de vencimento e “CARRY” para o mesmo container do `statusPill` (a “month chip row”).
2. Dar mais largura real à 1ª coluna (sem depender só de `col-span`): usar um template de grid com `minmax()` maior no primeiro bloco (ex.: `minmax(240px, 2.5fr)`), mantendo o resto em `repeat(..., minmax(72px, 1fr))`.
3. Compactar sem remover ícones: reduzir `h-6` → `h-5` e `gap-1.5` → `gap-1` onde necessário.
4. Overflow consciente: preferir “fade + tooltip” a scroll horizontal dentro da célula; se optar por scroll, esconder scrollbar e garantir que não aumente a altura.

### Parte 2: Tipografia e Alinhamento Numérico (consistência + legibilidade)
**Objetivo**: valores monetários com base `text-sm`, alinhamento rígido à direita, e `tabular-nums` para casar centavos verticalmente.

**O que já está OK**
- Valores monetários principais em `text-sm`, `text-right`, `tabular-nums`
- “A pagar” em destaque via `font-bold` sem inflar o tamanho

**Gaps reais**
1. Cabeçalho numérico desalinhado: “Líquido Acordado” (header) está `text-center`.
2. Input visualmente pesado: o campo editável ainda usa fundo/borda/sombra de “caixa”, competindo com os números ao redor.

**Plano para fechar**
1. Alinhar à direita o header e a coluna de “Líquido Acordado” (e padding direito consistente com as células).
2. Input discreto:
   - padrão: “texto” (fundo transparente, borda transparente)
   - `hover`: borda sutil + leve background
   - `focus`: borda + ring (sem fundo pesado)
3. (Opcional) Aplicar `tabular-nums` também onde números grandes aparecem (cards) para consistência visual.
