import { useState } from "react";
import { useAuthContext } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, sendMagicLink } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (useMagicLink) {
        const { error } = await sendMagicLink(email);
        if (error) throw error;
        setMessage("Check your email for the magic link!");
        setEmail("");
      } else {
        const { error } = isSignUp
          ? await signUp(email, password)
          : await signIn(email, password);

        if (error) throw error;

        if (isSignUp) {
          setMessage("Check your email to confirm your account!");
          setEmail("");
          setPassword("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Gymnastics Lineup Builder
          </CardTitle>
          <CardDescription>
            Sign in to manage your team lineups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg
              className="mr-2 size-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password or Magic Link Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-primary bg-primary/10 p-3 rounded-md">
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Loading..."
                : useMagicLink
                ? "Send Magic Link"
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm text-center">
            {!useMagicLink && (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setPassword("");
                setError(null);
                setMessage(null);
              }}
              disabled={loading}
            >
              {useMagicLink
                ? "Use password instead"
                : "Use magic link (passwordless)"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
