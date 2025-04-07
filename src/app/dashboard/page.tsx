import { requireAuth } from "../../../lib/auth/auth-utils";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome back, {user.name}
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your food delivery service today.
        </p>
      </div>
    </div>
  );
}
