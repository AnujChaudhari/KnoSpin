export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy - Quick Shop',
  description: 'Quick Shop Privacy Policy - How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-gray-500 mb-6">Last Updated: June 2026</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p>When you use Quick Shop, we may collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
            <li><strong>Payment Information:</strong> Payment details are processed securely through our payment partners (Razorpay, Cashfree) and are not stored on our servers.</li>
            <li><strong>Usage Data:</strong> Pages visited, products viewed, time spent on site, and other analytics data to improve our services.</li>
            <li><strong>Device Information:</strong> IP address, browser type, device type, and operating system for security and fraud prevention.</li>
            <li><strong>Referral Data:</strong> When you participate in our referral program, we track referral codes, successful referrals, and reward eligibility.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about your orders, account, and promotional offers</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To manage our referral program and track referral rewards</li>
            <li>To improve our website, products, and customer experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Referral Program Data</h2>
          <p>Our referral program allows you to share unique referral codes with friends. We collect:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Your unique referral code and sharing activity</li>
            <li>Information about users who sign up using your referral code</li>
            <li>Referral reward status and history</li>
            <li>Referral earnings and wallet credits</li>
          </ul>
          <p className="mt-2">Referral data is used solely for administering the referral program and awarding eligible rewards. Referral rewards are credited only after successful order delivery, not on signup alone.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Keep you logged in (session cookies)</li>
            <li>Remember your preferences and cart items</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Prevent fraudulent activities</li>
          </ul>
          <p className="mt-2">You can disable cookies in your browser settings, but some features may not work properly.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
          <p>We do NOT sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Payment Processors:</strong> Razorpay/Cashfree for payment processing</li>
            <li><strong>Shipping Partners:</strong> To deliver your orders</li>
            <li><strong>Service Providers:</strong> Cloud hosting (Vercel), email services (Resend/EmailJS), image hosting (Cloudinary)</li>
            <li><strong>Legal Authorities:</strong> When required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
          <p>We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure authentication via Firebase</li>
            <li>Regular security audits</li>
            <li>Access controls and role-based permissions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and download your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <strong>thinklabvies@gmail.com</strong>.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. Order-related data is retained for legal and accounting purposes. Referral data is retained for the duration of the referral program.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
          <p>Quick Shop is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or through our website.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
          <p>For privacy-related inquiries:</p>
          <p className="mt-2"><strong>Email:</strong> privacy@quickshop.com</p>
          <p><strong>Address:</strong> Quick Shop, India</p>
        </section>
      </div>
    </div>
  );
}
