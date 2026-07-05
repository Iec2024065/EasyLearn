'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:5000/support/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, subject, message }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Query submitted successfully!');
      router.push('/');
    } else {
      alert(data.error || 'Failed to submit query');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Submit a Support Query</h2>
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          className="w-full border p-2 rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe your issue..."
          className="w-full border p-2 rounded h-32"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Query
        </button>
      </form>
    </div>
  );
}
