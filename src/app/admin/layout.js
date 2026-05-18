export const dynamic = 'force-dynamic';
import AdminClientLayout from './client-layout';

export default function AdminLayout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
