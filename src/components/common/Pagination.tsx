import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={`px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 ${className}`}
    >
      {/* Left: Range and Total indicator */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500">
          Showing <strong className="text-slate-900 tabular-nums">{startItem}</strong> to{' '}
          <strong className="text-slate-900 tabular-nums">{endItem}</strong> of{' '}
          <strong className="text-slate-900 tabular-nums">{totalItems}</strong> records
        </span>
      </div>

      {/* Right: Rows per page selector + Page navigation buttons */}
      <div className="flex items-center gap-4">
        {/* Rows per page dropdown */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="pagination-rows-select" className="text-slate-500 text-[11px] whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="pagination-rows-select"
            aria-label="Select number of rows per page"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1); // reset to page 1
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#087BEF] outline-none transition-all cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none rounded hover:bg-slate-100 transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 py-0.5 text-xs font-semibold text-slate-700 tabular-nums">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none rounded hover:bg-slate-100 transition-colors"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
