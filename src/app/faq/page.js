export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FAQ - Quick Shop',
  description: 'Frequently Asked Questions about Quick Shop orders, shipping, referrals, and more.',
};

const faqs = [
  { q: "How do I place an order?", a: "Browse products, add to cart, go to checkout, fill your shipping address, choose payment method, and place the order." },
  { q: "How does the referral program work?", a: "After signing up, you get a unique referral code. Share it with friends. When they sign up using your code and complete their first purchase, you earn referral rewards (coins/wallet credits) after their order is delivered successfully." },
  { q: "When do I get referral rewards?", a: "Referral rewards are credited only after the referred friend's order is successfully delivered (for COD) or payment is confirmed (for prepaid orders). Rewards are not given on signup alone." },
  { q: "What payment methods are accepted?", a: "We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD)." },
  { q: "How can I track my order?", a: "Once shipped, you'll receive a tracking link via email. You can also check 'My Orders' in your dashboard." },
  { q: "What is the return policy?", a: "You can return physical products within 7 days if damaged, defective, or not as described. Digital products are non-returnable." },
  { q: "How do I use my wallet coins?", a: "During checkout, you can apply your available coins for a discount on your order total." },
  { q: "Can I have multiple accounts?", a: "No, multiple accounts are against our terms and may result in suspension. One person, one account." },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details key={idx} className="card cursor-pointer">
            <summary className="font-semibold text-lg">{faq.q}</summary>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
