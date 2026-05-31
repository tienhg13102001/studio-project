import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HouseIcon,
  BriefcaseIcon,
  UsersThreeIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import LogoYellow from "../../assets/icons/LogoYellow";
import LogoBlack from "../../assets/icons/LogoBlack";
import { apiPost } from "#lib/api";

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
      {/* Tiled logo pattern background */}
      <div className="pointer-events-none absolute inset-0 m-[-20%] grid rotate-25 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] place-items-center gap-6 p-6 opacity-20">
        {Array.from({ length: 360 }).map((_, i) => (
          <LogoBlack key={i} className="h-20 w-20" />
        ))}
      </div>
      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
        {/* Home breadcrumb */}
        <div className="px-6 pt-5">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
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
              <h1 className="text-3xl font-bold text-white">
                {view === "continue" ? "Welcome back" : "Welcome to Portal"}
              </h1>
              <p className="mt-1 text-sm text-white/50">
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
                className="group hover:border-primary/50 hover:bg-primary/10 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all"
              >
                <div className="bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors">
                  {savedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] tracking-wider text-white/40 uppercase">
                    Truy cập với tài khoản
                  </p>
                  <p className="truncate text-sm font-semibold text-white">{savedUser.name}</p>
                  <p className="mt-0.5 truncate text-xs text-white/40">{savedUser.email}</p>
                </div>
                <ArrowRightIcon
                  size={16}
                  className="group-hover:text-primary shrink-0 text-white/30 transition-colors"
                />
              </button>

              <button
                onClick={handleSwitchAccount}
                className="inline-flex items-center justify-center gap-1.5 self-center rounded-lg px-3 py-1.5 text-xs text-white/40 transition-colors hover:text-white"
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
                className="group hover:border-primary/50 hover:bg-primary/10 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all"
              >
                <div className="bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                  <BriefcaseIcon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Admin Portal</p>
                  <p className="mt-0.5 text-xs text-white/40">Access for BeeZ team members</p>
                </div>
                <ArrowRightIcon
                  size={16}
                  className="group-hover:text-primary shrink-0 text-white/30 transition-colors"
                />
              </button>

              {/* Client Portal — coming soon */}
              <button
                disabled
                className="group flex cursor-not-allowed items-center gap-4 rounded-xl border border-white/5 bg-white/3 px-5 py-4 text-left opacity-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/40">
                  <UsersThreeIcon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white/60">Client Portal</p>
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/40">
                      Coming soon
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/30">Access for our valued clients</p>
                </div>
                <ArrowRightIcon size={16} className="shrink-0 text-white/20" />
              </button>
            </div>
          )}

          {/* ── Admin login view ── */}
          {view === "admin" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-white/70">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon
                    size={15}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@beezvn.com"
                    required
                    className="focus:border-primary/60 focus:ring-primary/40 w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pr-4 pl-9 text-sm text-white outline-none placeholder:text-white/25 focus:ring-1"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-white/70">
                  Password
                </label>
                <div className="relative">
                  <LockIcon
                    size={15}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="focus:border-primary/60 focus:ring-primary/40 w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pr-10 pl-9 text-sm text-white outline-none placeholder:text-white/25 focus:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
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
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
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
          <p className="mt-8 text-center text-[11px] text-white/20">
            BeeZ Production © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
