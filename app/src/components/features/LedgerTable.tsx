import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { cn } from '@/utils/utils';
import { ExtrasManager } from './ExtrasManager';
import { PaymentsManager } from './PaymentsManager';
import { LedgerRow } from './LedgerRow';

export function LedgerTable() {
  const { years, activeYear, employee, toggleHoliday } = usePayrollStore();
  const yearData = years[activeYear];

  const [viewMode, setViewMode] = useState<'caixa' | 'competencia'>('caixa');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingExtrasMonth, setEditingExtrasMonth] = useState<number | null>(null);
  const [editingPaymentsMonth, setEditingPaymentsMonth] = useState<number | null>(null);
  const [compactMode, setCompactMode] = useState(true);
  const [actionsMenuMonth, setActionsMenuMonth] = useState<number | null>(null);
  const [actionsMenuPos, setActionsMenuPos] = useState<{ top: number; left: number } | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionsMenuAnchorRef = useRef<HTMLElement | null>(null);

  const terminationDate = employee.terminationDate
    ? new Date(`${employee.terminationDate}T12:00:00`)
    : undefined;

  // Reset expansion when switching year or employee (using CPF as proxy for ID)
  useEffect(() => {
    setExpandedRows([]);
  }, [activeYear, employee?.cpf]);

  const closeActionsMenu = () => {
    setActionsMenuMonth(null);
    setActionsMenuPos(null);
    actionsMenuAnchorRef.current = null;
  };

  const openActionsMenu = (month: number, anchor: HTMLElement) => {
    actionsMenuAnchorRef.current = anchor;
    setActionsMenuPos(null);
    setActionsMenuMonth(month);
  };

  const computeActionsMenuPos = () => {
    const anchor = actionsMenuAnchorRef.current;
    const menuEl = actionsMenuRef.current;
    if (!anchor || !menuEl) return;

    const rect = anchor.getBoundingClientRect();
    const menuW = menuEl.offsetWidth || 240;
    const menuH = menuEl.offsetHeight || 160;
    const margin = 8;

    let left = rect.right - menuW;
    let top = rect.bottom + margin;

    const maxLeft = Math.max(margin, window.innerWidth - menuW - margin);
    left = Math.min(Math.max(margin, left), maxLeft);

    if (top + menuH > window.innerHeight - margin) {
      top = rect.top - margin - menuH;
    }
    const maxTop = Math.max(margin, window.innerHeight - menuH - margin);
    top = Math.min(Math.max(margin, top), maxTop);

    setActionsMenuPos({ top, left });
  };

  useLayoutEffect(() => {
    if (actionsMenuMonth == null) return;
    computeActionsMenuPos();
  }, [actionsMenuMonth]);

  useEffect(() => {
    if (actionsMenuMonth == null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeActionsMenu();
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (actionsMenuRef.current?.contains(target)) return;
      if (actionsMenuAnchorRef.current?.contains(target)) return;
      closeActionsMenu();
    };

    const onReposition = () => computeActionsMenuPos();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [actionsMenuMonth]);

  if (!yearData) return <div>Carregando ano...</div>;

  const allMonths = yearData.ledger.map(e => e.month);
  const allExpanded = expandedRows.length === allMonths.length;
  const toggleExpandAll = () => {
    setExpandedRows(allExpanded ? [] : allMonths);
  };

  const toggleExpand = (month: number) => {
    setExpandedRows(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const actionsMenuEntry =
    actionsMenuMonth != null ? yearData.ledger.find(e => e.month === actionsMenuMonth) : undefined;
  const actionsMenuDisabled = !actionsMenuEntry?.isInEmployment;

  return (
    <div className="glass-panel rounded-xl clip-corner border border-black/10 dark:border-white/10 overflow-hidden">
      {editingExtrasMonth && (
        <ExtrasManager
          month={editingExtrasMonth}
          isOpen={true}
          onClose={() => setEditingExtrasMonth(null)}
        />
      )}

      {editingPaymentsMonth && (
        <PaymentsManager
          month={editingPaymentsMonth}
          isOpen={true}
          onClose={() => setEditingPaymentsMonth(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-end sm:items-center border-b border-black/10 dark:border-white/10 pb-4 gap-4 relative px-4 pt-6">
        <div className="absolute bottom-0 right-0 w-20 h-px bg-secondary shadow-[0_0_10px_#06b6d4]" />
        <div>
          <h2 className="font-display text-xl text-slate-900 dark:text-white font-bold tracking-wide uppercase flex items-center gap-3">
            <span className="text-primary">▸</span>
            Demonstrativo Financeiro {activeYear}
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-transparent mt-1 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleExpandAll}
            className="px-4 py-1.5 rounded bg-transparent border border-black/15 dark:border-white/20 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:border-black/25 dark:hover:border-white/40 text-slate-700 dark:text-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark"
          >
            {allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
          </button>
          <div className="bg-white/60 dark:bg-glass-bg rounded border border-black/15 dark:border-white/20 p-1 flex shadow-lg">
            <button
              onClick={() => setCompactMode(v => !v)}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                compactMode
                  ? 'bg-secondary/20 text-secondary shadow-neon-cyan border border-secondary/30 hover:bg-secondary/30'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
              title="Alterna entre modo compacto e detalhado"
            >
              {compactMode ? 'Compacto' : 'Detalhado'}
            </button>
            <button
              onClick={() => setViewMode('caixa')}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                viewMode === 'caixa'
                  ? 'bg-primary/20 text-primary shadow-neon-purple border border-primary/30 hover:bg-primary/30'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Caixa
            </button>
            <button
              onClick={() => setViewMode('competencia')}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                viewMode === 'competencia'
                  ? 'bg-accent/15 text-accent shadow-neon-red border border-accent/30 hover:bg-accent/20'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Competência
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-0 md:min-w-[1120px]">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[repeat(15,minmax(72px,1fr))] gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="col-span-3 pl-2">Mês / Status</div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5 pr-2">
              Líquido Acordado
            </div>
            <div className="col-span-1 text-center border-l border-black/5 dark:border-white/5">
              Ações
            </div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5">
              Bruto Calc.
            </div>
            <div className="col-span-2 text-right text-accent border-l border-black/5 dark:border-white/5">
              INSS+IRRF (Desc)
            </div>
            <div className="col-span-1 text-right border-l border-black/5 dark:border-white/5">
              {viewMode === 'caixa' ? 'Guia DAE' : 'Provisão'}
            </div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5">
              A Pagar
            </div>
            <div className="col-span-2 text-right text-secondary border-l border-black/5 dark:border-white/5">
              Acúmulo
            </div>
          </div>

          <div className="space-y-6 px-4 pb-6">
            {yearData.ledger.map(entry => (
              <LedgerRow
                key={entry.month}
                entry={entry}
                isExpanded={expandedRows.includes(entry.month)}
                viewMode={viewMode}
                compactMode={compactMode}
                actionsMenuOpen={actionsMenuMonth === entry.month}
                terminationDate={terminationDate}
                onToggleExpand={toggleExpand}
                onEditPayments={setEditingPaymentsMonth}
                onActionsMenu={openActionsMenu}
                onCloseActionsMenu={closeActionsMenu}
                dependents={employee.dependents}
              />
            ))}
          </div>
        </div>
      </div>

      {actionsMenuMonth != null &&
        createPortal(
          <div
            ref={actionsMenuRef}
            role="menu"
            className={cn(
              'fixed z-50 min-w-[220px] rounded-lg glass-panel border border-black/10 dark:border-white/10 bg-white/85 dark:bg-black/60 backdrop-blur-md',
              'shadow-xl shadow-black/10 dark:shadow-black/40',
              !actionsMenuPos && 'opacity-0 pointer-events-none'
            )}
            style={
              actionsMenuPos
                ? { top: actionsMenuPos.top, left: actionsMenuPos.left }
                : { top: 0, left: 0 }
            }
          >
            <div className="p-1">
              <button
                type="button"
                role="menuitem"
                disabled={actionsMenuDisabled}
                onClick={() => {
                  if (actionsMenuDisabled) return;
                  setEditingExtrasMonth(actionsMenuMonth);
                  closeActionsMenu();
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm transition-colors text-left',
                  actionsMenuDisabled
                    ? 'opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-300'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                <span className="font-medium">Extras/Descontos</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">...</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={actionsMenuDisabled}
                onClick={() => {
                  if (actionsMenuDisabled) return;
                  toggleHoliday(actionsMenuMonth!);
                  closeActionsMenu();
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm transition-colors text-left',
                  actionsMenuDisabled
                    ? 'opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-300'
                    : cn(
                        'hover:bg-black/5 dark:hover:bg-white/10',
                        actionsMenuEntry?.workedHoliday
                          ? 'text-purple-700 dark:text-purple-200'
                          : 'text-slate-800 dark:text-slate-100'
                      )
                )}
              >
                <span className="font-medium">Feriado Trabalhado</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center h-6 px-2 rounded border text-[10px] font-bold select-none whitespace-nowrap',
                    actionsMenuEntry?.workedHoliday
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 text-slate-700 dark:text-slate-200'
                  )}
                >
                  H
                </span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
