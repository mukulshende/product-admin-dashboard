"use client";

import { useRouter } from "next/navigation";

export default function ProductTable({ products }) {
  const router = useRouter();

  const openProduct = (id) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Image
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Title
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Category
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Price
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Rating
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Stock
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50"
              >
                {/* Image */}
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      openProduct(product.id)
                    }
                    className="cursor-pointer"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-16 w-16 rounded-lg object-cover transition hover:scale-105"
                    />
                  </button>
                </td>

                {/* Title */}
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      openProduct(product.id)
                    }
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {product.title}
                  </button>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-6 py-4 font-medium">
                  ${product.price}
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  ⭐ {product.rating}
                </td>

                {/* Stock */}
                <td className="px-6 py-4">
                  {product.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}