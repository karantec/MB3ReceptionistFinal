// src/pages/IDManagement.jsx
import React, { useState, useEffect } from "react";

import { NotificationManager } from "react-notifications";
import idManagementService from "../../services/idManagement.service";

// --- Icons ---
const ChevronRight = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    <rect x="2" y="22" width="20" height="1.5" rx="0.75" />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

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
      console.log("API Response:", response); // Debug log

      // Check if response has records field (from your API)
      if (response && response.success) {
        // Your API returns data in 'records' field, not 'data'
        const records = response.records || [];
        setVisitors(records);
        console.log("Records loaded:", records.length);
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#2D2D2D]">
      <div className="max-w-5xl ml-0">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold text-gray-600">
            ID Management
          </h1>
          <button
            onClick={handleAdd}
            className="bg-[#2D2D2D] hover:bg-black text-white pl-5 pr-2 py-2 rounded-xl flex items-center gap-3 transition-all"
          >
            <span className="text-sm font-semibold tracking-wide">Add</span>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <PlusIcon />
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, email, company, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="ml-3 text-sm text-gray-500">
            {filteredVisitors.length} records found
          </span>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-0">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500 first:rounded-l-2xl">
                    Visitor Name
                  </th>
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500">
                    Phone Number
                  </th>
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500">
                    Company
                  </th>
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500">
                    Purpose
                  </th>
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500">
                    ID Type
                  </th>
                  <th className="text-left py-5 px-6 text-md font-medium text-red-500">
                    Status
                  </th>
                  <th className="text-right py-5 px-6 last:rounded-r-2xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? "No matching records found"
                        : "No records found"}
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr
                      key={visitor.IdManagementID}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-base font-medium">
                        {visitor.VisitorName || "-"}
                      </td>
                      <td className="py-4 px-6 text-base text-gray-600">
                        {visitor.PhoneNumber || "-"}
                      </td>
                      <td className="py-4 px-6 text-base text-gray-600">
                        {visitor.Company || "-"}
                      </td>
                      <td className="py-4 px-6 text-base text-gray-600">
                        {visitor.Purpose || "-"}
                      </td>
                      <td className="py-4 px-6 text-base">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {visitor.IdType || "Visitor"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-base">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            visitor.Status === "Active"
                              ? "bg-green-100 text-green-700"
                              : visitor.Status === "Expired"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {visitor.Status || "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(visitor)}
                            className="bg-[#ef4444] hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95"
                          >
                            Edit
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(visitor.IdManagementID)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {filteredVisitors.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-12 mb-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-[#ef4444] font-bold text-sm">
                1
              </button>
              <button className="text-gray-400 font-semibold hover:text-gray-600 text-sm px-2 transition-colors">
                2
              </button>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-semibold text-sm">3</span>
                <span className="text-gray-300 tracking-[0.3em] px-2">
                  ....
                </span>
                <span className="text-gray-400 font-semibold text-sm">6</span>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingRecord ? "Edit Record" : "Add New Record"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Visitor">Visitor</option>
                    <option value="Employee">Employee</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
