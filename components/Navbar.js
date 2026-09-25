"use client";

import { useRouter } from "next/navigation";

export default function Navbar({ onLogout }) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/");
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        
        {/* Logo / App Name */}
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-xl font-bold text-blue-600 hover:text-blue-700"
        >
          Product Admin
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => router.push("/products/add")}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Add Product
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}