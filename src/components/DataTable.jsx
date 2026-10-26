// Sortable, searchable, paginated table. OWNER: PM. Used by every admin list.
//
// Props:
//   columns   [{ key, header, render?(row), sortable?, numeric?, sortValue?(row) }]
//   rows      array of objects
//   rowKey    property name that is unique per row (default 'id')
//   caption   short description for screen readers (and a visible title when `showCaption`)
//   searchable / searchPlaceholder   adds a search box that filters on all visible text columns
//   pageSize  rows per page (default 10)
//   toolbar   extra controls shown beside the search box (filters, "Add" button)
//   emptyMessage   text shown when there is nothing to display
// State kept inside: sort column and direction, search text, current page.
import { useMemo, useState } from 'react';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';
import Icon from './Icon.jsx';
import Input from './Input.jsx';

const textOf = (column, row) => {
  const value = column.sortValue ? column.sortValue(row) : row[column.key];
  return value == null ? '' : String(value);
};

export default function DataTable({ columns, rows, rowKey = 'id', caption, showCaption = false, searchable = false, searchPlaceholder = 'Search...', pageSize = 10, toolbar, emptyMessage = 'Nothing to show yet.' }) {
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => columns.some((c) => textOf(c, row).toLowerCase().includes(needle)));
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return filtered;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = column.sortValue ? column.sortValue(a) : a[column.key];
      const bv = column.sortValue ? column.sortValue(b) : b[column.key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * factor;
    });
  }, [filtered, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, direction: s.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));

  return (
    <div className="card">
      {(searchable || toolbar) && (
        <div className="table-toolbar">
          {searchable && (
            <Input
              type="search"
              aria-label="Search the table"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          )}
          {toolbar && <div className="row">{toolbar}</div>}
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <caption className={showCaption ? '' : 'sr-only'}>{caption}</caption>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={column.numeric ? 'num' : ''}
                      aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {column.sortable ? (
                        <button type="button" className="table__sort" onClick={() => toggleSort(column.key)}>
                          {column.header}
                          {sort.key === column.key && <Icon name={sort.direction === 'asc' ? 'chevronUp' : 'chevronDown'} size={14} />}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row[rowKey]}>
                    {columns.map((column) => (
                      <td key={column.key} className={column.numeric ? 'num' : ''}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="muted" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                      No rows match "{query}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {sorted.length > pageSize && (
            <div className="table-pager">
              <span>
                Page {currentPage} of {pageCount} · {sorted.length} rows
              </span>
              <div className="row">
                <Button variant="secondary" size="sm" icon="chevronLeft" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
                  Next
                  <Icon name="chevronRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
