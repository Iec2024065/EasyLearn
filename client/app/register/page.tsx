"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const UserRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log(data)

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
        <p>
          Thank you for registering. Please check your email to verify your
          account.
        </p>
        <Link href="/login">
          <Button className="mt-4">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">User Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default UserRegisterPage;
