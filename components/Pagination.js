"use client";

export default function Pagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}) {
  /*
    Calculate first and last item
    displayed on the current page.
  */

  const startItem =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const endItem =
    Math.min(
      page * limit,
      total
    );

  /*
    Create page numbers.

    Example:
    1 2 3 4 5
  */

  const getPageNumbers = () => {
    const pages = [];

    /*
      If total pages are 7 or less,
      show all pages.
    */

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    /*
      Beginning pages
    */

    if (page <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    /*
      Ending pages
    */

    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    /*
      Middle pages
    */

    return [
      1,
      "...",
      page - 1,
      page,
      page + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers =
    getPageNumbers();

  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow">
      
      {/* ==========================
          Top Section
      ========================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Showing text */}

        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {startItem}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-gray-900">
            {endItem}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {total}
          </span>
        </p>

        {/* Page Size */}

        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-sm font-medium text-gray-700"
          >
            Page size:
          </label>

          <select
            id="page-size"
            value={limit}
            onChange={(event) =>
              onLimitChange(
                Number(
                  event.target.value
                )
              )
            }
            className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>
              10
            </option>

            <option value={20}>
              20
            </option>

            <option value={50}>
              50
            </option>
          </select>
        </div>
      </div>

      {/* ==========================
          Pagination Controls
      ========================== */}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">

        {/* Previous */}

        <button
          type="button"
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
          disabled={page <= 1}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        {/* Page Numbers */}

        {pageNumbers.map(
          (pageNumber, index) => {
            if (
              pageNumber === "..."
            ) {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-2 py-2 text-gray-500"
                >
                  ...
                </span>
              );
            }

            const isActive =
              pageNumber === page;

            return (
              <button
                type="button"
                key={pageNumber}
                onClick={() =>
                  onPageChange(
                    pageNumber
                  )
                }
                className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            );
          }
        )}

        {/* Next */}

        <button
          type="button"
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
          disabled={
            page >= totalPages
          }
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {/* ==========================
          Page Information
      ========================== */}

      <p className="mt-4 text-center text-sm text-gray-500">
        Page{" "}
        <span className="font-semibold text-gray-700">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-700">
          {totalPages}
        </span>
      </p>
    </div>
  );
}