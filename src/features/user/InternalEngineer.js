import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { qrUtils, visitorService } from "../../services/visitorService";
import companyService from "../../services/company.service";

function Visitors() {
  // ============================
  // STATE MANAGEMENT
  // ============================

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal States
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // Form Data
  const [qrFormData, setQrFormData] = useState({
    name: "",
    contact: "",
    idNumber: "",
    company: "",
    email: "",
    purpose: "Meeting",
  });

  // ============================
  // API CALLS
  // ============================

  const fetchVisitors = useCallback(async (page = 1, status = "all") => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitorService.getAllVisitors({
        page,
        limit: 10,
        status,
      });

      if (response.success && response.data) {
        const formattedVisitors = response.data.map((visitor) => ({
          id: visitor._id,
          name: visitor.visitorName || visitor.name || "Unknown",
          phone: visitor.phoneNumber || visitor.phone || "N/A",
          email: visitor.email || "",
          company: visitor.company || "",
          idNumber: visitor.idNumber || "",
          checkedIn: visitor.checkedIn || false,
          checkedInAt: visitor.checkedInAt || null,
          qrToken: visitor.qrToken,
          qrCode: visitor.qrCode,
          qrExpiresAt: visitor.qrExpiresAt,
          purpose: visitor.purpose || "Meeting",
          createdAt: visitor.createdAt,
          updatedAt: visitor.updatedAt,
        }));

        setVisitors(formattedVisitors);
        setTotalVisitors(response.count || formattedVisitors.length);
        setTotalPages(
          Math.ceil((response.count || formattedVisitors.length) / 10),
        );
      } else {
        setVisitors([]);
        setTotalVisitors(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch visitors");
      toast.error("Failed to load visitors");
      console.error("Error fetching visitors:", err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companyService.getAll();
      const companiesList = response.companies || response.data || [];
      const companyNames = companiesList.map(c => typeof c === "string" ? c : (c.companyName || c.name || ""));
      setCompanies(companyNames);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([
        "Muenchener Rueckve...",
        "Reliance Private Limited",
        "Hindustan Petroleum",
        "Samsung Private Limited",
        "Avocado",
        "Designverseagency",
      ]);
    }
  }, []);

  useEffect(() => {
    fetchVisitors(currentPage, filterStatus);
    fetchCompanies();
  }, [currentPage, filterStatus, fetchVisitors, fetchCompanies]);

  // ============================
  // EVENT HANDLERS
  // ============================

  const handleSendQR = (visitor) => {
    setSelectedVisitorId(visitor.id);
    setQrFormData({
      name: visitor.name || "",
      contact: visitor.phone || "",
      idNumber:
        visitor.idNumber ||
        `AVC${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 100)}`,
      company: visitor.company || "",
      email: visitor.email || "",
      purpose: visitor.purpose || "Meeting",
    });
    setShowQRModal(true);
  };

  const handleShowQRCode = (visitor) => {
    setSelectedQRCode(visitor.qrCode);
    setSelectedVisitor(visitor);
    setShowQRCodeModal(true);
  };

  const handleCompanySelect = (company) => {
    setQrFormData({ ...qrFormData, company });
    setIsDropdownOpen(false);
  };

  const handleAddCompany = async () => {
    if (newCompany.trim()) {
      try {
        await companyService.createCompany({ name: newCompany.trim() });
        setCompanies([...companies, newCompany.trim()]);
        setQrFormData({ ...qrFormData, company: newCompany.trim() });
        setNewCompany("");
        setShowAddCompany(false);
        setIsDropdownOpen(false);
        toast.success("Company added successfully");
      } catch (err) {
        toast.error("Failed to add company");
        console.error("Error adding company:", err);
      }
    }
  };

  const handleInputChange = (e) => {
    setQrFormData({
      ...qrFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitQR = async () => {
    if (
      !qrFormData.name ||
      !qrFormData.contact ||
      !qrFormData.idNumber ||
      !qrFormData.company
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    console.log("TRACE: [Frontend UI] Submit button clicked in QR Generator modal.");
    console.log("TRACE: [Frontend UI] selectedVisitorId:", selectedVisitorId);
    console.log("TRACE: [Frontend UI] Form state: Name:", qrFormData.name, "Contact:", qrFormData.contact, "Email:", qrFormData.email, "Company:", qrFormData.company);

    try {
      let visitorId = selectedVisitorId;

      if (!visitorId) {
        console.log("TRACE: [Frontend UI] No visitor ID. Flow path -> Create new visitor first.");
        const newVisitor = {
          visitorName: qrFormData.name,
          phoneNumber: qrFormData.contact,
          email: qrFormData.email || "",
          company: qrFormData.company,
          idNumber: qrFormData.idNumber,
          purpose: qrFormData.purpose || "Meeting",
          expiryHours: 24,
        };

        const response = await visitorService.createVisitor(newVisitor);
        visitorId = response.data.id;
        console.log("TRACE: [Frontend UI] Successfully created visitor. Generated DB ID:", visitorId);
        toast.success(`Visitor ${qrFormData.name} created successfully`);
      } else {
        console.log("TRACE: [Frontend UI] Visitor ID exists. Flow path -> Send QR code directly to ID:", visitorId);
        await visitorService.sendQR(visitorId, {
          phoneNumber: qrFormData.contact,
          email: qrFormData.email,
        });
        console.log("TRACE: [Frontend UI] Success response returned from sendQR API call.");
        toast.success(`QR Code sent to ${qrFormData.name}`);
      }

      setShowQRModal(false);
      await fetchVisitors(currentPage, filterStatus);

      setQrFormData({
        name: "",
        contact: "",
        idNumber: "",
        company: "",
        email: "",
        purpose: "Meeting",
      });
      setSelectedVisitorId(null);
    } catch (err) {
      console.error("TRACE: [Frontend UI] Error caught during creation or sendQR:", err);
      toast.error(err.message || "Failed to send QR code");
      console.error("Error sending QR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (visitorId) => {
    try {
      await visitorService.checkInVisitor(visitorId);
      toast.success("Visitor checked in successfully");
      await fetchVisitors(currentPage, filterStatus);
    } catch (err) {
      toast.error(err.message || "Failed to check in visitor");
      console.error("Error checking in:", err);
    }
  };

  const handleRegenerateQR = async (visitorId) => {
    try {
      await visitorService.regenerateQR(visitorId, 24);
      toast.success("QR code regenerated successfully");
      await fetchVisitors(currentPage, filterStatus);
    } catch (err) {
      toast.error(err.message || "Failed to regenerate QR");
      console.error("Error regenerating QR:", err);
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (window.confirm("Are you sure you want to delete this visitor?")) {
      try {
        await visitorService.deleteVisitor(visitorId);
        toast.success("Visitor deleted successfully");
        await fetchVisitors(currentPage, filterStatus);
      } catch (err) {
        toast.error(err.message || "Failed to delete visitor");
        console.error("Error deleting visitor:", err);
      }
    }
  };

  const handleExportCSV = () => {
    if (visitors.length === 0) {
      toast.error("No visitors to export");
      return;
    }
    const success = visitorService.exportVisitorsCSV(visitors);
    if (success) {
      toast.success("Visitors exported successfully");
    } else {
      toast.error("Failed to export visitors");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isQRExpired = (expiryDate) => {
    if (!expiryDate) return true;
    return new Date() > new Date(expiryDate);
  };

  // Bar chart heights matching the design
  const barHeights = [30, 45, 60, 80, 95, 100, 85, 70, 55, 40];

  return (
    <div
      style={{
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        padding: "28px 32px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── QR Code Display Modal ── */}
      {showQRCodeModal && selectedQRCode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
          onClick={() => setShowQRCodeModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: "448px",
              padding: "32px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                QR Code
              </h2>
              <button
                onClick={() => setShowQRCodeModal(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#4b5563",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#4b5563", marginBottom: "8px", margin: 0 }}>
                <strong>{selectedVisitor?.name}</strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "16px",
                  margin: 0,
                }}
              >
                {selectedVisitor?.phone}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {selectedQRCode && selectedQRCode.startsWith("data:image") ? (
                  <img
                    src={selectedQRCode}
                    alt="QR Code"
                    style={{
                      width: "256px",
                      height: "256px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "256px",
                      height: "256px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                    }}
                  >
                    QR Code not available
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  wordBreak: "break-all",
                }}
              >
                Token: {selectedVisitor?.qrToken?.substring(0, 16)}...
              </p>
              {selectedVisitor?.qrExpiresAt && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Expires: {formatDate(selectedVisitor.qrExpiresAt)}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "16px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => {
                    if (
                      qrUtils.downloadQR(selectedQRCode, selectedVisitor?.name)
                    ) {
                      toast.success("QR code downloaded successfully");
                    } else {
                      toast.error("Failed to download QR code");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ⬇️ Download
                </button>

                <button
                  onClick={() => {
                    if (qrUtils.printQR(selectedQRCode, selectedVisitor)) {
                      toast.success("Printing QR code...");
                    } else {
                      toast.error("Failed to print QR code");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4b5563",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  🖨️ Print
                </button>

                <button
                  onClick={async () => {
                    await qrUtils.shareQR(
                      selectedQRCode,
                      selectedVisitor?.name,
                    );
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  📤 Share
                </button>

                <button
                  onClick={async () => {
                    if (selectedVisitor?.qrToken) {
                      const success = await qrUtils.copyToken(
                        selectedVisitor.qrToken,
                      );
                      if (success) {
                        toast.success("Token copied to clipboard");
                      } else {
                        toast.error("Failed to copy token");
                      }
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#8b5cf6",
                    color: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  📋 Copy Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Generator Modal ── */}
      {showQRModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
          onClick={() => {
            setShowQRModal(false);
            setSelectedVisitorId(null);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              width: "100%",
              maxWidth: "420px",
              padding: "36px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h1
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ef4444",
                  margin: 0,
                }}
              >
                QR Generator
              </h1>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedVisitorId(null);
                }}
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

            {/* Modal Form Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Name */}
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
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={qrFormData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
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
                  required
                />
              </div>

              {/* Contact */}
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
                  Contact
                </label>
                <input
                  type="text"
                  name="contact"
                  value={qrFormData.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
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
                  required
                />
              </div>

              {/* ID Number */}
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
                  ID Number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={qrFormData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter ID number"
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
                  required
                />
              </div>

              {/* Company (Dropdown style) */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Company
                </label>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "10px",
                    color: qrFormData.company ? "#374151" : "#9ca3af",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #e5e7eb",
                    boxSizing: "border-box",
                    fontSize: "13px",
                  }}
                >
                  <span>{qrFormData.company || "Select a Company"}</span>
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
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      marginTop: "4px",
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #e5e7eb",
                      zIndex: 10,
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {companies.length === 0 ? (
                      <div
                        style={{
                          padding: "12px 16px",
                          color: "#9ca3af",
                          textAlign: "center",
                          fontSize: "13px",
                        }}
                      >
                        No companies available
                      </div>
                    ) : (
                      companies.map((company, index) => (
                        <div
                          key={index}
                          onClick={() => handleCompanySelect(company)}
                          style={{
                            padding: "10px 16px",
                            fontSize: "13px",
                            color: "#374151",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f9fafb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffffff")
                          }
                        >
                          {company}
                        </div>
                      ))
                    )}

                    {!showAddCompany ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddCompany(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          fontWeight: "600",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        ADD NEW COMPANY
                      </button>
                    ) : (
                      <div
                        style={{ padding: "10px", backgroundColor: "#f9fafb" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={newCompany}
                          onChange={(e) => setNewCompany(e.target.value)}
                          placeholder="Enter company name"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "13px",
                            marginBottom: "8px",
                            boxSizing: "border-box",
                            outline: "none",
                          }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={handleAddCompany}
                            style={{
                              flex: 1,
                              padding: "8px",
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                              borderRadius: "8px",
                              border: "none",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCompany(false);
                              setNewCompany("");
                            }}
                            style={{
                              flex: 1,
                              padding: "8px",
                              backgroundColor: "#d1d5db",
                              color: "#374151",
                              borderRadius: "8px",
                              border: "none",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleSubmitQR}
              disabled={loading}
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
                marginTop: "24px",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#dc2626";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#ef4444";
              }}
            >
              {loading ? "Processing..." : "Send QR Code"}
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          maxWidth: "720px",
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
          Visitors
        </h1>

        {/* Dark Add button matching Companies design */}
        <button
          onClick={() => {
            setQrFormData({
              name: "",
              contact: "",
              idNumber: `AVC${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 100)}`,
              company: "",
              email: "",
              purpose: "Meeting",
            });
            setSelectedVisitorId(null);
            setShowQRModal(true);
          }}
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

      {/* ── Total Visitors Card ─────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "20px 24px",
          width: "fit-content",
          minWidth: "320px",
          maxWidth: "380px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        {/* Icon + Label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          {/* Green circle icon */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <span
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Total Visitors
          </span>
        </div>

        {/* Number + Bar chart row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#111827",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {totalVisitors || 243}
          </span>

          {/* Mini bar chart */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              height: "52px",
            }}
          >
            {barHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  width: "7px",
                  height: `${h}%`,
                  borderRadius: "3px 3px 2px 2px",
                  backgroundColor: i === 5 ? "#1f2937" : "#d1d5db",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Visitors Table ───────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
          paddingBottom: "20px",
          maxWidth: "720px",
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
              {["Visitor Name", "Phone Number", ""].map((col, idx) => (
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
            {visitors.length === 0 ? (
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
                  No visitors found
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  {/* Name */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#1f2937",
                      fontWeight: "500",
                    }}
                  >
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => handleShowQRCode(visitor)}
                    >
                      {visitor.name}
                    </div>
                  </td>

                  {/* Phone */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#6b7280",
                    }}
                  >
                    {visitor.phone}
                  </td>

                  {/* Action */}
                  <td
                    style={{
                      padding: "13px 28px",
                      textAlign: "right",
                    }}
                  >
                    <button
                      onClick={() => handleSendQR(visitor)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 18px",
                        fontSize: "13px",
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
                      Send QR
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "24px",
            }}
          >
            {/* Page number 1 */}
            <button
              onClick={() => handlePageChange(1)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: currentPage === 1 ? "#fee2e2" : "transparent",
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              1
            </button>

            {/* Page number 2 */}
            {totalPages >= 2 && (
              <button
                onClick={() => handlePageChange(2)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: currentPage === 2 ? "#fee2e2" : "transparent",
                  color: currentPage === 2 ? "#ef4444" : "#6b7280",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                2
              </button>
            )}

            {/* Ellipsis / Middle Pages */}
            {totalPages > 2 && (
              <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                3......... {totalPages}
              </span>
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: currentPage === totalPages ? "#d1d5db" : "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
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
    </div>
  );
}

export default Visitors;
