// services/visitorService.js
import axios from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://mb3-ivxh.onrender.com/api/IDVisitor";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor (if using JWT)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================
// QR CODE UTILITY FUNCTIONS
// ============================

export const qrUtils = {
  /**
   * Download QR code as PNG image
   */
  downloadQR: (qrCodeData, visitorName = "visitor") => {
    try {
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `qr-${visitorName.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      return false;
    }
  },

  /**
   * Print QR code with visitor information
   */
  printQR: (qrCodeData, visitorData = {}) => {
    try {
      const printWindow = window.open("", "_blank", "width=600,height=700");
      if (!printWindow) {
        alert("Please allow popups for printing");
        return false;
      }

      const date = new Date().toLocaleString();
      const visitorName = visitorData.name || "Visitor";
      const phoneNumber = visitorData.phone || "N/A";
      const company = visitorData.company || "N/A";
      const idNumber = visitorData.idNumber || "N/A";
      const expiresAt = visitorData.qrExpiresAt
        ? new Date(visitorData.qrExpiresAt).toLocaleString()
        : "N/A";

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${visitorName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f5f5f5;
                padding: 20px;
              }
              .qr-container {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 100%;
                text-align: center;
              }
              .header {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
              }
              .header h1 {
                color: #dc2626;
                font-size: 24px;
                margin-bottom: 5px;
              }
              .header p {
                color: #6b7280;
                font-size: 14px;
              }
              .visitor-info {
                margin: 20px 0;
                text-align: left;
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
              }
              .visitor-info .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .visitor-info .info-row:last-child {
                border-bottom: none;
              }
              .visitor-info .label {
                color: #6b7280;
                font-weight: 500;
              }
              .visitor-info .value {
                color: #1f2937;
                font-weight: 600;
              }
              .qr-image {
                margin: 20px 0;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 2px dashed #e5e7eb;
              }
              .qr-image img {
                max-width: 250px;
                height: auto;
              }
              .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                color: #9ca3af;
                font-size: 12px;
              }
              .token {
                font-size: 11px;
                color: #9ca3af;
                word-break: break-all;
                margin-top: 10px;
                background: #f9fafb;
                padding: 8px;
                border-radius: 4px;
              }
              @media print {
                body { background: white; padding: 0; }
                .qr-container { box-shadow: none; border: 1px solid #e5e7eb; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="header">
                <h1>🏢 Visitor QR Code</h1>
                <p>Generated on ${date}</p>
              </div>
              
              <div class="visitor-info">
                <div class="info-row">
                  <span class="label">Visitor Name</span>
                  <span class="value">${visitorName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone Number</span>
                  <span class="value">${phoneNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Company</span>
                  <span class="value">${company}</span>
                </div>
                <div class="info-row">
                  <span class="label">ID Number</span>
                  <span class="value">${idNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Expires At</span>
                  <span class="value">${expiresAt}</span>
                </div>
              </div>

              <div class="qr-image">
                <img src="${qrCodeData}" alt="QR Code" />
              </div>

              ${
                visitorData.qrToken
                  ? `
                <div class="token">
                  Token: ${visitorData.qrToken.substring(0, 16)}...
                </div>
              `
                  : ""
              }

              <div class="footer">
                <p>This QR code is valid until ${expiresAt}</p>
                <p style="margin-top: 5px;">Please present this QR code at the reception</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            <\/script>
          </body>
        </html>
      `);

      printWindow.document.close();
      return true;
    } catch (error) {
      console.error("Error printing QR code:", error);
      alert("Failed to print QR code. Please try again.");
      return false;
    }
  },

  /**
   * Share QR code using Web Share API
   */
  shareQR: async (qrCodeData, visitorName = "Visitor") => {
    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const file = new File([blob], `qr-${visitorName}.png`, {
        type: "image/png",
      });

      if (navigator.share) {
        await navigator.share({
          title: `QR Code for ${visitorName}`,
          text: `QR Code for ${visitorName}`,
          files: [file],
        });
        return true;
      } else {
        await navigator.clipboard.writeText(qrCodeData);
        alert("QR code copied to clipboard!");
        return true;
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing QR code:", error);
        alert("Failed to share QR code. You can download it instead.");
      }
      return false;
    }
  },

  /**
   * Copy QR token to clipboard
   */
  copyToken: async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      return true;
    } catch (error) {
      console.error("Error copying token:", error);
      return false;
    }
  },
};

// ============================
// VISITOR API SERVICES
// ============================

export const visitorService = {
  // Get all visitors with filters
  getAllVisitors: async (params = {}) => {
    try {
      const response = await apiClient.get("/visitors", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single visitor by ID
  getVisitorById: async (id) => {
    try {
      const response = await apiClient.get(`/visitors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get visitor by QR token
  getVisitorByToken: async (token) => {
    try {
      const response = await apiClient.get(`/visitors/token/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Validate QR code
  validateQR: async (token) => {
    try {
      const response = await apiClient.get(`/visitors/validate/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new visitor with QR
  createVisitor: async (visitorData) => {
    try {
      const response = await apiClient.post("/visitors", visitorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send QR to visitor
  sendQR: async (id, sendData = {}) => {
    try {
      console.log(
        `TRACE: [Frontend Service] Outgoing request to POST /visitors/${id}/send-qr with payload:`,
        sendData,
      );
      const response = await apiClient.post(
        `/visitors/${id}/send-qr`,
        sendData,
      );
      console.log(
        `TRACE: [Frontend Service] Received success response for /visitors/${id}/send-qr:`,
        response.data,
      );
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      console.error(
        `TRACE: [Frontend Service] API call failed for /visitors/${id}/send-qr:`,
        errMsg,
      );
      throw errMsg;
    }
  },

  // Check-in visitor
  checkInVisitor: async (id, token = null) => {
    try {
      const response = await apiClient.post(`/visitors/${id}/check-in`, {
        token,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check-out visitor
  checkOutVisitor: async (id) => {
    try {
      const response = await apiClient.post(`/visitors/${id}/check-out`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Regenerate QR code
  regenerateQR: async (id, expiryHours = 24) => {
    try {
      const response = await apiClient.post(`/visitors/${id}/regenerate-qr`, {
        expiryHours,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete visitor
  deleteVisitor: async (id) => {
    try {
      const response = await apiClient.delete(`/visitors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk delete visitors
  bulkDeleteVisitors: async (type = "expired") => {
    try {
      const response = await apiClient.delete(`/visitors/bulk?type=${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export visitors as CSV
  exportVisitorsCSV: (visitors) => {
    try {
      const headers = [
        "Name",
        "Phone",
        "Email",
        "Company",
        "ID Number",
        "Status",
        "Check-in Time",
        "QR Expiry",
        "Created At",
      ];

      const rows = visitors.map((v) => [
        v.name || v.visitorName || "",
        v.phone || v.phoneNumber || "",
        v.email || "",
        v.company || "",
        v.idNumber || "",
        v.checkedIn ? "Checked In" : "Pending",
        v.checkedInAt ? new Date(v.checkedInAt).toLocaleString() : "",
        v.qrExpiresAt ? new Date(v.qrExpiresAt).toLocaleString() : "",
        v.createdAt ? new Date(v.createdAt).toLocaleString() : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return false;
    }
  },
};

// ============================
// COMPANY API SERVICES
// ============================

export const companyService = {
  getAllCompanies: async () => {
    try {
      const response = await apiClient.get("/companies");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createCompany: async (companyData) => {
    try {
      const response = await apiClient.post("/companies", companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteCompany: async (id) => {
    try {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default apiClient;
