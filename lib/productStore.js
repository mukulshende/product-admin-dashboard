// Get deleted product IDs
export const getDeletedProductIds = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem("deletedProducts") || "[]"
    );
  } catch (error) {
    console.error("Failed to read deleted products:", error);
    return [];
  }
};

// Save deleted product IDs
export const saveDeletedProductIds = (ids) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    "deletedProducts",
    JSON.stringify(ids)
  );
};

// Add one product ID to deleted list
export const addDeletedProductId = (id) => {
  const deletedIds = getDeletedProductIds();

  const numericId = Number(id);

  if (!deletedIds.includes(numericId)) {
    deletedIds.push(numericId);
  }

  saveDeletedProductIds(deletedIds);
};

// Get added products
export const getAddedProducts = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      localStorage.getItem("addedProducts") || "[]"
    );
  } catch (error) {
    console.error("Failed to read added products:", error);
    return [];
  }
};

// Save added products
export const saveAddedProducts = (products) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    "addedProducts",
    JSON.stringify(products)
  );
};

// Add a new product to local storage
export const addLocalProduct = (product) => {
  const products = getAddedProducts();

  products.push(product);

  saveAddedProducts(products);
};

// Get updated products
export const getUpdatedProducts = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(
      localStorage.getItem("updatedProducts") || "{}"
    );
  } catch (error) {
    console.error("Failed to read updated products:", error);
    return {};
  }
};

// Save updated product
export const saveUpdatedProduct = (product) => {
  const updatedProducts = getUpdatedProducts();

  updatedProducts[product.id] = product;

  if (typeof window !== "undefined") {
    localStorage.setItem(
      "updatedProducts",
      JSON.stringify(updatedProducts)
    );
  }
};

// Apply local changes to API products
export const applyLocalChanges = (products) => {
  const deletedIds = getDeletedProductIds();
  const updatedProducts = getUpdatedProducts();

  // Remove deleted products
  let result = products.filter(
    (product) =>
      !deletedIds.includes(Number(product.id))
  );

  // Apply edited product data
  result = result.map((product) => {
    const updatedProduct =
      updatedProducts[product.id];

    if (updatedProduct) {
      return {
        ...product,
        ...updatedProduct,
      };
    }

    return product;
  });

  return result;
};