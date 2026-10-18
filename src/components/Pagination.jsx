import './Pagination.css';

// `page` is zero-based (that's what the API uses); we show it one-based.
function pageWindow(current, total) {
  const pages = new Set([0, total - 1, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
      >
        Previous
      </button>

      <ul>
        {pageWindow(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
              ...
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={`pagination__page${p === page ? ' is-current' : ''}`}
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p + 1}`}
              >
                {p + 1}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </button>
    </nav>
  );
}
