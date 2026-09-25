"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getProductById,
  updateProduct,
} from "../../../../lib/api";

import {
  getAddedProducts,
  getDeletedProductIds,
  getUpdatedProducts,
  saveUpdatedProduct,
} from "../../../../lib/productStore";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
    Load product
  */

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

        /*
          Check deleted products
        */

        const deletedIds =
          getDeletedProductIds();

        if (
          deletedIds.includes(
            Number(productId)
          )
        ) {
          setError(
            "Product not found."
          );

          setLoading(false);
          return;
        }

        /*
          Check locally updated products
        */

        const updatedProducts =
          getUpdatedProducts();

        const localUpdatedProduct =
          updatedProducts[productId];

        /*
          Check locally added products
        */

        const addedProducts =
          getAddedProducts();

        const localAddedProduct =
          addedProducts.find(
            (product) =>
              Number(product.id) ===
              Number(productId)
          );

        /*
          If locally updated product exists,
          use it directly.
        */

        if (localUpdatedProduct) {
          setFormData({
            title:
              localUpdatedProduct.title ||
              "",
            category:
              localUpdatedProduct.category ||
              "",
            price:
              localUpdatedProduct.price !==
              undefined
                ? String(
                    localUpdatedProduct.price
                  )
                : "",
            stock:
              localUpdatedProduct.stock !==
              undefined
                ? String(
                    localUpdatedProduct.stock
                  )
                : "",
            description:
              localUpdatedProduct.description ||
              "",
          });

          setLoading(false);
          return;
        }

        /*
          If product was locally added,
          use local product.
        */

        if (localAddedProduct) {
          setFormData({
            title:
              localAddedProduct.title ||
              "",
            category:
              localAddedProduct.category ||
              "",
            price:
              localAddedProduct.price !==
              undefined
                ? String(
                    localAddedProduct.price
                  )
                : "",
            stock:
              localAddedProduct.stock !==
              undefined
                ? String(
                    localAddedProduct.stock
                  )
                : "",
            description:
              localAddedProduct.description ||
              "",
          });

          setLoading(false);
          return;
        }

        /*
          Otherwise load from API
        */

        const data =
          await getProductById(
            productId
          );

        setFormData({
          title: data.title || "",
          category: data.category || "",
          price:
            data.price !== undefined
              ? String(data.price)
              : "",
          stock:
            data.stock !== undefined
              ? String(data.stock)
              : "",
          description:
            data.description || "",
        });
      } catch (error) {
        console.error(error);

        if (
          error.response?.status === 404
        ) {
          setError(
            "Product not found."
          );
        } else {
          setError(
            "Failed to load product."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  /*
    Handle input
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
    Submit
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /*
      Prevent rapid multiple clicks
    */

    if (saving) {
      return;
    }

    setError("");

    /*
      Validation
    */

    if (!formData.title.trim()) {
      setError(
        "Product title is required."
      );
      return;
    }

    if (!formData.category.trim()) {
      setError(
        "Category is required."
      );
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      setError(
        "Please enter a valid stock."
      );
      return;
    }

    try {
      setSaving(true);

      const product = {
        title: formData.title.trim(),
        category:
          formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description:
          formData.description.trim(),
      };

      /*
        Update DummyJSON
      */

      let response = {};

      try {
        response =
          await updateProduct(
            productId,
            product
          );
      } catch (apiError) {
        /*
          We still keep the local change
          if API mutation fails because
          DummyJSON mutations are simulated.
        */

        console.error(
          "API update failed:",
          apiError
        );
      }

      /*
        Merge API response + form data
      */

      const updatedProduct = {
        ...response,
        ...product,
        id: Number(productId),
      };

      /*
        Save permanently in browser storage
      */

      saveUpdatedProduct(
        updatedProduct
      );

      alert(
        "Product updated successfully!"
      );

      router.push(
        `/products/${productId}`
      );
    } catch (error) {
      console.error(error);

      setError(
        "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
    Loading
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 text-center shadow">
          <p className="text-gray-600">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  /*
    Error
  */

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-10 text-center shadow">

          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error}
          </p>

          <button
            onClick={() =>
              router.push("/products")
            }
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

      <div className="mx-auto max-w-3xl">

        {/* Back */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/products/${productId}`
            )
          }
          disabled={saving}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-900 disabled:opacity-50"
        >
          ← Back to Product
        </button>

        <div className="rounded-xl bg-white p-6 shadow md:p-8">

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Edit Product
          </h1>

          <p className="mb-6 text-gray-500">
            Update product information
          </p>

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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}

            <div className="flex gap-3 pt-4">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/products/${productId}`
                  )
                }
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
                {saving
                  ? "Updating..."
                  : "Update Product"}
              </button>

            </div>

          </form>

          <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">
              Local Persistence
            </p>

            <p className="mt-1">
              Updated product information is
              stored in browser localStorage so
              the changes remain visible after
              refreshing the page.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}