import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Stars, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [processingOAuth, setProcessingOAuth] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Process OAuth callback on mount
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Check if this is an OAuth callback (has code or error in URL)
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || urlParams.has('error') || 
                             window.location.hash.includes('access_token');
      
      if (hasOAuthParams && !processingOAuth) {
        setProcessingOAuth(true);
        try {
          // The lovable auth library should handle the callback automatically
          // by checking the URL params when signInWithOAuth is called
          const { error } = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: `${window.location.origin}/auth`,
          });
          
          if (error) {
            console.error("OAuth callback error:", error);
            toast.error("Failed to complete sign in. Please try again.");
          } else {
            toast.success("Welcome!");
            navigate("/journal");
          }
        } catch (err) {
          console.error("OAuth callback error:", err);
          toast.error("Failed to complete sign in. Please try again.");
        } finally {
          setProcessingOAuth(false);
          // Clean up URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    processOAuthCallback();
  }, [navigate, processingOAuth]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !processingOAuth) {
      navigate("/journal");
    }
  }, [user, navigate, processingOAuth]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/journal");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try signing in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Please check your email to verify your account.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast.error(`Failed to sign in with ${provider}. Please try again.`);
        console.error("OAuth error:", error);
      }
    } catch (err) {
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      console.error("OAuth error:", err);
    } finally {
      setOauthLoading(null);
    }
  };

  // Show loading state while processing OAuth callback
  if (processingOAuth) {
    return (
      <div className="min-h-screen starfield geometric-pattern flex items-center justify-center p-4">
        <div className="relative z-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gold" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield geometric-pattern flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-gold/30 pulse-glow">
                <Moon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Stars className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-gradient-gold mb-2">
            Dream Companion
          </h1>
          <p className="text-sm text-muted-foreground">رفيق الأحلام</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold text-center mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-5 border-border hover:bg-secondary/50 font-medium"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading || oauthLoading !== null}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full py-5 border-border hover:bg-secondary/50 font-medium"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={loading || oauthLoading !== null}
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-gold"
                  disabled={loading || oauthLoading !== null}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary/50 border-border focus:border-gold"
                  disabled={loading || oauthLoading !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold py-5"
              disabled={loading || oauthLoading !== null}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-gold hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            ← Back to Dream Companion
          </a>
        </div>
      </div>
    </div>
  );
}
