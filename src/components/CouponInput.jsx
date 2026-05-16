"use client";
import { useState } from "react";

export default function CouponInput() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (code === "QUICK10") {
      setDiscount(10);
      setApplied(true);
    } else {
      alert("Invalid coupon");
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter coupon code"
        className="input-field flex-grow"
      />
      <button onClick={handleApply} className="btn-gradient" disabled={applied}>
        {applied ? "Applied" : "Apply"}
      </button>
      {applied && <span className="text-green-500 text-sm">₹{discount} off</span>}
    </div>
  );
}
