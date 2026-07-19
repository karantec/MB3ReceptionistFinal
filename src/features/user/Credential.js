// src/pages/Companies.jsx
import React, { useState, useEffect, useRef } from "react";
import { NotificationManager } from "react-notifications";
import companyService from "../../services/company.service";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    website: "",
  });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [industries, setIndustries] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCompanies();
    fetchIndustries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll();
      if (response && response.success) {
        setCompanies(response.companies || []);
      } else {
        setCompanies([]);
        NotificationManager.error("Failed to fetch companies", "Error");
      }
    } catch (error) {
      setCompanies([]);
      NotificationManager.error(
        error.message || "Failed to fetch companies",
        "Error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await companyService.getIndustries();
      if (response && response.success) {
        setIndustries(response.industries || response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch industries:", error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      website: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || "",
      contactPerson: company.contactPerson || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      industry: company.industry || "",
      website: company.website || "",
    });
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleSaveCompany = async () => {
    if (!formData.companyName.trim()) {
      NotificationManager.warning("Company name is required", "Warning");
      return;
    }
    if (!formData.contactPerson.trim()) {
      NotificationManager.warning("Contact person is required", "Warning");
      return;
    }
    try {
      if (editingCompany) {
        const response = await companyService.update(
          editingCompany._id,
          formData,
        );
        if (response && response.success) {
          NotificationManager.success(
            "Company updated successfully",
            "Success",
          );
          fetchCompanies();
          handleCloseModal();
        } else {
          NotificationManager.error(
            response?.message || "Update failed",
            "Error",
          );
        }
      } else {
        const response = await companyService.create(formData);
        if (response && response.success) {
          NotificationManager.success(
            "Company created successfully",
            "Success",
          );
          fetchCompanies();
          handleCloseModal();
        } else {
          NotificationManager.error(
            response?.message || "Creation failed",
            "Error",
          );
        }
      }
    } catch (error) {
      NotificationManager.error(
        error.response?.data?.message || error.message || "Operation failed",
        "Error",
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      website: "",
    });
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await companyService.delete(id);
        if (response && response.success) {
          NotificationManager.success(
            "Company deleted successfully",
            "Success",
          );
          fetchCompanies();
          setOpenMenuId(null);
        } else {
          NotificationManager.error(
            response?.message || "Delete failed",
            "Error",
          );
        }
      } catch (error) {
        NotificationManager.error(
          error.response?.data?.message || error.message || "Delete failed",
          "Error",
        );
      }
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const response = await companyService.search(term);
        if (response && response.success) {
          setCompanies(response.companies || response.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      fetchCompanies();
    }
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (company.companyName || "").toLowerCase().includes(s) ||
      (company.contactPerson || "").toLowerCase().includes(s) ||
      (company.email || "").toLowerCase().includes(s) ||
      (company.industry || "").toLowerCase().includes(s)
    );
  });

  /* ─── LOADING STATE ─────────────────────────────────── */
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
              width: "44px",
              height: "44px",
              border: "4px solid #ef4444",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
            Loading...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─── MAIN RENDER ───────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "28px 32px",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          maxWidth: "660px",
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
          Companies
        </h1>

        {/* Add button — dark pill with grid icon */}
        <button
          onClick={handleOpenAddModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 14px 8px 16px",
            fontSize: "14px",
            fontWeight: "500",
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
          {/* Grid / Windows icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            style={{ opacity: 0.85 }}
          >
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" />
          </svg>
        </button>
      </div>

      {/* ── Company Cards List ────────────────────── */}
      <div
        style={{
          maxWidth: "660px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
        ref={menuRef}
      >
        {filteredCompanies.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "40px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            {searchTerm ? "No matching companies found" : "No companies found"}
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company._id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e9eaec",
                padding: "15px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Company name only */}
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: "500",
                  color: "#1f2937",
                  flex: 1,
                }}
              >
                {company.companyName}
              </span>

              {/* ⋮ Kebab menu */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === company._id ? null : company._id,
                    )
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 6px",
                    color: "#9ca3af",
                    fontSize: "18px",
                    lineHeight: 1,
                    borderRadius: "6px",
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.color = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#9ca3af";
                  }}
                  title="Options"
                >
                  ⋮
                </button>

                {openMenuId === company._id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 4px)",
                      zIndex: 50,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: "6px",
                      minWidth: "140px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        backgroundColor: "#fff",
                        color: "#ef4444",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background-color 0.12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fef2f2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fff")
                      }
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 20 20"
                        fill="#ef4444"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteCompany(company._id)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background-color 0.12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ef4444")
                      }
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 20 20"
                        fill="white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
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
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ef4444",
                  margin: 0,
                }}
              >
                {editingCompany ? "Edit Company" : "Add Company"}
              </h2>
              <button
                onClick={handleCloseModal}
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
                  transition: "background-color 0.12s",
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
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "8px 24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {[
                {
                  label: "Company Name *",
                  key: "companyName",
                  placeholder: "Enter company name",
                  type: "text",
                },
                {
                  label: "Contact Person *",
                  key: "contactPerson",
                  placeholder: "Enter contact person name",
                  type: "text",
                },
                {
                  label: "Email",
                  key: "email",
                  placeholder: "Enter email address",
                  type: "email",
                },
                {
                  label: "Phone",
                  key: "phone",
                  placeholder: "Enter phone number",
                  type: "text",
                },
                {
                  label: "Industry",
                  key: "industry",
                  placeholder: "Enter industry",
                  type: "text",
                },
                {
                  label: "Address",
                  key: "address",
                  placeholder: "Enter address",
                  type: "text",
                },
                {
                  label: "Website",
                  key: "website",
                  placeholder: "Enter website URL",
                  type: "text",
                },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      fontWeight: "500",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13.5px",
                      color: "#1f2937",
                      outline: "none",
                      transition: "border-color 0.15s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#f87171")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#e5e7eb")
                    }
                  />
                  {/* Industry quick-select chips */}
                  {key === "industry" && industries.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "6px",
                      }}
                    >
                      {industries.slice(0, 5).map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, industry: ind })
                          }
                          style={{
                            fontSize: "11px",
                            backgroundColor: "#f3f4f6",
                            border: "none",
                            borderRadius: "20px",
                            padding: "3px 10px",
                            cursor: "pointer",
                            color: "#374151",
                            transition: "background-color 0.12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e5e7eb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f3f4f6")
                          }
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "4px 24px 24px" }}>
              <button
                onClick={handleSaveCompany}
                style={{
                  width: "100%",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "13px",
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
                {editingCompany ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Companies;
