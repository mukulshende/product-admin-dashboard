import api from "./axios";

// Login
export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });

  return response.data;
};

// Get products
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

// Search products
export const searchProducts = async (
  params = {},
  signal
) => {
  const response = await api.get("/products/search", {
    params,
    signal,
  });

  return response.data;
};

// Get categories
export const getCategories = async () => {
  const response = await api.get("/products/categories");

  return response.data;
};

// Get products by category
export const getProductsByCategory = async (category, params = {}) => {
  const response = await api.get(
    `/products/category/${encodeURIComponent(category)}`,
    {
      params,
    }
  );

  return response.data;
};

// Get single product
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

// Add product
export const addProduct = async (product) => {
  const response = await api.post("/products/add", product);

  return response.data;
};

// Update product
export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}`, product);

  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);

  return response.data;
};

// Get product reviews
export const getProductReviews = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data.reviews || [];
};