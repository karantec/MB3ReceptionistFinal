// Visitors.jsx
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
      const response = await companyService.getAllCompanies();
      setCompanies(response.data || []);
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
    try {
      let visitorId = selectedVisitorId;

      if (!visitorId) {
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
        toast.success(`Visitor ${qrFormData.name} created successfully`);
      } else {
        await visitorService.sendQR(visitorId, {
          phoneNumber: qrFormData.contact,
          email: qrFormData.email,
        });
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

  // ============================
  // RENDER
  // ============================

  return (
    <div className="min-h-screen bg-gray-50 p-2 max-w-full">
      {/* QR Code Display Modal */}
      {showQRCodeModal && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
              <button
                onClick={() => setShowQRCodeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-2">
                <strong>{selectedVisitor?.name}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {selectedVisitor?.phone}
              </p>

              <div className="flex justify-center mb-4">
                {selectedQRCode && selectedQRCode.startsWith("data:image") ? (
                  <img
                    src={selectedQRCode}
                    alt="QR Code"
                    className="w-64 h-64 border-2 border-gray-200 rounded-lg p-2"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    QR Code not available
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 break-all">
                Token: {selectedVisitor?.qrToken?.substring(0, 16)}...
              </p>
              {selectedVisitor?.qrExpiresAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires: {formatDate(selectedVisitor.qrExpiresAt)}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4 justify-center">
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
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
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
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
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm"
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
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm"
                >
                  📋 Copy Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Generator Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-red-600">QR Generator</h1>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedVisitorId(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={qrFormData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Contact *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={qrFormData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter contact"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={qrFormData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter email (optional)"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  ID Number *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={qrFormData.idNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter ID number"
                  required
                />
              </div>

              <div className="relative">
                <label className="text-sm text-gray-500 mb-1 block">
                  Company *
                </label>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-700 cursor-pointer flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <span
                    className={
                      qrFormData.company ? "text-gray-700" : "text-gray-400"
                    }
                  >
                    {qrFormData.company || "Select a Company"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-64 overflow-y-auto">
                    {companies.length === 0 ? (
                      <div className="px-4 py-3 text-gray-400 text-center">
                        No companies available
                      </div>
                    ) : (
                      companies.map((company, index) => (
                        <div
                          key={index}
                          onClick={() => handleCompanySelect(company)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
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
                        className="w-full px-4 py-3 bg-red-600 text-white font-semibold hover:bg-red-700"
                      >
                        ADD NEW COMPANY
                      </button>
                    ) : (
                      <div
                        className="p-3 bg-gray-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={newCompany}
                          onChange={(e) => setNewCompany(e.target.value)}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddCompany}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCompany(false);
                              setNewCompany("");
                            }}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm font-semibold"
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

            <button
              onClick={handleSubmitQR}
              disabled={loading}
              className={`w-full mt-8 py-4 rounded-lg text-white font-bold text-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading
                ? "Processing..."
                : selectedVisitorId
                  ? "Send QR Code"
                  : "Create & Send QR"}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-semibold text-gray-600">Visitors</h1>
      </div>

      {/* Loading State */}
      {loading && visitors.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {/* Total Visitors Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-[400px] mt-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#e8fbf3] rounded-2xl flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#00c853]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="text-[#333] text-2xl font-semibold">
            Total Visitors
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div className="text-6xl font-bold text-[#2d2d2d] tracking-tight">
            {totalVisitors || visitors.length}
          </div>

          <div className="flex items-end gap-[3px] h-20 pb-1">
            {[30, 45, 60, 80, 95, 100, 85, 70, 55, 40].map((height, idx) => (
              <div
                key={idx}
                className={`w-[10px] rounded-full transition-all ${
                  idx === 5 ? "bg-[#2d2d2d]" : "bg-gray-200"
                }`}
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mt-4 mb-2">
        {["all", "active", "expired", "checked-in"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          📊 Export CSV
        </button>
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
          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all ml-auto"
        >
          + Add New Visitor
        </button>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-3xl shadow-sm p-4 max-w-6xl mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-0">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left py-5 px-6 text-md font-normal text-red-500 first:rounded-l-2xl">
                  Visitor Name
                </th>
                <th className="text-left py-5 px-6 text-md font-normal text-red-500">
                  Phone Number
                </th>
                <th className="text-left py-5 px-6 text-md font-normal text-red-500">
                  Company
                </th>
                <th className="text-left py-5 px-6 text-md font-normal text-red-500">
                  Status
                </th>
                <th className="text-left py-5 px-6 text-md font-normal text-red-500">
                  QR Expiry
                </th>
                <th className="text-center py-5 px-6 text-md font-normal text-red-500 last:rounded-r-2xl">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No visitors found
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-6 px-6 text-base text-gray-700 font-medium">
                      <div>
                        <div>{visitor.name}</div>
                        {visitor.email && (
                          <div className="text-xs text-gray-400">
                            {visitor.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-base text-gray-700">
                      {visitor.phone}
                    </td>
                    <td className="py-6 px-6 text-base text-gray-700">
                      {visitor.company || "N/A"}
                    </td>
                    <td className="py-6 px-6 text-base">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                            visitor.checkedIn
                              ? "bg-green-100 text-green-700"
                              : isQRExpired(visitor.qrExpiresAt)
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {visitor.checkedIn
                            ? "✅ Checked In"
                            : isQRExpired(visitor.qrExpiresAt)
                              ? "⏰ Expired"
                              : "⏳ Pending"}
                        </span>
                        {visitor.checkedInAt && (
                          <span className="text-xs text-gray-400">
                            {formatDate(visitor.checkedInAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-sm text-gray-500">
                      {visitor.qrExpiresAt ? (
                        <div>
                          <div>{formatDate(visitor.qrExpiresAt)}</div>
                          {isQRExpired(visitor.qrExpiresAt) && (
                            <span className="text-xs text-red-500">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => handleShowQRCode(visitor)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                          title="View QR Code"
                        >
                          📱
                        </button>

                        <button
                          onClick={() => handleSendQR(visitor)}
                          className="bg-[#ef4444] hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
                          disabled={visitor.checkedIn}
                        >
                          Send QR
                        </button>

                        {!visitor.checkedIn &&
                          !isQRExpired(visitor.qrExpiresAt) && (
                            <button
                              onClick={() => handleCheckIn(visitor.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                            >
                              Check In
                            </button>
                          )}

                        <button
                          onClick={() => handleRegenerateQR(visitor.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                          title="Regenerate QR"
                        >
                          🔄
                        </button>

                        <button
                          onClick={() => handleDeleteVisitor(visitor.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded flex items-center justify-center ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 rounded text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded flex items-center justify-center ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Visitors;
