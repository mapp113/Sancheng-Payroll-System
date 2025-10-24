interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-end gap-1 p-2">
      <button
        className="px-1 text-gray-600 disabled:text-gray-300 hover:text-blue-600"
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
      >
        &lt;&lt;
      </button>
      <button
        className="px-1 text-gray-600 disabled:text-gray-300 hover:text-blue-600"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        &lt;
      </button>
      
      <span className="px-2 text-blue-600 font-medium">
        {currentPage}
      </span>

      <button
        className="px-1 text-gray-600 disabled:text-gray-300 hover:text-blue-600"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        &gt;
      </button>
      <button
        className="px-1 text-gray-600 disabled:text-gray-300 hover:text-blue-600"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
      >
        &gt;&gt;
      </button>
    </div>
  );
}
