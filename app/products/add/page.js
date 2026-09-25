"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "../../../lib/api";
import { addLocalProduct } from "../../../lib/productStore";

export default function AddProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent multiple requests
    if (saving) {
      return;
    }

    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      setError("Please enter a valid stock.");
      return;
    }

    try {
      setSaving(true);

      const product = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description.trim(),
      };

      // Send product to DummyJSON
      const response = await addProduct(product);

      console.log("Added product from API:", response);

      /*
        DummyJSON does not permanently save
        the new product.

        Therefore we also save it in localStorage.
      */
      const localProduct = {
        ...response,
        ...product,
      };

      addLocalProduct(localProduct);

      alert("Product added successfully!");

      router.push("/products");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/products")}
          disabled={saving}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-900 disabled:opacity-50"
        >
          ← Back to Products
        </button>

        <div className="rounded-xl bg-white p-6 shadow md:p-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="mb-6 text-gray-500">
            Add a new product to the dashboard
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block font-medium text-gray-700"
              >
                Product Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-medium text-gray-700"
              >
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="mb-2 block font-medium text-gray-700"
              >
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="mb-2 block font-medium text-gray-700"
              >
                Stock
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/products")}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>

          {/* DummyJSON Note */}
          <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">
              Note
            </p>

            <p className="mt-1">
              DummyJSON simulates product creation.
              The product is also stored locally in
              the browser so the change can remain
              visible after refresh.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}