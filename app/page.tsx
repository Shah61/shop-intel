"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in page immediately
    router.push("/sign-in");
  }, [router]);

  return null;
}
