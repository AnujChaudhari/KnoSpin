export default function Newsletter() {
  return (
    <section className="my-12 bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Get the latest updates and offers straight to your inbox.</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="input-field flex-grow"
        />
        <button className="btn-gradient whitespace-nowrap">Subscribe</button>
      </div>
    </section>
  );
}
