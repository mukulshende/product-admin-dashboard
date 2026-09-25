"use client";

import { useRouter } from "next/navigation";

export default function ProductCard({ products }) {
  const router = useRouter();

  const openProduct = (id) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className="grid gap-4 md:hidden">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-xl bg-white p-5 shadow"
        >
          {/* Image */}
          <button
            onClick={() =>
              openProduct(product.id)
            }
            className="mb-4 block w-full"
          >
            <img
              src={product.thumbnail}
              alt={product.title}
              className="mx-auto h-40 w-full rounded-lg object-contain transition hover:scale-105"
            />
          </button>

          {/* Title */}
          <button
            onClick={() =>
              openProduct(product.id)
            }
            className="text-left text-lg font-bold text-blue-600 hover:underline"
          >
            {product.title}
          </button>

          {/* Category */}
          <div className="mt-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {product.category}
            </span>
          </div>

          {/* Price */}
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Price
            </p>

            <p className="text-xl font-bold text-green-600">
              ${product.price}
            </p>
          </div>

          {/* Rating */}
          <div className="mt-3">
            <span className="font-medium">
              Rating:
            </span>{" "}
            ⭐ {product.rating}
          </div>

          {/* Stock */}
          <div className="mt-2">
            <span className="font-medium">
              Stock:
            </span>{" "}
            {product.stock}
          </div>

          {/* Details Button */}
          <button
            onClick={() =>
              openProduct(product.id)
            }
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}