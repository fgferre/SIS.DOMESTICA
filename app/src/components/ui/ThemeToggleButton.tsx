import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/utils';
import { Icon } from '@/components/ui/Icon';

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'w-10 h-10 rounded-full glass-panel',
        'flex items-center justify-center',
        'text-gray-400 hover:text-white hover:border-primary hover:shadow-neon-purple transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark',
        className
      )}
      aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      title={theme === 'dark' ? 'Tema: escuro' : 'Tema: claro'}
    >
      <Icon name={theme === 'dark' ? 'dark_mode' : 'light_mode'} size={20} />
    </button>
  );
}
