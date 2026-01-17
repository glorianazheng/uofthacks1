import { NavLink } from "react-router";

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l3-6m0 0l3 6m-3-6v6m0-6H3m18 0h-6" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export function PhoneLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/explore", icon: CompassIcon, label: "Explore" },
    { path: "/create", icon: PlusIcon, label: "Create" },
    { path: "/circles", icon: CircleIcon, label: "Circles" },
    { path: "/profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2">
      {/* iPhone 16 Frame */}
      <div className="relative" style={{ width: "280px" }}>
        {/* White Background for Phone */}
        <div className="bg-white rounded-[36px] shadow-xl overflow-hidden border-[8px] border-black">
          {/* Screen Content */}
          <div className="bg-white overflow-hidden flex flex-col" style={{ aspectRatio: "9/19.5" }}>
            {/* Status Bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-1 flex justify-between items-center text-xs font-semibold">
              <span>9:41</span>
              <div className="flex gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
                </svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {children}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="border-t border-gray-200 bg-white">
              <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                        isActive
                          ? "text-blue-500"
                          : "text-gray-600 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon />
                    <span className="text-[10px]">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black rounded-b-2xl w-24 h-5"></div>
        </div>
      </div>
    </div>
  );
}
