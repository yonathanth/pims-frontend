import { Button } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.svg"

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Logo */}
      <img src={logo} alt="PIMS Logo" className="w-200 h-200 mb-6" />

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-extralight mb-2">Welcome to <strong>PIMS</strong></h1>

      {/* Subtitle */}
      <p className="max-w-[40rem] text-xl mb-6">
        Your new Pharmacy Inventory Management System—a lightweight, fully offline desktop app
        designed to help you take control of your stock with speed, accuracy, and confidence.
      </p>

      {/* Features */}
      <div className="text-left max-w-[40rem] mb-8">
        <h2 className="font-semibold mb-2">What PIMS Can Do</h2>
        <ul className="list-disc text-lg text-[0.9rem] list-inside space-y-1">
          <li>Track every item by SKU, batch number, and expiry date</li>
          <li>Receive low-stock and near-expiry alerts via local desktop notifications</li>
          <li>Generate and print purchase orders, inventory reports, and shipping labels—complete with your pharmacy’s license, address, and contact info</li>
          <li>Adjust stock levels, view transaction history, and drill into batch-level details—all without ever going online</li>
        </ul>
      </div>

      {/* Button */}
      <Button
        kind="primary"
        renderIcon={ArrowRight}
        onClick={() => navigate("/onboarding/step1")}
      >
        Get Started
      </Button>
    </div>
  );
}
