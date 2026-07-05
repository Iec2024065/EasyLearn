"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Query {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function SupportTab() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selected, setSelected] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all queries
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/support/all");
        if (!res.ok) throw new Error("Failed to fetch queries");
        const data = await res.json();
        setQueries(data);
      } catch (err) {
        console.error("Error fetching support queries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/support/resolve/${id}`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Query marked as resolved and email sent!");
        setQueries((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: "resolved" } : q))
        );
        setSelected(null);
      } else {
        alert("Failed to resolve query");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading support queries...
      </div>
    );

  // Detail view
  if (selected)
    return (
      <div className="p-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setSelected(null)}
        >
          ← Back to Queries
        </Button>
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">{selected.subject}</h2>
          <p className="text-sm text-gray-600">
            From: {selected.name} ({selected.email})
          </p>
          <p className="text-gray-700">{selected.message}</p>
          <Button
            onClick={() => handleResolve(selected.id)}
            disabled={selected.status === "resolved"}
            className={`${
              selected.status === "resolved"
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {selected.status === "resolved" ? "Resolved" : "Mark as Resolved"}
          </Button>
        </Card>
      </div>
    );

  // Query list
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {queries.map((q) => (
        <Card
          key={q.id}
          onClick={() => setSelected(q)}
          className="p-4 cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg">{q.subject}</h3>
          <p className="text-sm text-gray-600">From: {q.name}</p>
          <p
            className={`text-xs mt-2 font-semibold ${
              q.status === "resolved"
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {q.status.toUpperCase()}
          </p>
        </Card>
      ))}

      {queries.length === 0 && (
        <p className="text-gray-500 text-center col-span-full">
          No support queries found.
        </p>
      )}
    </div>
  );
}
