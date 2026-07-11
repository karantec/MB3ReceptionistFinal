import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationManager } from "react-notifications";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme"),
  );
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
  }, []);

  const openNotification = () => {
    dispatch(
      openRightDrawer({
        header: "Notifications",
        bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION,
      }),
    );
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.FullName) {
      const names = user.FullName.split(" ");
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return user.FullName.charAt(0).toUpperCase();
    }
    if (user?.fullName) {
      const names = user.fullName.split(" ");
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user?.Email) {
      return user.Email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <div className="navbar sticky top-0 bg-white z-10 shadow-sm border-b border-gray-200 px-6 h-[4.5rem]">
        {/* Left Section - Logo, Divider, Menu toggle and Search */}
        <div className="flex-1 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <label
            htmlFor="left-sidebar-drawer"
            className="btn btn-ghost btn-circle lg:hidden"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </label>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 w-96 shadow-sm">
              {/* Search Icon */}
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />

              {/* Input Field */}
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-base text-gray-600 placeholder-gray-400 w-full"
              />

              {/* Keyboard Shortcut Hint */}
              <div className="flex items-center gap-1.5 ml-2 text-gray-400 select-none">
                {/* Windows Icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M0 3.449L9.75 2.1V11.59H0V3.449zm0 8.851h9.75v9.439L0 20.351V12.3zm10.65-10.42L24 0v11.59h-13.35V1.88zm0 10.42H24V24l-13.35-1.928V12.3z" />
                </svg>
                <span className="text-sm font-light">+</span>
                <span className="text-sm font-medium">F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center gap-6">
          {/* Notification Bell Section */}
          <div className="relative cursor-pointer" onClick={openNotification}>
            <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-center">
              <div className="relative">
                <BellIcon className="h-7 w-7 text-gray-800" strokeWidth={1.5} />
                {/* Small Red Dot on Bell */}
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 border-2 border-gray-50 rounded-full"></span>
              </div>
            </div>
            {/* Notification Count Badge */}
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white border-2 border-white">
              2
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.ProfileImage || user?.profileImage ? (
                  <img
                    src={user.ProfileImage || user.profileImage}
                    alt={user.FullName || user.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getUserInitials()
                )}
              </div>

              {/* User Name */}
              <span className="text-xl font-bold text-gray-800">
                {user?.FullName || user?.fullName || "User"}
              </span>

              {/* Filled Down Arrow */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5101 15.1999L15.4801 13.2299L18.6901 10.0199C19.3601 9.33993 18.8801 8.17993 17.9201 8.17993L11.6901 8.17993L6.0801 8.17993C5.1201 8.17993 4.6401 9.33993 5.3201 10.0199L10.5001 15.1999C11.3201 16.0299 12.6801 16.0299 13.5101 15.1999Z"
                  fill="#2D2D2D"
                />
              </svg>
            </label>

            {/* Dropdown Menu */}
            {showDropdown && (
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-white rounded-xl w-52 border border-gray-100 z-[1]"
              >
                {/* User Info in dropdown */}
                <li className="px-2 py-2 border-b border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {user?.FullName || user?.fullName || "User"}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {user?.Email || user?.email}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full inline-block mt-1 w-fit">
                      {user?.Role || user?.role || "User"}
                    </span>
                  </div>
                </li>

                <li>
                  <Link
                    to="/app/profile"
                    className="flex items-center gap-2 py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-2 py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                </li>

                <div className="divider my-1"></div>

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-3 px-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                  >
                    <svg
                      className="h-5 w-5"
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
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
