// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginObj, setLoginObj] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (loginObj.email.trim() === "") {
      return setErrorMessage("Email is required!");
    }
    if (loginObj.password.trim() === "") {
      return setErrorMessage("Password is required!");
    }

    setLoading(true);

    try {
      const result = await login(loginObj.email, loginObj.password);

      if (result.success) {
        // Redirect to dashboard
        navigate("/app/dashboard", { replace: true });
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = (field, value) => {
    setErrorMessage("");
    setLoginObj({ ...loginObj, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div
        className="
          w-full h-56 md:h-72 lg:h-screen
          lg:w-[70%]
          flex-shrink-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        <img
          src="/login.jpg"
          alt="Decorative preview"
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="
          w-full lg:w-[30%]
          flex items-center justify-center
          p-6 md:p-10
          bg-white
          lg:h-screen lg:overflow-hidden
        "
      >
        <div className="w-full max-w-md">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                <div className="w-1 h-6 bg-red-500 rounded-sm" />
                <div className="w-1 h-6 bg-red-500 rounded-sm" />
                <div className="w-1 h-6 bg-red-500 rounded-sm" />
                <div className="w-1 h-6 bg-red-500 rounded-sm" />
              </div>
              <span className="text-xl font-semibold tracking-wider">
                EQUINIX
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              Nice to see you again
            </h2>
            <p className="text-sm text-gray-500 mt-2 hidden md:block">
              Login to access your dashboard
            </p>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={loginObj.email}
                onChange={(e) => updateFormValue("email", e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginObj.password}
                  onChange={(e) => updateFormValue("password", e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="text-sm text-red-600">{errorMessage}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
