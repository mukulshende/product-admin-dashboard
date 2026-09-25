"use client";

export default function Loader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white shadow">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

        {/* Loading text */}
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading products...
        </p>
      </div>
    </div>
  );
}