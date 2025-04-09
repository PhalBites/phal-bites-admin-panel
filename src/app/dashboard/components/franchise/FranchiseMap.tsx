"use client";

import { useEffect, useRef, useState } from "react";
import { mapsLoader } from "../../../../../lib/maps-loader";
import { Loader } from "@googlemaps/js-api-loader";

type ZoneType = "free" | "paid";

interface DeliveryZone {
  name: string;
  zoneType: ZoneType;
  deliveryFee?: number;
  coordinates: google.maps.LatLngLiteral[];
}

export function FranchiseMap({
  city,
  onLocationSet,
  onZonesSet,
}: {
  city: string;
  onLocationSet: (location: { lat: number; lng: number }) => void;
  onZonesSet: (zones: DeliveryZone[]) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentZoneType, setCurrentZoneType] = useState<ZoneType>("free");
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyD_xex28kszrej4Al0WtKbn3cQaMkxCpVY",
      version: "weekly",
      libraries: ["drawing", "places"],
    });

    mapsLoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          const location = results[0].geometry.location;
          const newMap = new google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
          });

          const searchBox = new google.maps.places.SearchBox(
            searchInputRef.current!
          );

          newMap.addListener("bounds_changed", () => {
            searchBox.setBounds(newMap.getBounds()!);
          });

          searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();
            if (places?.length === 0) return;

            // Recenter map to first place
            const bounds = new google.maps.LatLngBounds();
            places?.forEach((place) => {
              if (!place.geometry?.location) return;
              bounds.extend(place.geometry.location);

              if (place.geometry.viewport) {
                newMap.fitBounds(place.geometry.viewport);
              } else {
                newMap.setCenter(place.geometry.location);
                newMap.setZoom(17);
              }
            });
          });

          setMap(newMap);

          // Initialize drawing manager
          const newDrawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
              fillColor: currentZoneType === "free" ? "#3b82f6" : "#10b981",
              fillOpacity: 0.4,
              strokeWeight: 2,
              clickable: false,
              editable: true,
              zIndex: 1,
            },
          });

          newDrawingManager.setMap(newMap);
          setDrawingManager(newDrawingManager);

          // Add marker for franchise location
          const newMarker = new google.maps.Marker({
            position: location,
            map: newMap,
            draggable: true,
            title: "Franchise Location",
          });

          setMarker(newMarker);
          onLocationSet({ lat: location.lat(), lng: location.lng() });

          // Listen for marker drag end
          newMarker.addListener("dragend", () => {
            const position = newMarker.getPosition();
            if (position) {
              onLocationSet({ lat: position.lat(), lng: position.lng() });
            }
          });

          // Listen for polygon complete
          google.maps.event.addListener(
            newDrawingManager,
            "polygoncomplete",
            (polygon: google.maps.Polygon) => {
              const path = polygon.getPath();
              const coordinates: google.maps.LatLngLiteral[] = [];

              path.getArray().forEach((latLng) => {
                coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
              });

              const newZone: DeliveryZone = {
                name: `${currentZoneType === "free" ? "Free" : "Paid"} Zone ${
                  zones.length + 1
                }`,
                zoneType: currentZoneType,
                deliveryFee:
                  currentZoneType === "paid" ? deliveryFee : undefined,
                coordinates,
              };

              const updatedZones = [...zones, newZone];
              setZones(updatedZones);
              setPolygons((prev) => [...prev, polygon]);
              onZonesSet(updatedZones);

              // Change polygon style based on zone type
              polygon.setOptions({
                fillColor: currentZoneType === "free" ? "#3b82f6" : "#10b981",
                strokeColor: currentZoneType === "free" ? "#1d4ed8" : "#059669",
              });

              // Listen for edits
              polygon
                .getPath()
                .addListener("set_at", () => updateZone(polygon, newZone));
              polygon
                .getPath()
                .addListener("insert_at", () => updateZone(polygon, newZone));
              polygon.addListener("rightclick", (e: any) => {
                if (e.vertex !== undefined) {
                  path.removeAt(e.vertex);
                  updateZone(polygon, newZone);
                }
              });
            }
          );
        }
      });
    });

    return () => {
      polygons.forEach((polygon) => {
        google.maps.event.clearInstanceListeners(polygon);
        polygon.setMap(null);
      });
      if (marker) marker.setMap(null);
      if (drawingManager) drawingManager.setMap(null);
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [city, currentZoneType]);

  const updateZone = (polygon: google.maps.Polygon, zone: DeliveryZone) => {
    const path = polygon.getPath();
    const coordinates: google.maps.LatLngLiteral[] = [];

    path.getArray().forEach((latLng) => {
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    });

    const updatedZones = zones.map((z) => {
      if (z.name === zone.name) {
        return { ...z, coordinates };
      }
      return z;
    });

    setZones(updatedZones);
    onZonesSet(updatedZones);
  };

  const handleZoneTypeChange = (type: ZoneType) => {
    setCurrentZoneType(type);
    if (drawingManager) {
      drawingManager.setOptions({
        polygonOptions: {
          fillColor: type === "free" ? "#3b82f6" : "#10b981",
          strokeColor: type === "free" ? "#1d4ed8" : "#059669",
        },
      });
    }
  };

  const removeZone = (index: number) => {
    const newZones = [...zones];
    newZones.splice(index, 1);
    setZones(newZones);

    const polygon = polygons[index];
    if (polygon) {
      polygon.setMap(null);
      const newPolygons = [...polygons];
      newPolygons.splice(index, 1);
      setPolygons(newPolygons);
    }

    onZonesSet(newZones);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for places..."
          className="w-full p-2 border border-gray-300 rounded-md text-black"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentZoneType === "free"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => handleZoneTypeChange("free")}
          >
            Free Delivery Zone
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentZoneType === "paid"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => handleZoneTypeChange("paid")}
          >
            Paid Delivery Zone
          </button>
        </div>

        {currentZoneType === "paid" && (
          <div className="flex items-center space-x-2">
            <label
              htmlFor="deliveryFee"
              className="text-sm font-medium text-gray-700"
            >
              Delivery Fee:
            </label>
            <input
              id="deliveryFee"
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-gray-200"
      />

      {zones.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Delivery Zones</h3>
          <div className="space-y-2">
            {zones.map((zone, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        zone.zoneType === "free" ? "#3b82f6" : "#10b981",
                    }}
                  />
                  <span>{zone.name}</span>
                  {zone.zoneType === "paid" && (
                    <span className="text-sm text-gray-600">
                      (₹{zone.deliveryFee} fee)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => removeZone(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
