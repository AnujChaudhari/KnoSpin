export default function StatCard({ title, value, icon }) {
  return (
    <div className="card flex items-center gap-4 p-6">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}