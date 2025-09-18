import Sidebar from "../components/Sidebar";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
  }
export default function DashboardLayout({children} : DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4 overflow-auto">
        <div className="p-6 mx-auto">
            {children}            
        </div>
      </div>
    </div>
  );
}
