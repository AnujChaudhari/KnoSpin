export const dynamic = 'force-dynamic';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Returns & Refunds Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: January 2026
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 space-y-8">
          
          {/* Introduction */}
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
            At <strong>Quick Shop</strong>, we want you to be completely satisfied with your purchase. 
            If for any reason you are not happy, you may return the product within the timeframe below, 
            subject to the conditions outlined in this policy.
          </p>

          {/* Section 1: Return Window */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📅 1. Return Window
            </h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              You have <strong>7 calendar days</strong> from the date of delivery to request a return. 
              After 7 days, unfortunately we cannot offer you a return or exchange.
            </p>
          </section>

          {/* Section 2: Non‑Returnable Items */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🚫 2. Non‑Returnable Items
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
              <li>Digital products (e‑books, software licences, digital downloads)</li>
              <li>Gift cards and vouchers</li>
              <li>Personalised or custom‑made items</li>
              <li>Intimate apparel (for hygiene reasons)</li>
              <li>Perishable goods (food, flowers)</li>
              <li>Items marked as “Final Sale” or “Clearance”</li>
            </ul>
          </section>

          {/* Section 3: How to Return */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📸 3. How to Request a Return
            </h2>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-200 space-y-3">
              <li>Go to <strong>My Dashboard → Orders</strong> and click the <strong>Return</strong> button on the order.</li>
              <li>Select the reason for return (wrong product, damaged, size issue, etc.).</li>
              <li>Upload a clear photo of the product (required).</li>
              <li>Submit the request. Our team will review it within 24‑48 hours.</li>
              <li>Once approved, you will receive a return address and instructions via email.</li>
            </ol>
          </section>

          {/* Section 4: Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              💰 4. Refunds
            </h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              After we receive and inspect the returned item, we will notify you about the approval 
              or rejection of your refund. If approved:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2 mt-2">
              <li>The refund will be processed within <strong>5‑7 business days</strong>.</li>
              <li>Payment will be credited to your original payment method (Razorpay UPI, card, or net banking).</li>
              <li>Cash on Delivery (COD) orders will be refunded via UPI or bank transfer after you share your details.</li>
              <li>Shipping charges (if any) are non‑refundable.</li>
            </ul>
          </section>

          {/* Section 5: Replacements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🔄 5. Replacements
            </h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              If the item is defective or damaged, you may choose a <strong>replacement</strong> instead 
              of a refund. The replacement will be shipped free of charge once the original item is 
              received and inspected. Replacement orders usually arrive within 5‑7 business days.
            </p>
          </section>

          {/* Section 6: Cancellation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              ❌ 6. Order Cancellation
            </h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              You may cancel an order <strong>within 24 hours</strong> of placing it, provided the 
              order has not yet been shipped. To cancel, go to <strong>My Dashboard → Orders</strong> 
              and click the Cancel button. Once shipped, the order cannot be cancelled and will fall 
              under our return policy.
            </p>
          </section>

          {/* Section 7: Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📞 7. Need Help?
            </h2>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
              If you have any questions or need assistance with your return, please contact our support team:
            </p>
            <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-gray-800 dark:text-gray-100">
                📧 <strong>Email:</strong> support@quick-shop.com<br />
                📱 <strong>Phone:</strong> +91 98765 43210<br />
                🕒 <strong>Hours:</strong> Monday – Saturday, 10:00 AM to 6:00 PM IST
              </p>
            </div>
          </section>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-8">
          <a href="/" className="text-primary-600 hover:underline font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
