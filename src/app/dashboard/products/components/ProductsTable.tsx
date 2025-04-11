// ProductsTable.tsx
"use client";

import { useState } from "react";
import EditProductModal from "./EditProductModal";
import ProductDetailsModal from "./ProductDetailsModal";

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
    specificFranchises: string[]; // Changed from any[] to string[]
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

interface ProductsTableProps {
  products: Product[];
  onRefresh: () => void;
}

export default function ProductsTable({
  products,
  onRefresh,
}: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        onRefresh();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const formatAvailability = (product: Product) => {
    if (product.availableAt.allFranchises) {
      return "All Franchises";
    }
    return `${product.availableAt.specificFranchises.length} Franchises`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time of Day
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Base Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(product)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {product.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.type === "veg"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.type === "veg" ? "Veg" : "Non-Veg"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {product.orderType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {product.timeOfDay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{product.pricing.basePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatAvailability(product)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  onClick={(e) => e.stopPropagation()} // Prevent row click event from triggering
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(product);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={() => {
            onRefresh();
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isDetailsModalOpen && selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
