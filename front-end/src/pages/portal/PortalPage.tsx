import ThemeToggle from "#components/molecules/ThemeToggle";
import { Input } from "#components/ui/input";
import { apiPost } from "#lib/api";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  HouseIcon,
  LockIcon,
  SpinnerIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoBlack from "../../assets/icons/LogoBlack";
import LogoYellow from "../../assets/icons/LogoYellow";

type View = "continue" | "select" | "admin";

type LoginResponse = {
  id: string;
  name: string;
  email: string;
  accountRole: "admin" | "member" | "editor";
};

function readSavedUser(): LoginResponse | null {
  try {
    const raw = localStorage.getItem("portal_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoginResponse;
    if (parsed?.id && parsed?.name && parsed?.email) return parsed;
    return null;
  } catch {
    localStorage.removeItem("portal_user");
    return null;
  }
}

const PortalPage = () => {
  const navigate = useNavigate();
  const [savedUser, setSavedUser] = useState<LoginResponse | null>(() => readSavedUser());
  const [view, setView] = useState<View>(() => (readSavedUser() ? "continue" : "select"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await apiPost<LoginResponse>("/api/auth/login", { email, password });
      localStorage.setItem("portal_user", JSON.stringify(user));
      navigate("/portal/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("portal_user");
    setSavedUser(null);
    setView("select");
  };

  return (
    <div className="bg-primary relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Tiled logo pattern background — offset brick rows */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-8 overflow-hidden opacity-90">
        {Array.from({ length: 16 }).map((_, r) => (
          <div
            key={r}
            className={`flex shrink-0 justify-center gap-16 ${r % 2 ? "translate-x-15" : ""}`}
          >
            {Array.from({ length: 18 }).map((_, c) => (
              <LogoBlack key={c} className="h-14 w-14 shrink-0" />
            ))}
          </div>
        ))}
      </div>
      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      {/* Card */}
      <div className="border-foreground/10 bg-background/70 relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
        {/* Theme toggle — top-right corner */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Home breadcrumb */}
        <div className="px-6 pt-5">
          <button
            onClick={() => navigate("/")}
            className="border-foreground/10 bg-foreground/5 text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors"
          >
            <HouseIcon size={12} />
            Home
          </button>
        </div>

        <div className="px-8 pt-6 pb-8">
          {/* LogoYellow + heading */}
          <div className="mb-8 flex flex-col gap-4">
            <LogoYellow className="text-primary h-9 w-9" />
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                {view === "continue" ? "Welcome back" : "Welcome to Portal"}
              </h1>
              <p className="text-foreground/50 mt-1 text-sm">
                {view === "continue" && "Bạn đã đăng nhập trên thiết bị này"}
                {view === "select" && "Please select your portal type"}
                {view === "admin" && "Admin Portal — Sign in to continue"}
              </p>
            </div>
          </div>

          {/* ── Continue with saved session ── */}
          {view === "continue" && savedUser && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/portal/dashboard")}
                className="group hover:border-primary/50 hover:bg-primary/10 border-foreground/10 bg-foreground/5 flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all"
              >
                <div className="bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors">
                  {savedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground/40 text-[11px] tracking-wider uppercase">
                    Truy cập với tài khoản
                  </p>
                  <p className="text-foreground truncate text-sm font-semibold">{savedUser.name}</p>
                  <p className="text-foreground/40 mt-0.5 truncate text-xs">{savedUser.email}</p>
                </div>
                <ArrowRightIcon
                  size={16}
                  className="group-hover:text-primary text-foreground/30 shrink-0 transition-colors"
                />
              </button>

              <button
                onClick={handleSwitchAccount}
                className="text-foreground/40 hover:text-foreground inline-flex items-center justify-center gap-1.5 self-center rounded-lg px-3 py-1.5 text-xs transition-colors"
              >
                <UserCircleIcon size={14} />
                Đăng nhập tài khoản khác
              </button>
            </div>
          )}

          {/* ── Selection view ── */}
          {view === "select" && (
            <div className="flex flex-col gap-3">
              {/* Admin Portal */}
              <button
                onClick={() => setView("admin")}
                className="group hover:border-primary/50 hover:bg-primary/10 border-foreground/10 bg-foreground/5 flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all"
              >
                <div className="bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                  <BriefcaseIcon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-semibold">Admin Portal</p>
                  <p className="text-foreground/40 mt-0.5 text-xs">Access for BeeZ team members</p>
                </div>
                <ArrowRightIcon
                  size={16}
                  className="group-hover:text-primary text-foreground/30 shrink-0 transition-colors"
                />
              </button>

              {/* Client Portal — coming soon */}
              <button
                disabled
                className="group border-foreground/5 bg-foreground/3 flex cursor-not-allowed items-center gap-4 rounded-xl border px-5 py-4 text-left opacity-50"
              >
                <div className="bg-foreground/10 text-foreground/40 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <UsersThreeIcon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground/60 text-sm font-semibold">Client Portal</p>
                    <span className="border-foreground/20 text-foreground/40 rounded-full border px-2 py-0.5 text-[10px]">
                      Coming soon
                    </span>
                  </div>
                  <p className="text-foreground/30 mt-0.5 text-xs">Access for our valued clients</p>
                </div>
                <ArrowRightIcon size={16} className="text-foreground/20 shrink-0" />
              </button>
            </div>
          )}

          {/* ── Admin login view ── */}
          {view === "admin" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-foreground/70 text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon
                    size={15}
                    className="text-foreground/30 absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@beezvn.com"
                    required
                    className="h-11 pr-4 pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-foreground/70 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <LockIcon
                    size={15}
                    className="text-foreground/30 absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10 pl-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-foreground/30 hover:text-foreground/70 absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setView("select");
                    setError(null);
                  }}
                  className="border-foreground/10 bg-foreground/5 text-foreground/60 hover:text-foreground flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm transition-colors"
                >
                  <ArrowLeftIcon size={14} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && <SpinnerIcon size={15} className="animate-spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-foreground/20 mt-8 text-center text-[11px]">
            BeeZ Production © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
