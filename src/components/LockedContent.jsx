import Link from "next/link";

export default function LockedContent({ message = "This content is locked. Upgrade to access." }) {
  return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-4">🔒</div>
      <p className="text-gray-500 mb-4">{message}</p>
      <Link href="/pricing" className="btn-gradient">Upgrade Now</Link>
    </div>
  );
}
