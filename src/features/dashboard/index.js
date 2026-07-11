import { useState } from "react";

function Dashboard() {
  // Sample visitor data
  const visitorData = [
    {
      name: "Karne",
      company: "Avocado Tech",
      idNumber: "AWC793-34",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Arjuna",
      company: "Designerso",
      idNumber: "DSV878-32",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
    {
      name: "Krishna",
      company: "Pearlperfast",
      idNumber: "PXP543-24",
      email: "prindivrajkundnani@gmail.com",
    },
  ];

  const chartData = [
    20, 30, 25, 35, 30, 40, 35, 45, 40, 50, 45, 55, 50, 60, 55, 65,
  ];

  return (
    <div className="bg-gray-50 p-6">
      {/* Page Title - Clean and minimal */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-[400px] mt-4">
        {/* Header Section */}
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

        {/* Stats and Chart Section */}
        <div className="flex items-end justify-between">
          <div className="text-6xl font-bold text-[#2d2d2d] tracking-tight">
            243
          </div>

          {/* Bar Chart - Symmetrical wave pattern */}
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

      {/* Visitor Table */}
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-0">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left py-4 px-8 text-sm font-semibold text-red-500 first:rounded-l-2xl">
                  Visitor Name
                </th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-red-500">
                  Company Name
                </th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-red-500">
                  ID Number
                </th>
                <th className="text-left py-4 px-8 text-sm font-semibold text-red-500 last:rounded-r-2xl">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {visitorData.map((visitor, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-5 px-8 text-sm text-gray-800 font-medium">
                    {visitor.name}
                  </td>
                  <td className="py-5 px-8 text-sm text-gray-600">
                    {visitor.company}
                  </td>
                  <td className="py-5 px-8 text-sm text-gray-600">
                    {visitor.idNumber}
                  </td>
                  <td className="py-5 px-8 text-sm text-gray-600">
                    {visitor.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
