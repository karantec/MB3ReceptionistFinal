import { useState, useEffect, useCallback } from "react";
import { visitorService } from "../../services/visitorService";
import { toast } from "react-hot-toast";

function Dashboard() {
  const [visitors, setVisitors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch visitors from database
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await visitorService.getAllVisitors({
        page: 1,
        limit: 10,
        status: "all",
      });

      if (response.success && response.data) {
        const formattedVisitors = response.data.map((visitor) => ({
          id: visitor._id,
          name: visitor.visitorName || visitor.name || "Unknown",
          company: visitor.company || "N/A",
          idNumber: visitor.idNumber || "-",
          email: visitor.email || "-",
          checkedIn: visitor.checkedIn || false,
        }));
        setVisitors(formattedVisitors);
        setTotalCount(response.count || formattedVisitors.length);
      }
    } catch (error) {
      console.error("Dashboard: Error fetching database records:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Checkout (Free ID)
  const handleCheckout = async (visitorId) => {
    try {
      const response = await visitorService.checkOutVisitor(visitorId);
      if (response && response.success) {
        toast.success("Visitor checked out & ID card freed!");
        await fetchDashboardData(); // Refresh records
      } else {
        toast.error(response?.message || "Failed to checkout visitor");
      }
    } catch (error) {
      console.error("Dashboard: Error checking out visitor:", error);
      toast.error(error.message || "Checkout failed");
    }
  };

  // Bar chart heights matching the design (short-tall-short wave)
  const barHeights = [35, 55, 42, 70, 58, 85, 65, 48, 72, 38];

  if (loading && visitors.length === 0) {
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
            Loading dashboard data...
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
      {/* Page Title */}
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Dashboard
      </h1>

      {/* ── Today Visitors Card ─────────────────────────────── */}
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
            Today Visitors
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
            {totalCount || 243}
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

      {/* ── Visitor Table ───────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
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
              {["Visitor Name", "Company Name", "ID Number", "Email", ""].map(
                (col, idx) => (
                  <th
                    key={idx}
                    style={{
                      textAlign: idx === 4 ? "right" : "left",
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
                )
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {visitors.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "40px 28px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No visitors registered in the database.
                </td>
              </tr>
            ) : (
              visitors.map((visitor, idx) => (
                <tr
                  key={visitor.id || idx}
                  style={{
                    borderBottom:
                      idx < visitors.length - 1
                        ? "1px solid #f9fafb"
                        : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
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
                    {visitor.name}
                  </td>

                  {/* Company */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#6b7280",
                    }}
                  >
                    {visitor.company}
                  </td>

                  {/* ID Number */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#6b7280",
                    }}
                  >
                    {visitor.idNumber}
                  </td>

                  {/* Email */}
                  <td
                    style={{
                      padding: "13px 28px",
                      fontSize: "13.5px",
                      color: "#6b7280",
                    }}
                  >
                    {visitor.email}
                  </td>

                  {/* Checkout Button */}
                  <td
                    style={{
                      padding: "13px 28px",
                      textAlign: "right",
                    }}
                  >
                    {visitor.checkedIn && (
                      <button
                        onClick={() => handleCheckout(visitor.id)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "12px",
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
                        Checkout
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
