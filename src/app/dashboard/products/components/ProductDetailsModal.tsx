"use client";

// Define a type for the franchise pricing
interface FranchisePricing {
  franchiseId: string;
  price: number;
  discount: number;
}

// Define a type for the franchise reference
interface FranchiseReference {
  franchiseId: string;
  name?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  type: "veg" | "non-veg";
  category: "meal" | "plan";
  orderType: "one-time" | "subscription";
  subscriptionDetails?: {
    duration: "weekly" | "monthly";
    daysIncluded: string[];
  };
  timeOfDay: string;
  pricing: {
    basePrice: number;
    franchisePricing: FranchisePricing[];
  };
  availableAt: {
    allFranchises: boolean;
    specificFranchises: FranchiseReference[];
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

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  if (!isOpen || !product) return null;

  const formatDate = (dateString?: Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-4xl mx-4 p-6 overflow-y-auto max-h-90vh">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {product.name}
            </h2>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div className="text-sm font-medium text-gray-500">Type:</div>
                  <div className="text-sm text-gray-900">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.type === "veg"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.type === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Category:
                  </div>
                  <div className="text-sm text-gray-900 capitalize">
                    {product.category}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Order Type:
                  </div>
                  <div className="text-sm text-gray-900 capitalize">
                    {product.orderType}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Time of Day:
                  </div>
                  <div className="text-sm text-gray-900 capitalize">
                    {product.timeOfDay}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Base Price:
                  </div>
                  <div className="text-sm text-gray-900">
                    ₹{product.pricing.basePrice}
                  </div>
                </div>
              </div>

              {product.nutritionalInfo && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                    Nutritional Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      Calories:
                    </div>
                    <div className="text-sm text-gray-900">
                      {product.nutritionalInfo.calories || "N/A"}
                    </div>

                    <div className="text-sm font-medium text-gray-500">
                      Protein:
                    </div>
                    <div className="text-sm text-gray-900">
                      {product.nutritionalInfo.protein || "N/A"} g
                    </div>

                    <div className="text-sm font-medium text-gray-500">
                      Carbs:
                    </div>
                    <div className="text-sm text-gray-900">
                      {product.nutritionalInfo.carbs || "N/A"} g
                    </div>

                    <div className="text-sm font-medium text-gray-500">
                      Fat:
                    </div>
                    <div className="text-sm text-gray-900">
                      {product.nutritionalInfo.fat || "N/A"} g
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                  Dates
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    Created:
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(product.createdAt)}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Updated:
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(product.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Description and details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                    Ingredients
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.planItems && product.planItems.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                    Plan Items
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {product.planItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right column - Subscription, Pricing, Availability */}
            <div className="space-y-4">
              {product.orderType === "subscription" &&
                product.subscriptionDetails && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                      Subscription Details
                    </h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div className="text-sm font-medium text-gray-500">
                        Duration:
                      </div>
                      <div className="text-sm text-gray-900 capitalize">
                        {product.subscriptionDetails.duration}
                      </div>

                      <div className="text-sm font-medium text-gray-500">
                        Days Included:
                      </div>
                      <div className="text-sm text-gray-900">
                        {product.subscriptionDetails.daysIncluded.length > 0
                          ? product.subscriptionDetails.daysIncluded
                              .map((day) => day.substring(0, 3))
                              .join(", ")
                          : "None"}
                      </div>
                    </div>
                  </div>
                )}

              <div>
                <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                  Availability
                </h3>
                <div className="grid grid-cols-1 gap-y-2">
                  <div className="text-sm text-gray-900">
                    {product.availableAt.allFranchises
                      ? "Available at all franchises"
                      : `Available at ${product.availableAt.specificFranchises.length} franchises`}
                  </div>
                </div>
              </div>

              {product.pricing.franchisePricing &&
                product.pricing.franchisePricing.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">
                      Franchise-specific Pricing
                    </h3>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Franchise ID
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Discount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {product.pricing.franchisePricing.map(
                            (pricing, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-gray-900">
                                  {pricing.franchiseId.substring(0, 8)}...
                                </td>
                                <td className="px-3 py-2 text-gray-900">
                                  ₹{pricing.price}
                                </td>
                                <td className="px-3 py-2 text-gray-900">
                                  {pricing.discount}%
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
