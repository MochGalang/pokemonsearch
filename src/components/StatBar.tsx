import styles from './StatBar.module.css';
import { formatStatName } from '@/lib/api';

interface StatBarProps {
  statName: string;
  value: number;
  max?: number;
}

function getStatColor(value: number): string {
  if (value >= 100) return 'high';
  if (value >= 60) return 'mid';
  return 'low';
}

export default function StatBar({ statName, value, max = 255 }: StatBarProps) {
  const pct = Math.round((value / max) * 100);
  const tier = getStatColor(value);

  return (
    <div className={styles.row}>
      <span className={styles.label}>{formatStatName(statName)}</span>
      <span className={styles.value}>{value}</span>
      <div className={styles.track} role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={formatStatName(statName)}>
        <div
          className={`${styles.fill} ${styles[tier]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
