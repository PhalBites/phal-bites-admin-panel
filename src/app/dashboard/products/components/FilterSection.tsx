"use client";

import { useState, useEffect } from "react";

// Define a type for the filters object
interface Filters {
  type: string;
  category: string;
  orderType: string;
  franchise: string;
}

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterSection({
  filters,
  onFilterChange,
}: FilterSectionProps) {
  const [franchises, setFranchises] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFranchises = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/franchise");
        if (!response.ok) {
          throw new Error("Failed to fetch franchises");
        }
        const data = await response.json();
        setFranchises(data);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFranchises();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      type: "",
      category: "",
      orderType: "",
      franchise: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">All Types</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">All Categories</option>
            <option value="meal">Meal</option>
            <option value="plan">Plan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Type
          </label>
          <select
            name="orderType"
            value={filters.orderType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">All Order Types</option>
            <option value="one-time">One-time</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise
          </label>
          <select
            name="franchise"
            value={filters.franchise}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            disabled={isLoading}
          >
            <option value="">All Franchises</option>
            {franchises.map((franchise) => (
              <option key={franchise._id} value={franchise._id}>
                {franchise.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
