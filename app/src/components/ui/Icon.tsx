import { cn } from '@/utils/utils';

export type IconProps = {
  name: string;
  className?: string;
  size?: number;
  fill?: 0 | 1;
  weight?: number; // 100..700
  grade?: number; // -50..200
  opticalSize?: number; // 20..48
  title?: string;
};

export function Icon({
  name,
  className,
  size = 20,
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  title,
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-rounded select-none leading-none', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      {name}
    </span>
  );
}

