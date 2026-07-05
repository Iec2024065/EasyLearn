"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const VerifyPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) {
        setError("Invalid verification link.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/users/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("Email verified successfully!");
        } else {
          setError(data.error || "Email verification failed.");
        }
      } catch (err) {
        setError("An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [email]);

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>{message}</p>
      )}
      <Link href="/login">
        <Button className="mt-4">Go to Login</Button>
      </Link>
    </div>
  );
};

export default VerifyPage;
