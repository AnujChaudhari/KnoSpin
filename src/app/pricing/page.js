"use client";
import Link from "next/link";

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const plans = [
  {
    name: "Free",
    price: "₹0",
    yearly: null,
    monthly: null,
    features: [
      "View syllabus (read‑only)",
      "Access selected free digital products",
      "Community access (limited posting)",
      "Spin‑to‑earn coins",
      "Upload syllabus (personal storage)",
    ],
    cta: "Current Plan",
    href: "/signup",
    disabled: true,
    popular: false,
  },
  {
    name: "Premium Lite",
    priceYearly: "₹349/year",
    priceMonthly: "₹32/month",
    features: [
      "All Free features",
      "Downloadable notes (PDFs)",
      "Assignments with solutions",
      "Project files & templates",
      "Selected paid courses",
      "Syllabus upload & personal storage",
      "No ads",
    ],
    cta: "Upgrade to Lite",
    href: "/dashboard/upgrade-details?plan=premium_lite",
    popular: true,
  },
  {
    name: "Premium Pro",
    priceYearly: "₹599/year",
    priceMonthly: "₹56/month",
    features: [
      "All Premium Lite features",
      "15+ Unique Personality Development subjects",
      "Advanced projects with source code",
      "All paid courses (full library)",
      "Priority support (24h response)",
      "Exclusive webinars (optional)",
    ],
    cta: "Upgrade to Pro",
    href: "/dashboard/upgrade-details?plan=premium_pro",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-2">Choose Your Plan</h1>
      <p className="text-center text-gray-500 mb-12">Start free, upgrade anytime. No hidden charges.</p>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative card flex flex-col ${plan.popular ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            )}
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            {plan.priceYearly ? (
              <div className="mb-4">
                <p className="text-3xl font-bold">{plan.priceYearly}</p>
                <p className="text-sm text-gray-500">or {plan.priceMonthly}</p>
              </div>
            ) : (
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
            )}
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckIcon />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </ul>
            {plan.disabled ? (
              <button disabled className="btn-gradient opacity-50 cursor-not-allowed w-full">{plan.cta}</button>
            ) : (
              <Link href={plan.href} className="btn-gradient w-full text-center block">{plan.cta}</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
