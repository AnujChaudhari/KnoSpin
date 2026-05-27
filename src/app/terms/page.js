export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms & Conditions - Quick Shop',
  description: 'Quick Shop Terms and Conditions - Rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms & Conditions</h1>
      <p className="text-gray-500 mb-6">Last Updated: June 2026</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using Quick Shop ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Account Registration</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must be at least 18 years old to create an account.</li>
            <li>One person may maintain only one account. Multiple accounts may result in suspension.</li>
            <li>Email verification is mandatory before you can place orders or earn referral rewards.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Referral Program Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Each user receives a unique referral code upon registration.</li>
            <li>You may share your referral code with friends and family.</li>
            <li>Referral rewards (coins, wallet credits, or discounts) are credited ONLY after the referred user completes a successful purchase AND the order is delivered (for COD) or payment is confirmed (for prepaid).</li>
            <li>Self-referral, fake accounts, or any fraudulent activity will result in immediate disqualification and possible account suspension.</li>
            <li>Quick Shop reserves the right to modify or terminate the referral program at any time.</li>
            <li>Referral rewards are non-transferable and non-withdrawable unless explicitly stated.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Orders and Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All orders are subject to availability and confirmation.</li>
            <li>Prices are listed in Indian Rupees (₹) and may change without notice.</li>
            <li>We accept Cash on Delivery (COD) and online payments via Razorpay/Cashfree.</li>
            <li>COD orders may require phone verification.</li>
            <li>We reserve the right to cancel any order for reasons including but not limited to: product unavailability, pricing errors, or suspected fraud.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Shipping & Delivery</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Please refer to our Shipping Policy for detailed information.</li>
            <li>Delivery times are estimates and may vary based on location and circumstances.</li>
            <li>We are not liable for delays caused by carriers or unforeseen events.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Returns & Refunds</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Products can be returned within 7 days of delivery if they are damaged, defective, or not as described.</li>
            <li>Digital products are non-returnable once downloaded.</li>
            <li>Refunds are processed within 7-10 business days after return approval.</li>
            <li>COD refunds are issued as wallet credits unless bank transfer is requested.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
          <p>All content on Quick Shop including logos, designs, text, graphics, and software is the property of Quick Shop and protected by applicable laws.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p>Quick Shop shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
          <p>We reserve the right to suspend or terminate your account for violation of these terms or any fraudulent activity.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>
          <p>For questions about these terms: <strong>legal@quickshop.com</strong></p>
        </section>
      </div>
    </div>
  );
}
