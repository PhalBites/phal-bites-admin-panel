"use client";

import { FranchiseForm } from "../FranchiseForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewFranchisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user?.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return <FranchiseForm />;
}
