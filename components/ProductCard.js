"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const router = useRouter();

  if (!product) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div
        className="cursor-pointer"
        onClick={() => router.push("/products/" + product.id)}
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={300}
          height={220}
          className="h-48 w-full rounded-lg object-cover"
        />

        <h2 className="mt-4 text-lg font-semibold text-gray-800">
          {product.title}
        </h2>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Category:</span>{" "}
          {product.category}
        </p>

        <p>
          <span className="font-medium">Price:</span>{" "}
          ${product.price}
        </p>

        <p>
          <span className="font-medium">Rating:</span>{" "}
          ⭐ {product.rating}
        </p>

        <p>
          <span className="font-medium">Stock:</span>{" "}
          {product.stock}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push("/products/" + product.id)
        }
        className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        View Details
      </button>
    </div>
  );
}