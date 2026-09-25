"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  getCategories,
  getProducts,
  getProductsByCategory,
  searchProducts,
} from "../../lib/api";

import {
  getAddedProducts,
  getDeletedProductIds,
  getUpdatedProducts,
  applyLocalProductChanges,
} from "../../lib/productStore";

import Navbar from "../../components/Navbar";
import ProductTable from "../../components/ProductTable";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import ProductFilters from "../../components/ProductFilters";
import Loader from "../../components/Loader";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const [deleting, setDeleting] = useState(false);

  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") || "asc";

  const allowedLimits = [10, 20, 50];

  const parsedPage = Number(rawPage);
  const parsedLimit = Number(rawLimit);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const limit = allowedLimits.includes(parsedLimit)
    ? parsedLimit
    : 10;

  const updateURL = (values) => {
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
          params.set(key, String(value));
        }
      }
    );

    router.push(
      "/products?" + params.toString()
    );
  };

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryLoading(true);

        const data = await getCategories();

        setCategories(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setSearchError("");

        let data;

        const params = {
          limit,
          skip: (page - 1) * limit,
        };

        if (search.trim()) {
          data = await searchProducts(
            {
              q: search.trim(),
              ...params,
              delay: 2000,
            },
            controller.signal
          );
        } else if (category) {
          data = await getProductsByCategory(
            category,
            params,
            controller.signal
          );
        } else {
          data = await getProducts(
            params,
            controller.signal
          );
        }

        let loadedProducts = data.products || [];

        const deletedIds =
          getDeletedProductIds();

        const addedProducts =
          getAddedProducts();

        const updatedProducts =
          getUpdatedProducts();

        loadedProducts =
          applyLocalProductChanges(
            loadedProducts,
            deletedIds,
            addedProducts,
            updatedProducts
          );

        setProducts(loadedProducts);

        // Correct invalid page number
        const total = data.total || 0;
        const totalPages = Math.max(
          1,
          Math.ceil(total / limit)
        );

        if (page > totalPages) {
          updateURL({
            page: totalPages,
          });
        }
      } catch (error) {
        if (
          error.name === "CanceledError" ||
          error.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error(error);

        setError(
          "Failed to load products. Please try again."
        );

        setSearchError(
          "Unable to load products."
        );
      } finally {
        setLoading(false);
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
    retryKey,
  ]);

  // Sort products on frontend
  const sortedProducts = useMemo(() => {
    const result = [...products];

    if (!sortBy) {
      return result;
    }

    result.sort((a, b) => {
      let valueA;
      let valueB;

      if (sortBy === "price") {
        valueA = Number(a.price) || 0;
        valueB = Number(b.price) || 0;
      } else if (sortBy === "rating") {
        valueA = Number(a.rating) || 0;
        valueB = Number(b.rating) || 0;
      } else if (sortBy === "title") {
        valueA = String(
          a.title || ""
        ).toLowerCase();

        valueB = String(
          b.title || ""
        ).toLowerCase();
      } else {
        return 0;
      }

      if (valueA < valueB) {
        return order === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return order === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [
    products,
    sortBy,
    order,
  ]);

  const handleSearch = (value) => {
    updateURL({
      search: value.trim(),
      category: "",
      page: 1,
    });
  };

  const handleCategoryChange = (
    value
  ) => {
    updateURL({
      category: value,
      search: "",
      page: 1,
    });
  };

  const handleSortChange = (
    newSortBy,
    newOrder
  ) => {
    updateURL({
      sortBy: newSortBy,
      order: newOrder,
      page: 1,
    });
  };

  const handlePageChange = (
    newPage
  ) => {
    updateURL({
      page: newPage,
    });
  };

  const handleLimitChange = (
    newLimit
  ) => {
    updateURL({
      limit: newLimit,
      page: 1,
    });
  };

  const handleRetry = () => {
    setRetryKey(
      (previous) => previous + 1
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/");
  };

  const hasSearchOrFilter =
    Boolean(search.trim()) ||
    Boolean(category);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar
        onLogout={handleLogout}
      />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Products
              </h1>

              <p className="mt-1 text-gray-500">
                Manage your product catalog
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
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <SearchBar
              value={search}
              onSearch={handleSearch}
            />

            <ProductFilters
              categories={categories}
              category={category}
              sortBy={sortBy}
              order={order}
              onCategoryChange={
                handleCategoryChange
              }
              onSortChange={
                handleSortChange
              }
              categoryLoading={
                categoryLoading
              }
              searchActive={
                Boolean(search.trim())
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 shadow">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="mb-4 text-5xl">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : sortedProducts.length ===
          0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="mb-4 text-5xl">
              🔍
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              {hasSearchOrFilter
                ? "Try changing your search or filter."
                : "There are no products available."}
            </p>

            <button
              type="button"
              onClick={() => {
                updateURL({
                  search: "",
                  category: "",
                  page: 1,
                });
              }}
              className="mt-5 rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {searchError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {searchError}
              </div>
            )}

            <div className="hidden md:block">
              <ProductTable
                products={
                  sortedProducts
                }
              />
            </div>

            <div className="grid gap-4 md:hidden">
              {sortedProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>

            <div className="mt-6">
              <Pagination
                page={page}
                limit={limit}
                total={
                  sortedProducts.length <
                  limit &&
                  page === 1
                    ? sortedProducts.length
                    : Math.max(
                        sortedProducts.length,
                        limit
                      )
                }
                onPageChange={
                  handlePageChange
                }
                onLimitChange={
                  handleLimitChange
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 px-4 py-8">
          <div className="mx-auto max-w-6xl rounded-xl bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              Loading products...
            </p>
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}