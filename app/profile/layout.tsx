"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { Banner } from "@/components/shared/banner";
import { Popular } from "@/components/shared/popular";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile";

  return (
    <>
      <main>{children}</main>
      {isProfilePage && (
        <>
          <Header />
          <Banner />
          <Popular />
          <Footer />
        </>
      )}
    </>
  );
}
