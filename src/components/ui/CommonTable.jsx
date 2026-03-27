import React from 'react';
import { tableUi } from '../../constants/theme';

/**
 * Common reusable table with shared heading/body styles.
 */
export default function CommonTable({
  headers = [],
  rows = [],
  className = '',
  headerBackgroundColor,
  headerTextColor,
  /** Fit container width: no horizontal scroll; cells wrap / shrink. */
  fitParentWidth = false,
  /** Sticky header row (use with a vertically scrollable parent). */
  stickyHeader = false,
}) {
  const headerBg = headerBackgroundColor ?? tableUi.header.backgroundColor;

  return (
    <div
      className={`w-full min-w-0 ${fitParentWidth ? 'overflow-x-hidden overflow-y-visible' : 'overflow-auto'} ${className}`.trim()}
    >
      <div
        className={fitParentWidth ? 'w-full min-w-0' : 'min-w-max'}
        style={{
          border: tableUi.border,
          borderRadius: tableUi.header.borderRadius,
          overflow: 'hidden',
        }}
      >
        <table className={`w-full border-collapse ${fitParentWidth ? 'table-fixed' : ''}`}>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={`${header}-${idx}`}
                  className={`px-1 py-0.5 text-left sm:px-2 sm:py-1 ${fitParentWidth ? 'min-w-0 break-words align-top' : ''} ${
                    stickyHeader ? 'sticky top-0 z-[1] shadow-[0_1px_0_0_rgba(226,232,240,1)]' : ''
                  }`.trim()}
                  style={{
                    border: tableUi.border,
                    backgroundColor: headerBg,
                    fontSize: 'clamp(6px, 1.2vw, 8px)',
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
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                {row.map((cell, cellIdx) => {
                  const isCellObject = cell && typeof cell === 'object' && !React.isValidElement(cell);
                  const content = isCellObject ? (cell.content ?? '') : cell;
                  const colSpan = isCellObject ? (cell.colSpan ?? 1) : 1;
                  const rowSpan = isCellObject ? (cell.rowSpan ?? 1) : 1;
                  const extraClassName = isCellObject ? (cell.className ?? '') : '';
                  const extraStyle = isCellObject ? (cell.style ?? {}) : {};

                  return (
                    <td
                      key={`cell-${rowIdx}-${cellIdx}`}
                      colSpan={colSpan}
                      rowSpan={rowSpan}
                      className={`px-1 py-0.5 sm:px-2 sm:py-1 ${fitParentWidth ? 'min-w-0 break-words align-top' : ''} ${extraClassName}`.trim()}
                      style={{
                        border: tableUi.border,
                        fontSize: 'clamp(6px, 1.2vw, 8px)',
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
