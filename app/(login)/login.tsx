"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { signInWithMagicLink } from "./actions";
import { useActionState, useState } from "react";
import { ActionState } from "@/lib/auth/middleware";
import SVGLogo from "@/components/svg-logo";
import { createClient } from "@/supabase/client";
import { config } from "@/config";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const discountCode = searchParams.get("discountCode");

  const handleGoogleSignIn = () => {
    const redirectTo = `${config.domainName}/api/auth/callback`;
    setLoading(true);
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectTo}?priceId=${encodeURIComponent(
          priceId || ""
        )}&discountCode=${encodeURIComponent(
          discountCode || ""
        )}&redirect=${encodeURIComponent("/test")}`,
      },
    });
    setLoading(false);
  };

  const [magicLinkState, magicLinkAction, pending] = useActionState<
    ActionState,
    FormData
  >(signInWithMagicLink, { error: "", success: "" });

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <SVGLogo />
        </div>

        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-center text-gray-900">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          {mode === "signin"
            ? "Sign in to continue to your account"
            : "Get started with your new account"}
        </p>

        <div className="mt-10">
          {magicLinkState?.success ? (
            <div className="p-6 text-center bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-green-700">
                We&apos;ve sent you a magic link to sign in to your account.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <form action={magicLinkAction} className="space-y-4">
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="px-4 h-12 bg-white rounded-lg border-gray-200 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
                <input type="hidden" name="priceId" value={priceId || ""} />
                <input
                  type="hidden"
                  name="discountCode"
                  value={discountCode || ""}
                />

                <Button
                  type="submit"
                  className="w-full h-12 font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {pending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="flex absolute inset-0 items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="flex relative justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-gradient-to-b from-white to-gray-50">
                    or
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                className="w-full h-12 font-medium text-gray-700 bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex justify-center items-center">
                    <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>
            </div>
          )}

          {magicLinkState?.error && (
            <div className="mt-4 text-sm text-red-600">
              {magicLinkState.error}
            </div>
          )}

          <p className="mt-8 text-sm text-center text-gray-600">
            {mode === "signin"
              ? "New to our platform? "
              : "Already have an account? "}
            <Link
              href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                redirect ? `?redirect=${redirect}` : ""
              }${priceId ? `&priceId=${priceId}` : ""}`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
