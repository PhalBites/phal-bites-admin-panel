"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FranchiseMap } from "./FranchiseMap";
import { DeliveryZone } from "../../../../../lib/DeliveryZone";

export function FranchiseForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    contact: {
      phone: "",
      email: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zones, setZones] = useState<DeliveryZone[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes("contact.")) {
      const contactField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!location) {
      setError("Please set the franchise location on the map");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/franchise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          contact: {
            phone: formData.contact.phone,
            email: formData.contact.email,
          },
          contactNumber: formData.contact.phone,
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          deliveryZones: zones.map((zone) => ({
            name: zone.name,
            zoneType: zone.zoneType,
            deliveryFee: zone.deliveryFee,
            area: {
              type: "Polygon",
              coordinates: [
                zone.coordinates.map((coord) => [coord.lng, coord.lat]),
              ],
            },
          })),
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create franchise");
      }

      router.push("/dashboard/components/franchise");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create franchise"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-black">Add New Franchise</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSubmitBasicInfo} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block mb-2 font-medium text-gray-700"
              >
                Franchise Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block mb-2 font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block mb-2 font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block mb-2 font-medium text-gray-700"
              >
                State
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select state</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="contact.phone"
                className="block mb-2 font-medium text-gray-700"
              >
                Contact Phone
              </label>
              <input
                id="contact.phone"
                name="contact.phone"
                type="tel"
                value={formData.contact.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="contact.email"
                className="block mb-2 font-medium text-gray-700"
              >
                Contact Email
              </label>
              <input
                id="contact.email"
                name="contact.email"
                type="email"
                value={formData.contact.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
            >
              Next: Set Delivery Zones
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">{formData.name}</h3>
            <p className="text-blue-600">
              {formData.address}, {formData.city}, {formData.state}
            </p>
          </div>

          <FranchiseMap
            city={formData.city}
            onLocationSet={setLocation}
            onZonesSet={setZones}
          />

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 font-medium rounded-md hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
            >
              {loading ? "Creating..." : "Create Franchise"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
