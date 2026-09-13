"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/authActions";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isLogin) {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        window.location.reload();
      }
    } else {
      const res = await registerUser(formData);
      if (!res.success) {
        setError(res.error || "Failed to register");
        setLoading(false);
      } else {
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (loginRes?.error) {
          setError(loginRes.error);
        } else {
          window.location.reload();
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-2xl py-3.5 px-4 font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-sm font-medium">or</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-gray-800"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-gray-800"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-gray-800"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-2xl py-3.5 font-bold mt-2 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg shadow-black/20"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-black font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
