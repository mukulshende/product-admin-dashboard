"use client";

export default function ProductFilters({
  category,
  categories,
  sortBy,
  order,
  searchActive,
  onCategoryChange,
  onSortByChange,
  onOrderChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value)
          }
          disabled={searchActive}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">
            All Categories
          </option>

          {categories.map((item) => {
            const value =
              typeof item === "string"
                ? item
                : item.slug;

            const label =
              typeof item === "string"
                ? item
                : item.name;

            return (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            );
          })}
        </select>

        {searchActive && (
          <p className="mt-1 text-xs text-gray-500">
            Category filter is disabled during search.
          </p>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label
          htmlFor="sortBy"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Sort By
        </label>

        <select
          id="sortBy"
          value={sortBy}
          onChange={(event) =>
            onSortByChange(event.target.value)
          }
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">
            Default
          </option>

          <option value="price">
            Price
          </option>

          <option value="rating">
            Rating
          </option>

          <option value="title">
            Title
          </option>
        </select>
      </div>

      {/* Order */}
      <div>
        <label
          htmlFor="order"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Order
        </label>

        <select
          id="order"
          value={order}
          onChange={(event) =>
            onOrderChange(event.target.value)
          }
          disabled={!sortBy}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="asc">
            Ascending
          </option>

          <option value="desc">
            Descending
          </option>
        </select>
      </div>

    </div>
  );
}