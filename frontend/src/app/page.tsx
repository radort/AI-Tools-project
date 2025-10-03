'use client'

import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      try {
        // Validate that user data is actually parseable
        JSON.parse(userData);
        // If user is logged in, redirect to tools page
        window.location.href = '/tools';
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Tools Hub</h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover and manage AI tools for your projects
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Welcome!</h2>
            <p className="text-blue-700 text-sm mb-4">
              Please log in to access the AI tools collection, create your own tool entries, and manage your submissions.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Get Started - Login
            </Link>
          </div>

          <div className="text-xs text-gray-500">
            <p className="mb-2">Test credentials available:</p>
            <div className="space-y-1 text-left bg-gray-100 p-3 rounded">
              <div><strong>Developer:</strong> developer@example.com / password123</div>
              <div><strong>Designer:</strong> designer@example.com / password123</div>
              <div><strong>Analyst:</strong> analyst@example.com / password123</div>
              <div><strong>PM:</strong> pm@example.com / password123</div>
              <div><strong>Owner:</strong> owner@example.com / password123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
