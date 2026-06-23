'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({ totalItems, itemsPerPage }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)} className={styles.btn} aria-label="Previous page">
          &laquo; Prev
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`} aria-disabled="true">
          &laquo; Prev
        </span>
      )}

      <div className={styles.pages}>
        {startPage > 1 && (
          <>
            <Link href={createPageUrl(1)} className={styles.pageBtn}>1</Link>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={createPageUrl(p)}
            className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <Link href={createPageUrl(totalPages)} className={styles.pageBtn}>{totalPages}</Link>
          </>
        )}
      </div>

      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)} className={styles.btn} aria-label="Next page">
          Next &raquo;
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`} aria-disabled="true">
          Next &raquo;
        </span>
      )}
    </nav>
  );
}
