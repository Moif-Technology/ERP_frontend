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
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`.trim()}>
      <div
        style={{
          border: tableUi.border,
          borderRadius: tableUi.header.borderRadius,
          overflow: 'hidden',
        }}
      >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th
                key={`${header}-${idx}`}
                className="px-2 py-1 text-left"
                style={{
                  border: tableUi.border,
                  backgroundColor: headerBackgroundColor ?? tableUi.header.backgroundColor,
                  fontSize: tableUi.header.fontSize,
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
              {row.map((cell, cellIdx) => (
                <td
                  key={`cell-${rowIdx}-${cellIdx}`}
                  className="px-2 py-1"
                  style={{
                    border: tableUi.border,
                    fontSize: tableUi.body.fontSize,
                    fontWeight: tableUi.body.fontWeight,
                    color: tableUi.body.color,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
