"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
} from "../../lib/api";

import {
  getAddedProducts,
  getDeletedProductIds,
  getUpdatedProducts,
} from "../../lib/productStore";

import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import ProductFilters from "../../components/ProductFilters";
import ProductTable from "../../components/ProductTable";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";

const VALID_LIMITS = [10, 20, 50];

const VALID_SORT_FIELDS = [
  "",
  "price",
  "rating",
  "title",
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rawPage = Number(
    searchParams.get("page") || "1"
  );

  const rawLimit = Number(
    searchParams.get("limit") || "10"
  );

  const search =
    searchParams.get("search") || "";

  const category =
    searchParams.get("category") || "";

  const sortBy =
    searchParams.get("sortBy") || "";

  const order =
    searchParams.get("order") || "asc";

  const page =
    Number.isInteger(rawPage) && rawPage >= 1
      ? rawPage
      : 1;

  const limit = VALID_LIMITS.includes(rawLimit)
    ? rawLimit
    : 10;

  const validSortBy =
    VALID_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "";

  const validOrder =
    order === "desc"
      ? "desc"
      : "asc";

  const skip = (page - 1) * limit;

  const searchActive =
    search.trim().length > 0;

  const updateURL = (values = {}) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(values).forEach(
      ([key, value]) => {
        if (
          value === "" ||
          value === null ||
          value === undefined
        ) {
          params.delete(key);
        } else {
          params.set(
            key,
            String(value)
          );
        }
      }
    );

    const queryString =
      params.toString();

    router.push(
      queryString
        ? "/products?" + queryString
        : "/products"
    );
  };

  // Protect products page
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data =
          await getCategories();

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const controller =
      new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let data;

        // Search mode
        if (searchActive) {
          data =
            await searchProducts(
              {
                q: search.trim(),
                limit: limit,
                skip: skip,
              },
              controller.signal
            );
        }

        // Category mode
        else if (category) {
          data =
            await getProductsByCategory(
              category,
              {
                limit: limit,
                skip: skip,
                sortBy:
                  validSortBy ||
                  undefined,
                order:
                  validSortBy
                    ? validOrder
                    : undefined,
              },
              controller.signal
            );
        }

        // Normal product mode
        else {
          data =
            await getProducts(
              {
                limit: limit,
                skip: skip,
                sortBy:
                  validSortBy ||
                  undefined,
                order:
                  validSortBy
                    ? validOrder
                    : undefined,
              },
              controller.signal
            );
        }

        const addedProducts =
          getAddedProducts();

        const deletedIds =
          getDeletedProductIds();

        const updatedProducts =
          getUpdatedProducts();

        // Remove deleted products
        let finalProducts =
          (data.products || [])
            .filter(
              (product) =>
                !deletedIds.includes(
                  Number(product.id)
                )
            );

        // Apply locally edited products
        finalProducts =
          finalProducts.map(
            (product) => {
              const updated =
                updatedProducts[
                  product.id
                ];

              if (updated) {
                return {
                  ...product,
                  ...updated,
                };
              }

              return product;
            }
          );

        // Products added locally
        const visibleAddedProducts =
          addedProducts.filter(
            (product) =>
              !deletedIds.includes(
                Number(product.id)
              )
          );

        // Search local products
        if (searchActive) {
          const searchText =
            search
              .trim()
              .toLowerCase();

          const matchingAdded =
            visibleAddedProducts.filter(
              (product) =>
                product.title
                  ?.toLowerCase()
                  .includes(searchText)
            );

          finalProducts =
            finalProducts.filter(
              (product) =>
                product.title
                  ?.toLowerCase()
                  .includes(searchText)
            );

          finalProducts = [
            ...matchingAdded,
            ...finalProducts,
          ];
        }

        // Category local products
        else if (category) {
          const matchingAdded =
            visibleAddedProducts.filter(
              (product) =>
                product.category ===
                category
            );

          finalProducts = [
            ...matchingAdded,
            ...finalProducts,
          ];
        }

        // Normal mode
        else if (page === 1) {
          finalProducts = [
            ...visibleAddedProducts,
            ...finalProducts,
          ];
        }

        // Local sorting
        if (validSortBy) {
          finalProducts.sort(
            (a, b) => {
              let valueA =
                a[validSortBy];

              let valueB =
                b[validSortBy];

              // Title sorting
              if (
                validSortBy ===
                "title"
              ) {
                valueA =
                  String(
                    valueA || ""
                  ).toLowerCase();

                valueB =
                  String(
                    valueB || ""
                  ).toLowerCase();

                const comparison =
                  valueA.localeCompare(
                    valueB
                  );

                return validOrder ===
                  "asc"
                  ? comparison
                  : -comparison;
              }

              // Price / Rating sorting
              valueA =
                Number(
                  valueA || 0
                );

              valueB =
                Number(
                  valueB || 0
                );

              return validOrder ===
                "asc"
                ? valueA - valueB
                : valueB - valueA;
            }
          );
        }

        setProducts(
          finalProducts
        );

        // Calculate total
        let calculatedTotal =
          Number(data.total || 0);

        // Add locally created products
        if (
          !searchActive &&
          !category
        ) {
          calculatedTotal +=
            visibleAddedProducts.length;
        }

        // Add matching local search products
        if (searchActive) {
          const searchText =
            search
              .trim()
              .toLowerCase();

          const matchingAdded =
            visibleAddedProducts.filter(
              (product) =>
                product.title
                  ?.toLowerCase()
                  .includes(searchText)
            );

          calculatedTotal +=
            matchingAdded.length;
        }

        // Add matching local category products
        if (category) {
          const matchingAdded =
            visibleAddedProducts.filter(
              (product) =>
                product.category ===
                category
            );

          calculatedTotal +=
            matchingAdded.length;
        }

        // Remove deleted API products from total
        const apiTotal =
          Number(data.total || 0);

        const deletedApiProducts =
          deletedIds.filter(
            (id) =>
              Number(id) >= 1 &&
              Number(id) <= apiTotal
          ).length;

        calculatedTotal =
          Math.max(
            calculatedTotal -
              deletedApiProducts,
            0
          );

        setTotal(
          calculatedTotal
        );
      } catch (error) {
        // Ignore cancelled requests
        if (
          error.name ===
            "CanceledError" ||
          error.name ===
            "AbortError" ||
          error.code ===
            "ERR_CANCELED"
        ) {
          return;
        }

        console.error(
          "Failed to load products:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load products."
        );

        setProducts([]);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    page,
    limit,
    search,
    category,
    validSortBy,
    validOrder,
    searchActive,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

  // Correct page if URL page is too large
  useEffect(() => {
    if (
      total > 0 &&
      page > totalPages
    ) {
      updateURL({
        page: 1,
      });
    }
  }, [
    page,
    totalPages,
    total,
  ]);

  // Correct invalid URL values
  useEffect(() => {
    const needsCorrection =
      rawPage !== page ||
      rawLimit !== limit ||
      sortBy !== validSortBy ||
      order !== validOrder;

    if (needsCorrection) {
      updateURL({
        page: page,
        limit: limit,
        sortBy: validSortBy,
        order: validSortBy
          ? validOrder
          : "",
      });
    }
  }, [
    rawPage,
    rawLimit,
    page,
    limit,
    sortBy,
    validSortBy,
    order,
    validOrder,
  ]);

  // Search
  const handleSearch = (value) => {
    updateURL({
      search: value.trim(),
      category: "",
      page: 1,
    });
  };

  // Category
  const handleCategoryChange = (
    value
  ) => {
    updateURL({
      category: value,
      search: "",
      page: 1,
    });
  };

  // Sort field
  const handleSortByChange = (
    value
  ) => {
    updateURL({
      sortBy: value,
      order: value
        ? validOrder
        : "",
      page: 1,
    });
  };

  // Sort order
  const handleOrderChange = (
    value
  ) => {
    updateURL({
      order: value,
      page: 1,
    });
  };

  // Pagination
  const handlePageChange = (
    newPage
  ) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages
    ) {
      updateURL({
        page: newPage,
      });
    }
  };

  // Page size
  const handleLimitChange = (
    newLimit
  ) => {
    const numericLimit =
      Number(newLimit);

    if (
      !VALID_LIMITS.includes(
        numericLimit
      )
    ) {
      return;
    }

    updateURL({
      limit: numericLimit,
      page: 1,
    });
  };

  // Retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    router.replace("/");
  };

  // Loading screen
  if (loading) {
    return (
      <>
        <Navbar
          onLogout={
            handleLogout
          }
        />

        <main className="min-h-screen bg-gray-100 px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <Loader />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        onLogout={
          handleLogout
        }
      />

      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Products
              </h1>

              <p className="mt-1 text-gray-500">
                Manage your products
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/products/add"
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Add Product
            </button>

          </div>

          {/* Search */}
          <div className="mb-5 rounded-xl bg-white p-5 shadow">
            <SearchBar
              value={search}
              onSearch={
                handleSearch
              }
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl bg-white p-5 shadow">
            <ProductFilters
              category={category}
              categories={
                categories
              }
              sortBy={
                validSortBy
              }
              order={
                validOrder
              }
              searchActive={
                searchActive
              }
              onCategoryChange={
                handleCategoryChange
              }
              onSortByChange={
                handleSortByChange
              }
              onOrderChange={
                handleOrderChange
              }
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-100 p-5 text-red-700">

              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>

            </div>
          )}

          {/* Empty State */}
          {!error &&
            products.length ===
              0 && (
              <div className="rounded-xl bg-white p-12 text-center shadow">

                <div className="mb-4 text-5xl">
                  📦
                </div>

                <h2 className="text-xl font-semibold text-gray-800">
                  No products found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try changing your
                  search or filters.
                </p>

              </div>
            )}

          {/* Product List */}
          {!error &&
            products.length >
              0 && (
              <>
                <ProductTable
                  products={
                    products
                  }
                />

                <ProductCard
                  products={
                    products
                  }
                />
              </>
            )}

          {/* Pagination */}
          {!error &&
            total > 0 && (
              <Pagination
                page={page}
                totalPages={
                  totalPages
                }
                limit={limit}
                total={total}
                onPageChange={
                  handlePageChange
                }
                onLimitChange={
                  handleLimitChange
                }
              />
            )}

        </div>
      </main>
    </>
  );
}

