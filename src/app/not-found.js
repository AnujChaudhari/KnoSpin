export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-500">Page Not Found</p>
    </div>
  );
}
