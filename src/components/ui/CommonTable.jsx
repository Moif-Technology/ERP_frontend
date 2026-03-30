import React, { useMemo } from 'react';
import { tableUi } from '../../constants/theme';

/** Approximate tbody row height for max-height (padding + line-height) */
const BODY_ROW_REM = 1.5;

function Colgroup({ colWidthsPct }) {
  if (!colWidthsPct) return null;
  return (
    <colgroup>
      {colWidthsPct.map((pct, idx) => (
        <col key={`col-${idx}`} style={{ width: `${pct}%` }} />
      ))}
    </colgroup>
  );
}

/**
 * Common reusable table with shared heading/body styles.
 */
export default function CommonTable({
  headers = [],
  rows = [],
  className = '',
  headerBackgroundColor,
  headerTextColor,
  /** Fit container width: no horizontal scroll; columns share width (table-fixed). */
  fitParentWidth = false,
  /** Sticky header row (use with a vertically scrollable parent). */
  stickyHeader = false,
  /**
   * Show this many tbody rows before vertical scroll; extra rows scroll inside tbody only.
   * Header stays fixed above the scroll area.
   */
  maxVisibleRows,
}) {
  const headerBg = headerBackgroundColor ?? tableUi.header.backgroundColor;
  const useBodyScroll = maxVisibleRows != null && maxVisibleRows > 0;
  /** Sticky th only when single table scrolls; split layout keeps thead outside tbody scroll */
  const headerSticky = stickyHeader && !useBodyScroll;

  const outerScrollClass = useBodyScroll
    ? 'overflow-hidden'
    : fitParentWidth
      ? 'overflow-x-hidden overflow-y-visible'
      : 'overflow-x-auto overflow-y-visible';

  const colWidthsPct = useMemo(() => {
    if (!fitParentWidth || !headers.length) return null;
    const n = headers.length;
    if (n === 1) return [100];
    if (n === 2) return [50, 50];
    const firstPct = 3;
    const lastPct = 8;
    const midCount = n - 2;
    const midPct = (100 - firstPct - lastPct) / midCount;
    return headers.map((_, idx) => {
      if (idx === 0) return firstPct;
      if (idx === n - 1) return lastPct;
      return midPct;
    });
  }, [fitParentWidth, headers]);

  const tableClass = `w-full border-collapse ${fitParentWidth ? 'table-fixed' : ''}`;

  const thBase = (idx) =>
    `px-1 py-0.5 text-left sm:px-1.5 sm:py-1 ${fitParentWidth ? 'min-w-0 break-words align-top' : ''} ${
      headerSticky ? 'sticky top-0 z-[1] shadow-[0_1px_0_0_rgba(226,232,240,1)]' : ''
    } ${idx === headers.length - 1 ? 'whitespace-nowrap' : ''}`.trim();

  const theadRow = (
    <thead>
      <tr>
        {headers.map((header, idx) => (
          <th
            key={`${header}-${idx}`}
            className={thBase(idx)}
            style={{
              border: tableUi.border,
              backgroundColor: headerBg,
              fontSize: 'clamp(6px, 1.1vw, 8px)',
              fontWeight: tableUi.header.fontWeight,
              color: headerTextColor ?? tableUi.header.color,
              borderTopLeftRadius: idx === 0 ? tableUi.header.borderRadius : undefined,
              borderTopRightRadius: idx === headers.length - 1 ? tableUi.header.borderRadius : undefined,
            }}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );

  const tbodyRows = rows.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      {row.map((cell, cellIdx) => {
        const isCellObject = cell && typeof cell === 'object' && !React.isValidElement(cell);
        const content = isCellObject ? (cell.content ?? '') : cell;
        const colSpan = isCellObject ? (cell.colSpan ?? 1) : 1;
        const rowSpan = isCellObject ? (cell.rowSpan ?? 1) : 1;
        const extraClassName = isCellObject ? (cell.className ?? '') : '';
        const extraStyle = isCellObject ? (cell.style ?? {}) : {};
        const isLastCol = cellIdx === row.length - 1;

        return (
          <td
            key={`cell-${rowIdx}-${cellIdx}`}
            colSpan={colSpan}
            rowSpan={rowSpan}
            className={`px-1 py-0.5 sm:px-1.5 sm:py-1 ${fitParentWidth ? 'min-w-0 break-words align-top' : ''} ${
              isLastCol ? 'whitespace-nowrap' : ''
            } ${extraClassName}`.trim()}
            style={{
              border: tableUi.border,
              fontSize: 'clamp(6px, 1.1vw, 8px)',
              fontWeight: tableUi.body.fontWeight,
              color: tableUi.body.color,
              ...extraStyle,
            }}
          >
            {content}
          </td>
        );
      })}
    </tr>
  ));

  /** Tbody-only scroll: exactly maxVisibleRows rows tall, then vertical scroll */
  if (useBodyScroll) {
    const tbodyMaxHeight = `calc(${maxVisibleRows} * ${BODY_ROW_REM} * 1rem)`;

    return (
      <div className={`w-full min-w-0 ${outerScrollClass} ${className}`.trim()}>
        <div
          className={`${fitParentWidth ? 'w-full min-w-0' : 'min-w-max'}`}
          style={{
            border: tableUi.border,
            borderRadius: tableUi.header.borderRadius,
            overflow: 'hidden',
          }}
        >
          <table className={tableClass}>
            <Colgroup colWidthsPct={colWidthsPct} />
            {theadRow}
          </table>
          <div
            className="min-w-0 w-full overflow-x-auto overflow-y-auto overscroll-contain"
            style={{ maxHeight: tbodyMaxHeight }}
          >
            <table className={tableClass}>
              <Colgroup colWidthsPct={colWidthsPct} />
              <tbody>{tbodyRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-w-0 ${outerScrollClass} ${className}`.trim()}>
      <div
        className={fitParentWidth ? 'w-full min-w-0' : 'min-w-max'}
        style={{
          border: tableUi.border,
          borderRadius: tableUi.header.borderRadius,
          overflow: 'hidden',
        }}
      >
        <table className={tableClass}>
          <Colgroup colWidthsPct={colWidthsPct} />
          {theadRow}
          <tbody>{tbodyRows}</tbody>
        </table>
      </div>
    </div>
  );
}
