// src/pages/Companies.jsx
import React, { useState, useEffect } from "react";

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

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
    fetchIndustries();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll();
      console.log("Companies API Response:", response);

      // Check if response has companies field (from your API)
      if (response && response.success) {
        // Your API returns data in 'companies' field, not 'data'
        const companiesData = response.companies || [];
        setCompanies(companiesData);
        console.log("Companies loaded:", companiesData.length);
      } else {
        setCompanies([]);
        NotificationManager.error("Failed to fetch companies", "Error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
        setIndustries(response.data || []);
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
      companyName: company.CompanyName || "",
      contactPerson: company.ContactPerson || "",
      email: company.Email || "",
      phone: company.Phone || "",
      address: company.Address || "",
      industry: company.Industry || "",
      website: company.Website || "",
    });
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleSaveCompany = async () => {
    // Validate required fields
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
        // Update existing company
        const response = await companyService.update(
          editingCompany.CompanyID,
          formData,
        );
        if (response && response.success) {
          NotificationManager.success(
            "Company updated successfully",
            "Success",
          );
          fetchCompanies();
          handleCloseModal();
        }
      } else {
        // Create new company
        const response = await companyService.create(formData);
        if (response && response.success) {
          NotificationManager.success(
            "Company created successfully",
            "Success",
          );
          fetchCompanies();
          handleCloseModal();
        }
      }
    } catch (error) {
      NotificationManager.error(error.message || "Operation failed", "Error");
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
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
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
          // Check if response has companies field
          setCompanies(response.companies || response.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      fetchCompanies(); // Reset to all companies
    }
  };

  // Filter companies based on search term (client-side fallback)
  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (company.CompanyName || "").toLowerCase().includes(search) ||
      (company.ContactPerson || "").toLowerCase().includes(search) ||
      (company.Email || "").toLowerCase().includes(search) ||
      (company.Industry || "").toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-600">Companies</h1>
          <button
            onClick={handleOpenAddModal}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            Add
            <div className="bg-white/20 p-1.5 rounded-lg">
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
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search companies by name, contact, email, or industry..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="ml-3 text-sm text-gray-500">
            {filteredCompanies.length} companies found
          </span>
        </div>

        {/* Companies List */}
        <div className="space-y-3">
          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-8 text-center text-gray-500">
              {searchTerm
                ? "No matching companies found"
                : "No companies found"}
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.CompanyID}
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {company.CompanyName}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Contact: {company.ContactPerson || "N/A"}
                    </span>
                    {company.Industry && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {company.Industry}
                      </span>
                    )}
                    {company.Email && (
                      <span className="text-xs text-gray-500">
                        {company.Email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === company.CompanyID
                          ? null
                          : company.CompanyID,
                      )
                    }
                    className="p-1 text-gray-500 hover:text-gray-700 text-lg leading-none"
                  >
                    ⋮
                  </button>

                  {openMenuId === company.CompanyID && (
                    <div className="absolute right-0 top-0 mt-8 z-10 bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex flex-col gap-2 w-40">
                      <button
                        onClick={() => handleOpenEditModal(company)}
                        className="w-full py-2 px-4 rounded-lg border border-red-200 text-red-500 bg-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.CompanyID)}
                        className="w-full py-2 px-4 rounded-lg bg-red-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-5 pb-2">
              <h2 className="text-lg font-bold text-red-500">
                {editingCompany ? "Edit Company" : "Add Company"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="Enter contact person name"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="Enter industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
                {industries.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {industries.slice(0, 5).map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, industry: ind })
                        }
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full transition-colors"
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="Enter website URL"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 border-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={handleSaveCompany}
                className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
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
