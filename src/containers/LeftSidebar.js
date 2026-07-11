import routes from "../routes/sidebar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { NotificationManager } from "react-notifications";

function LeftSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const close = () => {
    document.getElementById("left-sidebar-drawer").click();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      NotificationManager.success("Logged out successfully", "Success");
    } catch (error) {
      NotificationManager.error("Failed to logout", "Error");
    }
  };

  return (
    <div className="drawer-side z-40">
      <label
        htmlFor="left-sidebar-drawer"
        className="drawer-overlay"
        onClick={close}
      ></label>

      {/* Sidebar Container */}
      <aside
        className="flex flex-col h-full bg-white border-r border-gray-200"
        style={{ width: "260px", minHeight: "100vh" }}
      >
        {/* Close button for mobile */}
        <button
          className="btn btn-ghost btn-circle absolute top-3 right-3 lg:hidden"
          onClick={close}
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>

        {/* Logo Section */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-2 px-5 pt-6 pb-5">
            <img
              src="/equi.png"
              alt="Equinix Logo"
              style={{ height: "28px", width: "auto", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Menu Label */}
        <div
          className="px-5 pt-3 pb-2"
          style={{
            fontSize: "14px",
            fontWeight: "400",
            letterSpacing: "0.1em",
            marginLeft: "1rem",
            color: "#999",
            fontFamily: "sans-serif",
          }}
        >
          MENU
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-0.5 px-6 flex-1 overflow-y-auto">
          {routes.map((route, k) => {
            return (
              <div key={k}>
                {route.submenu ? (
                  <SidebarSubmenu {...route} />
                ) : (
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 mt-2 px-3 py-3 rounded-md text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-red-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                    style={{ fontFamily: "sans-serif", textDecoration: "none" }}
                    onClick={close}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 flex-shrink-0">
                        {route.icon}
                      </span>

                      <span className="mt-[2px]">{route.name}</span>
                    </span>
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button at bottom */}
        <div className="border-t border-gray-200 p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-all duration-150"
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default LeftSidebar;
