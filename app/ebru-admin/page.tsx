import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import {
  getBlogPosts,
  getPortfolioItems,
  getAnalyticsStats,
  getHeroColumns,
} from "@/lib/db";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Yönetim Paneli | EbruMakeUp",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function DashboardPage() {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/ebru-giris");
  }

  const [posts, portfolio, stats, heroColumns] = await Promise.all([
    getBlogPosts(),
    getPortfolioItems(),
    getAnalyticsStats(),
    getHeroColumns(),
  ]);

  return (
    <AdminDashboard
      initialPosts={posts}
      initialPortfolio={portfolio}
      initialAnalytics={stats}
      initialHeroColumns={heroColumns}
    />
  );
}
