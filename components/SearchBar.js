"use client";

import { useEffect, useState } from "react";

export default function SearchBar({
  value,
  onSearch,
}) {
  const [inputValue, setInputValue] =
    useState(value || "");

  /*
    Keep input synchronized with URL.
  */

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  /*
    Debounce search.

    API request will start only after
    user stops typing for 500ms.
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 500);

    /*
      Cancel previous timer when
      user types another character.
    */

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  /*
    Clear search input.
  */

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div>
      {/* Label */}

      <label
        htmlFor="product-search"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Search Products
      </label>

      {/* Search Input */}

      <div className="relative">
        <input
          id="product-search"
          type="text"
          value={inputValue}
          onChange={(event) =>
            setInputValue(
              event.target.value
            )
          }
          placeholder="Search products..."
          className="w-full rounded-lg border px-4 py-3 pr-24 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />

        {/* Clear Button */}

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Help Text */}

      <p className="mt-2 text-xs text-gray-500">
        Search updates after you stop
        typing.
      </p>
    </div>
  );
}