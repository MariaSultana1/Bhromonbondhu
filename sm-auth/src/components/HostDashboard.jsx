import { useState } from "react";
import {
  Home,
  Calendar,
  DollarSign,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
} from "lucide-react";

import { HostHome } from "./host/HostHome";
import { HostBookings } from "./host/HostBookings";
import { HostEarnings } from "./host/HostEarnings";
import { HostServices } from "./host/HostServices";
import { HostProfile } from "./host/HostProfile";

export default function HostDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "services", label: "Services", icon: Settings },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
 
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            <div>
              <h1 className="text-xl">ভ্রমণবন্ধু</h1>
              <p className="text-xs text-green-600">Host Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </div>

            <button onClick={onLogout} title="Logout">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64
            bg-white border-r transition-transform duration-300 z-40
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    ${isActive
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50"}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>

                  {item.id === "bookings" && (
                    <span className="ml-auto bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "home" && <HostHome user={user} />}
          {activeTab === "bookings" && <HostBookings />}
          {activeTab === "earnings" && <HostEarnings />}
          {activeTab === "services" && <HostServices />}
          {activeTab === "profile" && <HostProfile user={user} />}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
