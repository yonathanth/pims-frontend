import React from "react";
import { Button } from "@carbon/react";
import { Add, ShoppingCart, Cube, Document, UserAvatarFilledAlt, ChartArea } from "@carbon/icons-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Add Inventory",
    description: "Add new stock items",
    icon: <Add size={24} />,
    className: "",
    to: "/dashboard/inventory",
  },
  {
    label: "Create Order",
    description: "New purchase order",
    icon: <ShoppingCart size={24} />,
    className: "",
    to: "/dashboard/orders",
  },
  {
    label: "Manage Products",
    description: "View all products",
    icon: <Cube size={24} />,
    className: "",
    to: "/dashboard/products",
  },
  {
    label: "Generate Report",
    description: "Financial reports",
    icon: <Document size={24} />,
    className: "",
    to: "/dashboard/reports",
  },
  {
    label: "Manage Staff",
    description: "User management",
    icon: <UserAvatarFilledAlt size={24} />,
    className: "",
    to: "/dashboard/employees",
  },
  {
    label: "Analytics",
    description: "View insights",
    icon: <ChartArea size={24} />,
    className: "",
    to: "/dashboard/Analytics",
  },
];

const QuickActions: React.FC = () =>  {
  const navigate = useNavigate();

  return(
  <div className="rounded-xl border pl-6" >
    <h2 className="text-base font-bold mb-6">Quick Actions</h2>
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          kind="ghost"
          className={`flex flex-col items-start h-30 w-full px-4 py-3 rounded-lg shadow-none border ${action.className}`}
          style={{ justifyContent: "flex-start", alignItems: "flex-start", backgroundColor: 'var(--cds-layer)', color: 'var(--cds-text-secondary)'  }}
          onClick={() => navigate(action.to)}
        >
          <div className="mb-2">{action.icon}</div>
          <span className="font-semibold">{action.label}</span>
          <span className="text-xs text-gray-500">{action.description}</span>
        </Button>
      ))}
    </div>
  </div>
); }

export default QuickActions;