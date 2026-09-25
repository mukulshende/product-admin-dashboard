const DELETED_KEY = "deletedProducts";
const ADDED_KEY = "addedProducts";
const UPDATED_KEY = "updatedProducts";

// Get deleted product IDs
export const getDeletedProductIds = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(DELETED_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Add product ID to deleted list
export const addDeletedProductId = (id) => {
  if (typeof window === "undefined") {
    return;
  }

  const deletedIds = getDeletedProductIds();
  const numericId = Number(id);

  if (!deletedIds.includes(numericId)) {
    deletedIds.push(numericId);
  }

  localStorage.setItem(
    DELETED_KEY,
    JSON.stringify(deletedIds)
  );
};

// Get locally added products
export const getAddedProducts = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(ADDED_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Save locally added product
export const addAddedProduct = (product) => {
  if (typeof window === "undefined") {
    return;
  }

  const products = getAddedProducts();

  products.push(product);

  localStorage.setItem(
    ADDED_KEY,
    JSON.stringify(products)
  );
};

// Old function name used by Add Product page
export const addLocalProduct = (product) => {
  addAddedProduct(product);
};

// Get locally updated products
export const getUpdatedProducts = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const data = localStorage.getItem(UPDATED_KEY);

    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error(error);
    return {};
  }
};

// Save updated product
export const addUpdatedProduct = (id, product) => {
  if (typeof window === "undefined") {
    return;
  }

  const updatedProducts = getUpdatedProducts();

  updatedProducts[String(id)] = product;

  localStorage.setItem(
    UPDATED_KEY,
    JSON.stringify(updatedProducts)
  );
};

// Old function name used by Edit Product page
export const saveUpdatedProduct = (id, product) => {
  addUpdatedProduct(id, product);
};

// Apply local changes to API products
export const applyLocalChanges = (
  products,
  deletedIds,
  addedProducts,
  updatedProducts
) => {
  let result = [...(products || [])];

  // Remove deleted products
  result = result.filter(
    (product) =>
      !deletedIds.includes(Number(product.id))
  );

  // Apply updated products
  result = result.map((product) => {
    const updated =
      updatedProducts[String(product.id)];

    if (updated) {
      return {
        ...product,
        ...updated,
      };
    }

    return product;
  });

  // Add locally created products
  const existingIds = new Set(
    result.map((product) => Number(product.id))
  );

  const localProducts = (
    addedProducts || []
  ).filter(
    (product) =>
      !deletedIds.includes(Number(product.id)) &&
      !existingIds.has(Number(product.id))
  );

  result = [
    ...localProducts,
    ...result,
  ];

  return result;
};

// Old function name used by Products page
export const applyLocalProductChanges = (
  products,
  deletedIds,
  addedProducts,
  updatedProducts
) => {
  return applyLocalChanges(
    products,
    deletedIds,
    addedProducts,
    updatedProducts
  );
};