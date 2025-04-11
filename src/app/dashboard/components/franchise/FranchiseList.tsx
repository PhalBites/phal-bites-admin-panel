"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Franchise {
  _id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  contact: {
    phone: string;
    email: string;
  };
}

export function FranchiseList() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const response = await fetch("/api/franchise");
        if (!response.ok) {
          throw new Error("Failed to fetch franchises");
        }
        const data = await response.json();
        setFranchises(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchises();
  }, []);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#000" }}>
          All Franchises
        </h2>
        <Link href="/dashboard/components/franchise/new">
          <button
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              backgroundColor: "#000",
              color: "#fff",
              fontWeight: "500",
              cursor: "pointer",
              border: "none",
              transition: "background-color 0.2s",
              ":hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Add New Franchise
          </button>
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                textAlign: "left",
              }}
            >
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Location
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Contact
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {franchises.map((franchise) => (
              <tr
                key={franchise._id}
                style={{
                  borderTop: "1px solid #e5e7eb",
                  ":hover": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                <td
                  style={{
                    padding: "1rem",
                    fontWeight: "500",
                    color: "#000",
                  }}
                >
                  {franchise.name}
                </td>
                <td style={{ padding: "1rem", color: "#000" }}>
                  {franchise.city}, {franchise.state}
                </td>
                <td style={{ padding: "1rem" }}>
                  <div>{franchise.contact.phone}</div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#4b5563",
                    }}
                  >
                    {franchise.contact.email}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      backgroundColor: franchise.isActive
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: franchise.isActive ? "#166534" : "#991b1b",
                    }}
                  >
                    {franchise.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <Link
                    href={`/dashboard/components/franchise/${franchise._id}`}
                  >
                    <button
                      style={{
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "transparent",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        ":hover": {
                          backgroundColor: "#f3f4f6",
                        },
                        color: "#000",
                      }}
                    >
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
