"use client";

import { useState, useEffect } from "react";

interface FranchiseType {
  _id: string;
  name: string;
}

// First, define the Product interface (same as in AddProductModal)
interface Product {
  _id: string; // Adding this since you're accessing product._id in your code
  name: string;
  description: string;
  type: string;
  category: string;
  orderType: string;
  subscriptionDetails: {
    duration: string;
    daysIncluded: string[];
  };
  timeOfDay: string;
  pricing: {
    basePrice: number;
    franchisePricing: Array<{
      franchiseId: string;
      price: number;
      discount: number;
    }>;
  };
  availableAt: {
    allFranchises: boolean;
    specificFranchises: string[];
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary?: boolean;
  }>;
  isActive: boolean;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  planItems: string[];
}

// Then update the props interface
interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: EditProductModalProps) {
  const [franchises, setFranchises] = useState<FranchiseType[]>([]);
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    type: product.type || "veg",
    category: product.category || "meal",
    orderType: product.orderType || "one-time",
    subscriptionDetails: {
      duration: product.subscriptionDetails?.duration || "weekly",
      daysIncluded: product.subscriptionDetails?.daysIncluded || [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
    },
    timeOfDay: product.timeOfDay || "all-day",
    pricing: {
      basePrice: product.pricing?.basePrice || 0,
      franchisePricing: product.pricing?.franchisePricing || [],
    },
    availableAt: {
      allFranchises: product.availableAt?.allFranchises ?? true,
      specificFranchises: product.availableAt?.specificFranchises || [],
    },
    images: product.images || [],
    isActive: product.isActive ?? true,
    nutritionalInfo: product.nutritionalInfo || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    ingredients: product.ingredients || [],
    planItems: product.planItems || [],
  });

  const [step, setStep] = useState(1);
  const [showFranchisePricing, setShowFranchisePricing] = useState(false);
  const [newPlanItem, setNewPlanItem] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const response = await fetch("/api/franchise");
        if (!response.ok) {
          throw new Error("Failed to fetch franchises");
        }
        const data = await response.json();
        setFranchises(data);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      }
    };

    fetchFranchises();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubscriptionDaysChange = (day) => {
    const currentDays = formData.subscriptionDetails.daysIncluded;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    setFormData({
      ...formData,
      subscriptionDetails: {
        ...formData.subscriptionDetails,
        daysIncluded: newDays,
      },
    });
  };

  const handleFranchiseSelection = (franchiseId) => {
    const { specificFranchises } = formData.availableAt;
    const newSelection = specificFranchises.includes(franchiseId)
      ? specificFranchises.filter((id) => id !== franchiseId)
      : [...specificFranchises, franchiseId];

    setFormData({
      ...formData,
      availableAt: {
        ...formData.availableAt,
        specificFranchises: newSelection,
      },
    });
  };

  const handleFranchisePricingChange = (franchiseId, field, value) => {
    const existingPriceIndex = formData.pricing.franchisePricing.findIndex(
      (item) => item.franchiseId === franchiseId
    );

    const updatedPricing = [...formData.pricing.franchisePricing];

    if (existingPriceIndex >= 0) {
      updatedPricing[existingPriceIndex] = {
        ...updatedPricing[existingPriceIndex],
        [field]: value,
      };
    } else {
      updatedPricing.push({
        franchiseId,
        price: field === "price" ? value : formData.pricing.basePrice,
        discount: field === "discount" ? value : 0,
      });
    }

    setFormData({
      ...formData,
      pricing: {
        ...formData.pricing,
        franchisePricing: updatedPricing,
      },
    });
  };

  const handleAddPlanItem = () => {
    if (newPlanItem.trim()) {
      setFormData({
        ...formData,
        planItems: [...formData.planItems, newPlanItem.trim()],
      });
      setNewPlanItem("");
    }
  };

  const handleRemovePlanItem = (index) => {
    const updatedItems = [...formData.planItems];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      planItems: updatedItems,
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only process form submission on the final step
    if (step !== 3) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      onSave();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated navigation functions to prevent form submission
  const nextStep = (e) => {
    e.preventDefault(); // Prevent form submission
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault(); // Prevent form submission
    setStep(step - 1);
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-3xl mx-4 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Edit Product
          </h2>

          <div className="mb-6 flex justify-between">
            <div
              className={`w-1/3 h-1 ${
                step >= 1 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-1/3 h-1 ${
                step >= 2 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-1/3 h-1 ${
                step >= 3 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    >
                      <option value="meal">Meal</option>
                      <option value="plan">Plan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Type
                    </label>
                    <select
                      name="orderType"
                      value={formData.orderType}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    >
                      <option value="one-time">One-time</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time of Day
                    </label>
                    <select
                      name="timeOfDay"
                      value={formData.timeOfDay}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    >
                      <option value="all-day">All Day</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    name="pricing.basePrice"
                    value={formData.pricing.basePrice}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    min="0"
                    required
                  />
                </div>

                {formData.orderType === "subscription" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Subscription Duration
                      </label>
                      <select
                        name="subscriptionDetails.duration"
                        value={formData.subscriptionDetails.duration}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Days Included
                      </label>
                      <div className="mt-1 grid grid-cols-7 gap-2">
                        {days.map((day) => (
                          <div key={day} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`edit-${day}`}
                              checked={formData.subscriptionDetails.daysIncluded.includes(
                                day
                              )}
                              onChange={() => handleSubscriptionDaysChange(day)}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`edit-${day}`}
                              className="ml-2 text-sm text-gray-700 capitalize"
                            >
                              {day.substring(0, 3)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Availability */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="edit-allFranchises"
                      name="availableAt.allFranchises"
                      checked={formData.availableAt.allFranchises}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="edit-allFranchises"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Available at all franchises
                    </label>
                  </div>

                  {!formData.availableAt.allFranchises && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Specific Franchises
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {franchises.map((franchise) => (
                          <div
                            key={franchise._id}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              id={`edit-franchise-${franchise._id}`}
                              checked={formData.availableAt.specificFranchises.includes(
                                franchise._id
                              )}
                              onChange={() =>
                                handleFranchiseSelection(franchise._id)
                              }
                              className="h-4 w-4 text-green-600 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`edit-franchise-${franchise._id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {franchise.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Franchise-specific Pricing
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowFranchisePricing(!showFranchisePricing)
                      }
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {showFranchisePricing ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showFranchisePricing && (
                    <div className="border border-gray-300 rounded-md p-4 mb-4">
                      <div className="text-xs text-gray-500 mb-3">
                        Set specific prices and discounts for individual
                        franchises. If not specified, the base price will be
                        used.
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {franchises.map((franchise) => {
                          const franchisePricing =
                            formData.pricing.franchisePricing.find(
                              (fp) => fp.franchiseId === franchise._id
                            );
                          return (
                            <div
                              key={franchise._id}
                              className="grid grid-cols-3 gap-3 items-center"
                            >
                              <div className="text-sm font-medium">
                                {franchise.name}
                              </div>
                              <div>
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={franchisePricing?.price || ""}
                                  onChange={(e) =>
                                    handleFranchisePricingChange(
                                      franchise._id,
                                      "price",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  min="0"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  placeholder="Discount %"
                                  value={franchisePricing?.discount || ""}
                                  onChange={(e) =>
                                    handleFranchisePricingChange(
                                      franchise._id,
                                      "discount",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Final Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nutritional Information (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs text-gray-500">
                        Calories
                      </label>
                      <input
                        type="number"
                        name="nutritionalInfo.calories"
                        value={formData.nutritionalInfo?.calories || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        name="nutritionalInfo.protein"
                        value={formData.nutritionalInfo?.protein || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        name="nutritionalInfo.carbs"
                        value={formData.nutritionalInfo?.carbs || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">
                        Fat (g)
                      </label>
                      <input
                        type="number"
                        name="nutritionalInfo.fat"
                        value={formData.nutritionalInfo?.fat || ""}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* New Ingredients Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Add an ingredient"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black placeholder-black"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.ingredients.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 mt-2 max-h-40 overflow-y-auto">
                      {formData.ingredients.map((ingredient, index) => (
                        <li
                          key={index}
                          className="py-2 px-3 flex justify-between items-center text-black"
                        >
                          <span className="text-sm">{ingredient}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
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
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500 mt-2">
                      No ingredients added yet.
                    </div>
                  )}
                </div>

                {formData.category === "plan" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Items
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newPlanItem}
                        onChange={(e) => setNewPlanItem(e.target.value)}
                        placeholder="Add an item included in this plan"
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                      <button
                        type="button"
                        onClick={handleAddPlanItem}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.planItems.length > 0 ? (
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 mt-2 max-h-40 overflow-y-auto">
                        {formData.planItems.map((item, index) => (
                          <li
                            key={index}
                            className="py-2 px-3 flex justify-between items-center"
                          >
                            <span className="text-sm">{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePlanItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
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
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500 mt-2">
                        No items added yet. Add items that are included in this
                        plan.
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Status
                    </label>
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="edit-isActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Set as active
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive products will not be visible to customers
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {isSubmitting ? "Saving..." : "Update Product"}
                </button>
              )}
            </div>
          </form>

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
