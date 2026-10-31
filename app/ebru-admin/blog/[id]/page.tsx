import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth";
import { getBlogPostByIdWithStats } from "@/lib/db";
import BlogEditorClient from "@/components/admin/BlogEditorClient";

export const metadata: Metadata = {
  title: "Blog Yazısı Editörü | EbruMakeUp Panel",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/ebru-giris");
  }

  const { id } = await params;
  const isNew = id === "yeni" || id === "new";

  let post = null;
  if (!isNew) {
    post = await getBlogPostByIdWithStats(id);
  }

  return (
    <BlogEditorClient
      initialPost={post}
      isNew={isNew}
      slugId={id}
    />
  );
}
