{/* Categories */}
{categories.length > 0 && (
  <section className="my-10">
    <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {categories.map(cat => (
        <a key={cat.id} href={`/products?category=${cat.id}`} className="glassmorphism min-w-[120px] p-4 rounded-xl flex flex-col items-center text-center snap-start">
          <img src={cat.image || '/placeholder.jpg'} className="w-12 h-12 rounded-full object-cover mb-2" />
          <span className="text-sm font-medium">{cat.name}</span>
        </a>
      ))}
    </div>
  </section>
)}
