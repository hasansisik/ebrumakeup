import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function EbruMakeupPage() {
  const isAuth = await isAuthenticated();
  if (isAuth) {
    redirect("/ebru-admin");
  } else {
    redirect("/ebru-giris");
  }
}
