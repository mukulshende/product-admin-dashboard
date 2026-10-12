
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  deleteProduct,
  getProductById,
} from "../../../lib/api";

import {
  getAddedProducts,
  getDeletedProductIds,
  getUpdatedProducts,
  addDeletedProductId,
} from "../../../lib/productStore";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const numericId = Number(productId);
        const deletedIds = getDeletedProductIds();

        if (deletedIds.includes(numericId)) {
          setError("Product not found.");
          setProduct(null);
          return;
        }

        const addedProducts = getAddedProducts();

        const localAddedProduct = addedProducts.find(
          (item) => Number(item.id) === numericId
        );

        const updatedProducts = getUpdatedProducts();
        const localUpdatedProduct =
          updatedProducts[String(productId)];

        // Locally added products use localStorage as their source.
        if (localAddedProduct) {
          const finalProduct = localUpdatedProduct
            ? { ...localAddedProduct, ...localUpdatedProduct, id: numericId }
            : localAddedProduct;

          setProduct(finalProduct);
          return;
        }

        // Existing API products retain their previous loading behavior.
        if (localUpdatedProduct) {
          let apiProduct = {};

          try {
            apiProduct = await getProductById(productId);
          } catch (apiError) {
            console.error("API product loading failed:", apiError);
          }

          setProduct({
            ...apiProduct,
            ...localUpdatedProduct,
            id: numericId,
          });
          return;
        }

        const data = await getProductById(productId);

        if (!data) {
          setError("Product not found.");
          setProduct(null);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 404) {
          setError("Product not found.");
        } else {
          setError("Failed to load product.");
        }

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const addedProducts = getAddedProducts();

      const isLocalProduct = addedProducts.some(
        (item) => Number(item.id) === Number(productId)
      );

      // Only existing API products need an API delete request.
      if (!isLocalProduct) {
        await deleteProduct(productId);
      }

      // Mark both local and API products as deleted locally.
      addDeletedProductId(productId);

      alert("Product deleted successfully!");
      router.push("/products");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-10 text-center shadow">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-10 text-center shadow">
          <div className="mb-4 text-5xl">⚠️</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "The requested product does not exist."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            ← Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/products")}
          disabled={deleting}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-900 disabled:opacity-50"
        >
          ← Back to Products
        </button>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center rounded-xl bg-gray-50 p-6">
              <img
                src={product.images?.[0] || product.thumbnail || ""}
                alt={product.title || "Product"}
                className="max-h-[450px] w-full object-contain"
              />
            </div>

            {/* Product Information */}
            <div>
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {product.category}
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              {product.brand && (
                <p className="mt-2 text-gray-500">
                  Brand:{" "}
                  <span className="font-medium text-gray-700">
                    {product.brand}
                  </span>
                </p>
              )}

              {/* Price */}
              <div className="mt-6">
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-4xl font-bold text-green-600">
                  ${product.price}
                </p>
              </div>

              {/* Rating and Stock */}
              <div className="mt-5 flex flex-wrap gap-4">
                <div className="rounded-lg bg-yellow-50 px-4 py-3">
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-bold text-gray-900">
                    ⭐ {product.rating ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-3">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-bold text-gray-900">
                    {product.stock ?? "N/A"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
                <p className="mt-2 leading-7 text-gray-600">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Extra Information */}
              <div className="mt-6 space-y-2 text-sm">
                {product.sku && (
                  <p>
                    <span className="font-semibold">SKU:</span>{" "}
                    {product.sku}
                  </p>
                )}

                {product.warrantyInformation && (
                  <p>
                    <span className="font-semibold">Warranty:</span>{" "}
                    {product.warrantyInformation}
                  </p>
                )}

                {product.shippingInformation && (
                  <p>
                    <span className="font-semibold">Shipping:</span>{" "}
                    {product.shippingInformation}
                  </p>
                )}

                {product.availabilityStatus && (
                  <p>
                    <span className="font-semibold">Availability:</span>{" "}
                    {product.availabilityStatus}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/products/${productId}/edit`)
                  }
                  disabled={deleting}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  ✏️ Edit Product
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Product"}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="mt-5 space-y-4">
                {product.reviews.map((review, index) => (
                  <div
                    key={`${review.reviewerEmail || "review"}-${index}`}
                    className="rounded-lg border bg-gray-50 p-5"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-gray-900">
                        {review.reviewerName || "Customer"}
                      </p>

                      <p className="text-sm">⭐ {review.rating}</p>
                    </div>

                    <p className="mt-3 text-gray-600">
                      {review.comment}
                    </p>

                    {review.date && (
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-500">
                No reviews available.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
