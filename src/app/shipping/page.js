export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shipping Policy - Quick Shop',
  description: 'Quick Shop Shipping Policy - Delivery timelines, charges, and tracking information.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Shipping Policy</h1>
      <p className="text-gray-500 mb-6">Last Updated: June 2026</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Shipping Partners</h2>
          <p>We partner with trusted courier services including India Post, DTDC, Blue Dart, Delhivery, and Shiprocket to deliver your orders safely across India.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Shipping Charges</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free Shipping:</strong> On orders above ₹499</li>
            <li><strong>Standard Shipping:</strong> ₹49 for orders below ₹499</li>
            <li><strong>Express Shipping:</strong> ₹99 (available in select cities)</li>
            <li><strong>COD Charges:</strong> Additional ₹29 for Cash on Delivery orders</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Delivery Timelines</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Metro Cities:</strong> 2-4 business days</li>
            <li><strong>Tier 2 Cities:</strong> 4-6 business days</li>
            <li><strong>Rest of India:</strong> 6-10 business days</li>
          </ul>
          <p className="mt-2">Delivery times are estimates and may vary due to holidays, weather, or other unforeseen circumstances.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Order Tracking</h2>
          <p>Once your order is shipped, you will receive a tracking link via email and SMS/whatsapp. You can also track your order in the "My Orders" section of your dashboard.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Shipping Restrictions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We currently ship only within India.</li>
            <li>P.O. Box addresses may not be serviceable for COD orders.</li>
            <li>Digital products are delivered instantly via email/download link – no physical shipping.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Undelivered Packages</h2>
          <p>If a package is returned due to incorrect address, non-availability, or refusal, we will contact you. Re-shipping charges may apply.</p>
        </section>
      </div>
    </div>
  );
}
