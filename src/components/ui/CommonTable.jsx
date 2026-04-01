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
  /** When fitParentWidth: give every column the same width (100% / n). */
  equalColumnWidth = false,
  /** Sticky header row (use with a vertically scrollable parent). */
  stickyHeader = false,
  /**
   * Show this many tbody rows before vertical scroll; extra rows scroll inside tbody only.
   * Header stays fixed above the scroll area.
   */
  maxVisibleRows,
  /** When true, cells only have horizontal borders (no vertical column lines). */
  hideVerticalCellBorders = false,
  /** Horizontal alignment for all header and body cells. */
  cellAlign = 'left',
  /** When true, tbody text is capped slightly below the header so values never look larger than headings. */
  smallerBodyThanHeader = false,
  /** Optional CSS font-size for header cells (overrides default clamp). */
  headerFontSize: headerFontSizeOverride,
  /** Optional CSS font-size for body cells (overrides default clamp). */
  bodyFontSize: bodyFontSizeOverride,
  /** Tailwind padding classes for th/td (e.g. `px-2 py-2 sm:px-3 sm:py-2.5`). */
  cellPaddingClass,
  /** Approximate row height in rem for `maxVisibleRows` scroll area (default 1.5). */
  bodyRowHeightRem,
  /** When true, no border around the table wrapper (outer outline). */
  hideOuterBorder = false,
  /**
   * Optional column width percentages (same length as headers). Values are normalized to sum 100.
   * Use with fitParentWidth for content-aware layout.
   */
  columnWidthPercents,
  /** Extra class names on the `<table>` (e.g. min-width for horizontal scroll). */
  tableClassName = '',
  /** When true with fitParentWidth, outer area uses horizontal scroll instead of clipping. */
  allowHorizontalScroll = false,
}) {
  const headerBg = headerBackgroundColor ?? tableUi.header.backgroundColor;
  const useBodyScroll = maxVisibleRows != null && maxVisibleRows > 0;
  /** Sticky th only when single table scrolls; split layout keeps thead outside tbody scroll */
  const headerSticky = stickyHeader && !useBodyScroll;

  const outerScrollClass = useBodyScroll
    ? allowHorizontalScroll
      ? 'w-full min-w-0 overflow-x-auto overflow-y-visible'
      : 'overflow-hidden'
    : fitParentWidth
      ? allowHorizontalScroll
        ? 'overflow-x-auto overflow-y-visible'
        : 'overflow-x-hidden overflow-y-visible'
      : 'overflow-x-auto overflow-y-visible';

  const tbodyScrollClass =
    useBodyScroll && allowHorizontalScroll
      ? 'min-w-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain'
      : 'min-w-0 w-full overflow-x-auto overflow-y-auto overscroll-contain';

  const colWidthsPct = useMemo(() => {
    if (!fitParentWidth || !headers.length) return null;
    const n = headers.length;
    if (
      columnWidthPercents &&
      columnWidthPercents.length === n &&
      columnWidthPercents.every((v) => typeof v === 'number' && v >= 0)
    ) {
      const sum = columnWidthPercents.reduce((a, b) => a + b, 0);
      if (sum > 0) {
        return columnWidthPercents.map((w) => (w / sum) * 100);
      }
    }
    if (equalColumnWidth) {
      const pct = 100 / n;
      return headers.map(() => pct);
    }
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
  }, [fitParentWidth, headers, equalColumnWidth, columnWidthPercents]);

  const tableClass = `w-full border-collapse ${fitParentWidth ? 'table-fixed' : ''} ${tableClassName}`.trim();

  const alignClass =
    cellAlign === 'center' ? 'text-center align-middle' : cellAlign === 'right' ? 'text-right align-middle' : 'text-left';

  const resolvedHeaderFont =
    headerFontSizeOverride ?? 'clamp(6px, 1.1vw, 8px)';
  const resolvedBodyFont =
    bodyFontSizeOverride ??
    (smallerBodyThanHeader ? 'clamp(6px, 1vw, 7px)' : 'clamp(6px, 1.1vw, 8px)');

  const cellPad =
    cellPaddingClass ?? 'px-1 py-0.5 sm:px-1.5 sm:py-1';

  const rowHeightRem = bodyRowHeightRem ?? BODY_ROW_REM;

  const outerWrapperStyle = hideOuterBorder
    ? { border: 'none', borderRadius: tableUi.header.borderRadius, overflow: 'hidden' }
    : { border: tableUi.border, borderRadius: tableUi.header.borderRadius, overflow: 'hidden' };

  const thBorderStyle = hideVerticalCellBorders
    ? {
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        borderBottom: tableUi.border,
      }
    : { border: tableUi.border };

  const tdBorderStyle = (isLastBodyRow) =>
    hideVerticalCellBorders
      ? {
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: isLastBodyRow ? 'none' : tableUi.border,
        }
      : { border: tableUi.border };

  const thBase = (idx) =>
    `${cellPad} ${alignClass} ${fitParentWidth ? 'min-w-0 break-words' : ''} ${
      cellAlign === 'left' && fitParentWidth ? 'align-top' : ''
    } ${headerSticky ? 'sticky top-0 z-[1] shadow-[0_1px_0_0_rgba(226,232,240,1)]' : ''} ${
      idx === headers.length - 1 ? 'whitespace-nowrap' : ''
    }`.trim();

  const theadRow = (
    <thead>
      <tr>
        {headers.map((header, idx) => (
          <th
            key={`${header}-${idx}`}
            className={thBase(idx)}
            style={{
              ...thBorderStyle,
              backgroundColor: headerBg,
              fontSize: resolvedHeaderFont,
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

  const tbodyRows = rows.map((row, rowIdx) => {
    const isLastBodyRow = rowIdx === rows.length - 1;
    return (
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
            className={`${cellPad} ${alignClass} ${fitParentWidth ? 'min-w-0 break-words' : ''} ${
              cellAlign === 'left' && fitParentWidth ? 'align-top' : ''
            } ${isLastCol ? 'whitespace-nowrap' : ''} ${extraClassName}`.trim()}
            style={{
              ...tdBorderStyle(isLastBodyRow),
              fontSize: resolvedBodyFont,
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
    );
  });

  /** Tbody-only scroll: exactly maxVisibleRows rows tall, then vertical scroll */
  if (useBodyScroll) {
    const tbodyMaxHeight = `calc(${maxVisibleRows} * ${rowHeightRem} * 1rem)`;

    return (
      <div className={`w-full min-w-0 ${outerScrollClass} ${className}`.trim()}>
        <div className={`${fitParentWidth ? 'w-full min-w-0' : 'min-w-max'}`} style={outerWrapperStyle}>
          <table className={tableClass}>
            <Colgroup colWidthsPct={colWidthsPct} />
            {theadRow}
          </table>
          <div className={tbodyScrollClass} style={{ maxHeight: tbodyMaxHeight }}>
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
      <div className={fitParentWidth ? 'w-full min-w-0' : 'min-w-max'} style={outerWrapperStyle}>
        <table className={tableClass}>
          <Colgroup colWidthsPct={colWidthsPct} />
          {theadRow}
          <tbody>{tbodyRows}</tbody>
        </table>
      </div>
    </div>
  );
}
