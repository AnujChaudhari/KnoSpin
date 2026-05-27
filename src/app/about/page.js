export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us - Quick Shop',
  description: 'Learn about Quick Shop - Your trusted online shopping destination with referral rewards.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">About Quick Shop</h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Story</h2>
          <p>Quick Shop was founded in 2026 with a simple mission: to make online shopping accessible, affordable, and rewarding for everyone in India. We believe that shopping should not just be a transaction—it should be an experience that rewards you for being part of our community.</p>
          <p className="mt-2">From electronics to fashion, home essentials to digital products, we curate a wide range of quality products at competitive prices.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p>To empower every Indian shopper with quality products, transparent pricing, and a rewarding shopping experience through our innovative referral and rewards program.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Why Choose Quick Shop?</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>🔄 Refer & Earn:</strong> Share your unique referral code with friends and earn rewards when they shop. Our referral program is designed to benefit both you and your friends.</li>
            <li><strong>💰 Wallet & Rewards:</strong> Earn coins and wallet credits through referrals, cashback, and promotions. Use them on your next purchase!</li>
            <li><strong>📱 Mobile-First Design:</strong> Shop seamlessly on any device—our platform is optimized for mobile, tablet, and desktop.</li>
            <li><strong>🚚 Fast Delivery:</strong> We partner with reliable courier services to deliver your orders quickly and safely.</li>
            <li><strong>🔒 Secure Payments:</strong> Multiple payment options including UPI, Cards, Net Banking, and Cash on Delivery, all processed securely.</li>
            <li><strong>💬 Customer Support:</strong> Dedicated support team to help you with any questions or issues.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Referral Program</h2>
          <p>At Quick Shop, we believe in growing together. Our referral program lets you earn rewards every time a friend makes their first purchase using your referral code.</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Get your unique referral code after signing up</li>
            <li>Share it via WhatsApp, Telegram, or any social platform</li>
            <li>Earn coins and wallet credits when your friend completes their first order</li>
            <li>No limit on how many friends you can refer!</li>
            <li>Referral rewards are credited after successful delivery of the referred order</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p><strong>Email:</strong> thinklabviews@gmail.com</p>
          <p><strong>WhatsApp:</strong> +91 74411 67537</p>
          <p><strong>Address:</strong> Quick Shop, India</p>
        </section>
      </div>
    </div>
  );
}
