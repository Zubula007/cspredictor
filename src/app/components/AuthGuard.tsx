"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import authService from "../services/authService";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    const player =
      authService.getCurrentPlayer();

    /*
     * Public pages.
     *
     * These must remain accessible so that
     * new players can register and existing
     * players can log in.
     */
    const publicPages = [
      "/login",
      "/register",
    ];

    const isPublicPage =
      publicPages.some(
        (page) =>
          pathname === page ||
          pathname.startsWith(`${page}/`)
      );

    /*
     * No logged-in player.
     */
    if (!player) {
      if (!isPublicPage) {
        router.replace("/login");
        return;
      }

      setChecking(false);
      return;
    }

    /*
     * Logged-in player trying to access
     * login/register.
     */
    if (isPublicPage) {
      router.replace("/");
      return;
    }

    /*
     * Admin area is Admin only.
     */
    const isAdminRoute =
      pathname === "/admin" ||
      pathname.startsWith("/admin/");

    if (
      isAdminRoute &&
      !player.isAdmin
    ) {
      router.replace("/");
      return;
    }

    /*
     * Player is authorised.
     */
    setChecking(false);
  }, [
    pathname,
    router,
  ]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="text-4xl">
            🏆
          </div>

          <p className="mt-4 font-bold text-yellow-400">
            Checking CSPredictor access...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}