import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { computeDisplayName } from "@/lib/deriveNames";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const authUser = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });

  if (!user) redirect("/login");

  const displayName = computeDisplayName(user.firstName, user.lastName, user.email);
  const maskedEmail =
    user.email.split("@")[0].slice(0, 3) + "***@" + user.email.split("@")[1];

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await requireAuth();
    const firstName = (formData.get("firstName") as string ?? "").trim().slice(0, 40) || null;
    const lastName = (formData.get("lastName") as string ?? "").trim().slice(0, 40) || null;
    await prisma.user.update({
      where: { id: session.id },
      data: { firstName, lastName },
    });
    revalidatePath("/profile");
    revalidatePath("/home");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-msu-white">Profile</h1>
        <LogoutButton />
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        {/* Display card */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-msu-red flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(user.firstName ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{maskedEmail}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </section>

        {/* Edit form */}
        <form action={updateProfile} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <h2 className="text-base font-semibold text-msu-red">Edit Name</h2>

          <div className="space-y-1">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              maxLength={40}
              defaultValue={user.firstName ?? ""}
              placeholder="First name"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-msu-red"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              maxLength={40}
              defaultValue={user.lastName ?? ""}
              placeholder="Last name"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-msu-red"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-sm font-medium rounded-md bg-msu-red text-white hover:bg-red-700 transition-colors"
          >
            Save
          </button>
        </form>

        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
