import Link from "next/link";
import { notFound } from "next/navigation";
import { optionalAuth } from "@/lib/optionalAuth";
import { prisma } from "@/lib/prisma";
import { computeDisplayName } from "@/lib/deriveNames";
import FollowButton from "./FollowButton";
import MessageButton from "./MessageButton";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await optionalAuth();

  const profileUser = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" }, isActive: true, isBanned: false },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      createdAt: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!profileUser) notFound();

  const isOwnProfile = viewer?.id === profileUser.id;
  const displayName = computeDisplayName(profileUser.firstName, profileUser.lastName, profileUser.email, profileUser.username);
  const initial = (profileUser.firstName ?? profileUser.email).charAt(0).toUpperCase();

  // Check if viewer is following this user
  let isFollowing = false;
  if (viewer && !isOwnProfile) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewer.id, followingId: profileUser.id } },
      select: { id: true },
    });
    isFollowing = !!follow;
  }

  // Followers list (up to 20)
  const followerRows = await prisma.follow.findMany({
    where: { followingId: profileUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      follower: { select: { username: true, firstName: true, lastName: true, email: true } },
    },
  });

  // Following list (up to 20)
  const followingRows = await prisma.follow.findMany({
    where: { followerId: profileUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      following: { select: { username: true, firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-msu-red border-b-2 border-msu-green px-4 py-3 flex items-center gap-4">
        <Link href="/home" className="text-msu-white/80 text-sm hover:text-msu-white">&larr; Home</Link>
        <h1 className="text-lg font-bold text-msu-white">Profile</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6 space-y-4">
        {/* Profile card */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-msu-red flex items-center justify-center text-msu-white text-xl font-bold shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{displayName}</p>
                {profileUser.username && (
                  <p className="text-sm text-msu-red">@{profileUser.username}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Joined {profileUser.createdAt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            {!isOwnProfile && viewer && (
              <div className="flex flex-col items-end gap-2">
                <FollowButton targetId={profileUser.id} initialFollowing={isFollowing} />
                {profileUser.username && (
                  <MessageButton username={profileUser.username} />
                )}
              </div>
            )}
            {isOwnProfile && (
              <Link
                href="/profile"
                className="text-xs text-msu-red hover:underline font-medium"
              >
                Edit Profile
              </Link>
            )}
          </div>

          {/* Follow stats */}
          <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">{profileUser._count.followers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">{profileUser._count.following}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
            </div>
          </div>
        </section>

        {/* Followers list */}
        {followerRows.length > 0 && (
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-msu-red">
              Followers {profileUser._count.followers > 20 && <span className="text-gray-400 font-normal">(showing 20)</span>}
            </h2>
            <ul className="space-y-2">
              {followerRows.map((r, i) => {
                const u = r.follower;
                const name = computeDisplayName(u.firstName, u.lastName, u.email, u.username);
                return (
                  <li key={i}>
                    {u.username ? (
                      <Link href={`/users/${u.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="h-8 w-8 rounded-full bg-msu-red/10 text-msu-red flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-msu-red/10 text-msu-red flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{name}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Following list */}
        {followingRows.length > 0 && (
          <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-msu-red">
              Following {profileUser._count.following > 20 && <span className="text-gray-400 font-normal">(showing 20)</span>}
            </h2>
            <ul className="space-y-2">
              {followingRows.map((r, i) => {
                const u = r.following;
                const name = computeDisplayName(u.firstName, u.lastName, u.email, u.username);
                return (
                  <li key={i}>
                    {u.username ? (
                      <Link href={`/users/${u.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="h-8 w-8 rounded-full bg-msu-red/10 text-msu-red flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-msu-red/10 text-msu-red flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{name}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
