// src/pages/IDManagement.jsx
import React, { useState, useEffect } from "react";
import { NotificationManager } from "react-notifications";
import idManagementService from "../../services/idManagement.service";

export default function IDManagementPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    visitorName: "",
    phoneNumber: "",
    email: "",
    company: "",
    purpose: "",
    idType: "Visitor",
    idNumber: "",
    validFrom: "",
    validUntil: "",
    status: "Active",
  });

  // Fetch ID records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await idManagementService.getAll();
      console.log("API Response:", response);

      // Check if response has records field (from your API)
      if (response && response.success) {
        // Your API returns data in 'records' field
        const records = response.records || [];

        // Transform the data to match the component's expected format
        // The API returns camelCase field names
        const transformedRecords = records.map((record) => ({
          IdManagementID: record._id || record.IdManagementID,
          VisitorName: record.visitorName || "",
          PhoneNumber: record.phoneNumber || "",
          Email: record.email || "",
          Company: record.company || "",
          Purpose: record.purpose || "",
          IdType: record.idType || "Visitor",
          IdNumber: record.idNumber || "",
          ValidFrom: record.validFrom || "",
          ValidUntil: record.validUntil || "",
          Status: record.status || "Active",
          IsActive: record.isActive,
          CreatedAt: record.createdAt,
          UpdatedAt: record.updatedAt,
        }));

        setVisitors(transformedRecords);
        console.log("Records loaded:", transformedRecords.length);
      } else {
        setVisitors([]);
        NotificationManager.error("Failed to fetch records", "Error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setVisitors([]);
      NotificationManager.error(
        error.message || "Failed to fetch records",
        "Error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor) => {
    setEditingRecord(visitor);
    setFormData({
      visitorName: visitor.VisitorName || "",
      phoneNumber: visitor.PhoneNumber || "",
      email: visitor.Email || "",
      company: visitor.Company || "",
      purpose: visitor.Purpose || "",
      idType: visitor.IdType || "Visitor",
      idNumber: visitor.IdNumber || "",
      validFrom: visitor.ValidFrom ? visitor.ValidFrom.split("T")[0] : "",
      validUntil: visitor.ValidUntil ? visitor.ValidUntil.split("T")[0] : "",
      status: visitor.Status || "Active",
    });
    setShowAddModal(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      visitorName: "",
      phoneNumber: "",
      email: "",
      company: "",
      purpose: "",
      idType: "Visitor",
      idNumber: "",
      validFrom: "",
      validUntil: "",
      status: "Active",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        // Update existing record
        const response = await idManagementService.update(
          editingRecord.IdManagementID,
          formData,
        );
        if (response && response.success) {
          NotificationManager.success("Record updated successfully", "Success");
          fetchRecords();
          setShowAddModal(false);
        }
      } else {
        // Create new record
        const response = await idManagementService.create(formData);
        if (response && response.success) {
          NotificationManager.success("Record created successfully", "Success");
          fetchRecords();
          setShowAddModal(false);
        }
      }
    } catch (error) {
      NotificationManager.error(error.message || "Operation failed", "Error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await idManagementService.delete(id);
        if (response && response.success) {
          NotificationManager.success("Record deleted successfully", "Success");
          fetchRecords();
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Filter visitors based on search term
  const filteredVisitors = visitors.filter((visitor) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (visitor.VisitorName || "").toLowerCase().includes(search) ||
      (visitor.PhoneNumber || "").toLowerCase().includes(search) ||
      (visitor.Email || "").toLowerCase().includes(search) ||
      (visitor.Company || "").toLowerCase().includes(search) ||
      (visitor.Purpose || "").toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #ef4444",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        padding: "28px 32px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          maxWidth: "680px",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#374151",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          ID Management
        </h1>

        {/* Dark Add button matching Companies and Visitors */}
        <button
          onClick={handleAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#111827")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#1f2937")
          }
        >
          Add
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "6px",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
        </button>
      </div>

      {/* ── ID Management Table ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
          paddingBottom: "20px",
          maxWidth: "680px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          {/* Table Head */}
          <thead>
            <tr>
              {["Uniq Number", "ID Number", ""].map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    textAlign: idx === 2 ? "right" : "left",
                    padding: "14px 28px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ef4444",
                    letterSpacing: "0.01em",
                    borderBottom: "1px solid #f3f4f6",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredVisitors.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              filteredVisitors.map((visitor, idx) => (
                <tr
                  key={visitor.IdManagementID}
                  style={{
                    borderBottom: "1px solid #f9fafb",
                  }}
                >
                  {/* Uniq Number */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#1f2937",
                      fontWeight: "500",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {visitor.Status === "Active" && (
                        <span style={{ color: "#10b981", fontSize: "18px", lineHeight: "1" }}>•</span>
                      )}
                      <span>{idx + 1}</span>
                    </div>
                  </td>

                  {/* ID Number */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#6b7280",
                    }}
                  >
                    {visitor.IdNumber || "-"}
                  </td>

                  {/* Actions */}
                  <td
                    style={{
                      padding: "13px 28px",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(visitor)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ef4444")
                        }
                      >
                        Edit
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(visitor.IdManagementID)}
                        style={{
                          backgroundColor: "#f3f4f6",
                          color: "#4b5563",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#e5e7eb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f3f4f6")
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        {filteredVisitors.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "24px",
            }}
          >
            <button
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              1
            </button>
            <button
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              2
            </button>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>
              3......... 6
            </span>
            <button
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 12px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ef4444",
                }}
              >
                {editingRecord ? "Edit Record" : "Add New Record"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: "4px 24px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  maxHeight: "65vh",
                  overflowY: "auto",
                }}
              >
                {[
                  {
                    label: "Visitor Name *",
                    name: "visitorName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Phone Number *",
                    name: "phoneNumber",
                    type: "text",
                    required: true,
                  },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Company", name: "company", type: "text" },
                  { label: "Purpose", name: "purpose", type: "text" },
                  { label: "ID Number", name: "idNumber", type: "text" },
                ].map(({ label, name, type, required }) => (
                  <div key={name}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginBottom: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      required={required}
                      style={{
                        width: "100%",
                        backgroundColor: "#f9fafb",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "13px",
                        color: "#374151",
                        border: "1px solid #e5e7eb",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#f87171")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#e5e7eb")
                      }
                    />
                  </div>
                ))}

                {/* ID Type Dropdown */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      fontWeight: "500",
                    }}
                  >
                    ID Type
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Visitor">Visitor</option>
                    <option value="Employee">Employee</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Valid From
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "12px 24px 24px" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef4444")
                  }
                >
                  {editingRecord ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
