"use client";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChangeAction: (page: number) => void;
};

const DOTS = "…";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChangeAction,
}: Props) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 2) pages.push(1);
      if (currentPage > 3) pages.push(DOTS);

      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push(DOTS);
      if (currentPage < totalPages - 1) pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="mt-4 flex items-center justify-end space-x-2 text-sm">
      <button
        onClick={() => onPageChangeAction(1)}
        disabled={currentPage === 1}
        className="px-2 text-gray-700 disabled:text-gray-400"
      >
        {"<<"}
      </button>

      <button
        onClick={() => onPageChangeAction(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 text-gray-700 disabled:text-gray-400"
      >
        {"<"}
      </button>

      {pages.map((p, i) =>
        p === DOTS ? (
          <span key={i} className="px-1">
            {DOTS}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChangeAction(p as number)}
            className={`px-2 font-semibold ${
              p === currentPage ? "text-black" : "text-gray-600 hover:text-black"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChangeAction(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 text-gray-700 disabled:text-gray-400"
      >
        {">"}
      </button>

      <button
        onClick={() => onPageChangeAction(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 text-gray-700 disabled:text-gray-400"
      >
        {">>"}
      </button>
    </div>
  );
}