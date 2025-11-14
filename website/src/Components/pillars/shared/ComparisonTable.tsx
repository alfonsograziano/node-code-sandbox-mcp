import React from 'react';

interface ComparisonTableProps {
  headers: string[];
  rows: Array<Array<string | React.ReactNode>>;
  className?: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  headers,
  rows,
  className = '',
}) => {
  return (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900/60 to-gray-800/40">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="p-4 text-left text-white font-semibold border-b border-white/10"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                  rowIndex % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                }`}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4 text-gray-400">
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
};

export default ComparisonTable;

