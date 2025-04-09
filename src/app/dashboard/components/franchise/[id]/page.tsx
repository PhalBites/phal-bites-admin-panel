"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mapsLoader } from "../../../../../../lib/maps-loader";

interface FranchiseDetail {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  location: {
    coordinates: [number, number];
  };
  deliveryZones: {
    name: string;
    zoneType: "free" | "paid";
    deliveryFee?: number;
    area: {
      coordinates: number[][][];
    };
  }[];
  contact: {
    phone: string;
    email: string;
  };
  isActive: boolean;
}

export default function FranchiseDetailPage() {
  const { id } = useParams();
  const [franchise, setFranchise] = useState<FranchiseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const response = await fetch(`/api/franchise/${id}`);
        if (!response.ok) throw new Error("Failed to fetch franchise");
        setFranchise(await response.json());
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch franchise"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFranchise();
  }, [id]);

  useEffect(() => {
    if (!franchise || !mapRef.current) return;

    const markers: google.maps.Marker[] = [];
    const polygons: google.maps.Polygon[] = [];

    const initMap = async () => {
      try {
        await mapsLoader.load();

        const location = {
          lat: franchise.location.coordinates[1],
          lng: franchise.location.coordinates[0],
        };

        const map = new google.maps.Map(mapRef.current!, {
          center: location,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        mapInstance.current = map;

        // Create bounds to include all points
        const bounds = new google.maps.LatLngBounds();

        // Add franchise location to bounds
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));

        // Add marker
        markers.push(
          new google.maps.Marker({
            position: location,
            map,
            title: franchise.name,
          })
        );

        // Add delivery zones
        franchise.deliveryZones.forEach((zone) => {
          const paths = zone.area.coordinates[0].map((coord) => ({
            lat: coord[1],
            lng: coord[0],
          }));

          // Add each path point to bounds
          paths.forEach((point) => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
          });

          const polygon = new google.maps.Polygon({
            paths,
            map,
            fillColor: zone.zoneType === "free" ? "#4ade80" : "#f59e0b",
            fillOpacity: 0.4,
            strokeWeight: 2,
            strokeColor: zone.zoneType === "free" ? "#16a34a" : "#d97706",
          });

          polygons.push(polygon);
        });

        // Adjust map to fit all markers and zones
        if (franchise.deliveryZones.length > 0) {
          // Add a small padding
          map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to load map");
      }
    };

    initMap();

    return () => {
      // Cleanup
      markers.forEach((marker) => marker.setMap(null));
      polygons.forEach((polygon) => polygon.setMap(null));
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
    };
  }, [franchise]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "256px",
        }}
      >
        <div
          style={{
            animation: "spin 1s linear infinite",
            borderRadius: "50%",
            height: "40px",
            width: "40px",
            borderBottom: "2px solid #15803d",
          }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#fee2e2",
          border: "1px solid #f87171",
          color: "#b91c1c",
          borderRadius: "0.375rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (!franchise) {
    return <div>Franchise not found</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
          {franchise.name}
        </h2>
        <button
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid #e5e7eb",
            backgroundColor: "white",
            color: "#374151",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
            ":hover": {
              backgroundColor: "#f3f4f6",
            },
          }}
        >
          Edit
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 style={{ fontWeight: "500", color: "#374151" }}>Address</h3>
            <p style={{ color: "#111827" }}>{franchise.address}</p>
            <p style={{ color: "#111827" }}>
              {franchise.city}, {franchise.state}
            </p>
          </div>

          <div>
            <h3 style={{ fontWeight: "500", color: "#374151" }}>Contact</h3>
            <p style={{ color: "#111827" }}>{franchise.contact.phone}</p>
            <p style={{ color: "#111827" }}>{franchise.contact.email}</p>
          </div>

          <div>
            <h3 style={{ fontWeight: "500", color: "#374151" }}>Status</h3>
            <span
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                backgroundColor: franchise.isActive ? "#dcfce7" : "#fee2e2",
                color: franchise.isActive ? "#166534" : "#991b1b",
              }}
            >
              {franchise.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontWeight: "500", color: "#374151" }}>
            Delivery Zones
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {franchise.deliveryZones.map((zone, index) => (
              <div
                key={index}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderRadius: "50%",
                      backgroundColor:
                        zone.zoneType === "free" ? "#4ade80" : "#f59e0b",
                    }}
                  />
                  <span style={{ fontWeight: "500" }}>{zone.name}</span>
                  {zone.zoneType === "paid" && (
                    <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      (₹{zone.deliveryFee} fee)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3
          style={{
            fontWeight: "500",
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Delivery Area Map
        </h3>
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "24rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          }}
        />
      </div>
    </div>
  );
}
