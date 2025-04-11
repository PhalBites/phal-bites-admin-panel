"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "../../../../lib/redux/hooks";
import AddProductModal from "./components/AddProductModal";
import FilterSection from "./components/FilterSection";
import ProductsTable from "./components/ProductsTable";

// Import Product interface or define it here
interface Product {
  _id: string;
  name: string;
  description: string;
  type: "veg" | "non-veg";
  category: string;
  orderType: string;
  subscriptionDetails?: {
    duration: "weekly" | "monthly";
    daysIncluded: string[];
  };
  timeOfDay: string;
  pricing: {
    basePrice: number;
    franchisePricing: {
      franchiseId: string;
      price: number;
      discount: number;
    }[];
  };
  availableAt: {
    allFranchises: boolean;
    specificFranchises: string[];
  };
  images: string[];
  isActive: boolean;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients?: string[];
  planItems?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define types for new product and filters
type NewProduct = Omit<Product, "_id" | "createdAt" | "updatedAt">;

interface ProductFilters {
  type: string;
  category: string;
  orderType: string;
  franchise: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    type: "",
    category: "",
    orderType: "",
    franchise: "",
  });

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.orderType) queryParams.append("orderType", filters.orderType);
      if (filters.franchise) queryParams.append("franchise", filters.franchise);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, fetchProducts]);

  const handleAddProduct = async (newProduct: NewProduct) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      fetchProducts();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    }
  };

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products & Plans</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Add New Product
        </button>
      </div>

      <FilterSection filters={filters} onFilterChange={handleFilterChange} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <ProductsTable products={products} onRefresh={fetchProducts} />
      )}

      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}
    </div>
  );
}
