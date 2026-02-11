import { requireAuth } from "@/lib/requireAuth";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        <p className="text-gray-600 dark:text-gray-400">Role: {user.role}</p>
        <LogoutButton />
      </div>
    </div>
  );
}
