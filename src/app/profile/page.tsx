import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { computeDisplayName, normalizeUsername } from "@/lib/deriveNames";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const authUser = await requireAuth();
  const params = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, username: true },
  });

  if (!user) redirect("/login");

  const displayName = computeDisplayName(user.firstName, user.lastName, user.email, user.username);
  const maskedEmail =
    user.email.split("@")[0].slice(0, 3) + "***@" + user.email.split("@")[1];

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await requireAuth();
    const firstName = (formData.get("firstName") as string ?? "").trim().slice(0, 40) || null;
    const lastName = (formData.get("lastName") as string ?? "").trim().slice(0, 40) || null;

    const rawUsername = (formData.get("username") as string ?? "").trim();
    let username: string | null = null;

    if (rawUsername) {
      username = normalizeUsername(rawUsername);
      if (!username) {
        redirect("/profile?err=username_invalid");
      }
      // Check uniqueness
      const existing = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (existing && existing.id !== session.id) {
        redirect("/profile?err=username_taken");
      }
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { firstName, lastName, username },
    });
    revalidatePath("/profile");
    revalidatePath("/home");
    redirect("/profile");
  }

  const errMsg = params.err === "username_taken"
    ? "That username is already taken."
    : params.err === "username_invalid"
      ? "Username must be 3–20 characters (a-z, 0-9, underscore)."
      : null;

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
              {user.username ? (
                <p className="text-sm text-msu-red">@{user.username}</p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">Username: not set</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{maskedEmail}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </section>

        {/* Edit form */}
        <form action={updateProfile} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <h2 className="text-base font-semibold text-msu-red">Edit Profile</h2>

          {errMsg && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
              {errMsg}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-md">@</span>
              <input
                id="username"
                name="username"
                type="text"
                maxLength={20}
                defaultValue={user.username ?? ""}
                placeholder="username"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-r-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-msu-red"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">3–20 characters: letters, numbers, underscore</p>
          </div>

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
