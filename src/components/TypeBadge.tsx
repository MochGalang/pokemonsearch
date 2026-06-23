import styles from './TypeBadge.module.css';
import { capitalize } from '@/lib/api';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[`type-${type}`]} ${styles[size]}`}
      data-type={type}
    >
      {capitalize(type)}
    </span>
  );
}
