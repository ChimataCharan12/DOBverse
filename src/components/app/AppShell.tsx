import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useBirth } from "@/lib/birth-store";
import {
  useBirthdays,
  useReminderSettings,
  reminderFor,
  runReminderCheck,
} from "@/lib/birthdays-store";
const MenuCtx = createContext<() => void>(() => {});
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  Home,
  Timer,
  BarChart3,
  ListOrdered,
  Users,
  Bell,
  CalendarDays,
  Image as ImageIcon,
  Settings,
  Info,
  ChevronsLeft,
  Menu,
  AlarmClock,
  Share2,
  Moon,
  Sun,
  ChevronLeft,
  Heart,
  X,
  Globe2,
  UserRound,
  Target,
  CalendarCheck,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand";
import { useNow, useTheme } from "@/lib/birth-store";
import { WEEKDAYS, fmtLong } from "@/lib/birth";
import { cn } from "@/lib/utils";

export const NAV_MAIN = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/age", label: "Age & Time", icon: Timer },
  { to: "/countdown", label: "Birthday Countdown", icon: AlarmClock },
  { to: "/statistics", label: "Life Statistics", icon: BarChart3 },
  { to: "/timeline", label: "Life Timeline", icon: ListOrdered },
  { to: "/snapshot", label: "Birth Year Snapshot", icon: Globe2 },
  { to: "/compare", label: "Compare Birthdays", icon: Users },
  { to: "/reminders", label: "Birthday Reminders", icon: Bell },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export const NAV_PRODUCTIVITY = [
  { to: "/habit-tracker", label: "Habit Tracker", icon: Target },
  { to: "/daily-planner", label: "Daily Planner", icon: CalendarCheck },
] as const;

export const NAV_CARDS = [
  { to: "/card", label: "Birthday Card Generator", icon: ImageIcon },
] as const;

export const NAV = [...NAV_MAIN, ...NAV_PRODUCTIVITY, ...NAV_CARDS] as const;

const NAV2 = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About DOBverse", icon: Info },
] as const;

function NavList({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const item = (n: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active = path === n.to || path.startsWith(`${n.to}/`);
    return (
      <Link
        key={n.to}
        to={n.to}
        onClick={onNav}
        title={n.label}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
          active
            ? "bg-gradient-cta text-primary-foreground shadow-glow"
            : "text-foreground/80 hover:bg-accent",
          collapsed && "justify-center px-0",
        )}
      >
        <n.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{n.label}</span>}
      </Link>
    );
  };
  return (
    <nav className="flex flex-col gap-1">
      {NAV_MAIN.map(item)}
      <div className="my-2">
        {!collapsed ? (
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Productivity
          </div>
        ) : (
          <div className="my-1 border-t" />
        )}
        {NAV_PRODUCTIVITY.map(item)}
      </div>
      {NAV_CARDS.map(item)}
      <div className="my-3 border-t" />
      {NAV2.map(item)}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const birthdays = useBirthdays();
  const reminderSettings = useReminderSettings();

  useEffect(() => {
    const check = () => runReminderCheck(birthdays, new Date());
    check();
    const timer = setInterval(check, 60_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };
    const onFocus = () => check();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [birthdays, reminderSettings]);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card px-4 py-5 transition-all lg:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          {collapsed ? <LogoMark className="mx-auto h-11 w-11" /> : <Logo />}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 grid h-6 w-6 place-items-center rounded-full border bg-card text-muted-foreground shadow-soft"
          aria-label="Toggle sidebar"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
        </button>
        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="mt-4 text-sm">
            <div className="font-semibold">DOBverse v1.0.0</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              Made with <Heart className="h-4 w-4 fill-destructive text-destructive" />
            </div>
          </div>
        )}
      </aside>
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-cosmic/60" onClick={() => setMobile(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobile(false)} aria-label="Close">
                <X />
              </button>
            </div>
            <NavList collapsed={false} onNav={() => setMobile(false)} />
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <MenuCtx.Provider value={() => setMobile(true)}>{children}</MenuCtx.Provider>
      </div>
    </div>
  );
}

export function Topbar({
  title,
  subtitle,
  back,
  greeting,
}: {
  title: ReactNode;
  subtitle: string;
  back?: boolean;
  greeting?: boolean;
}) {
  const now = useNow(30_000);
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const openMenu = useContext(MenuCtx);
  const birth = useBirth();
  const birthdays = useBirthdays();
  const reminderSettings = useReminderSettings();

  const activeRemindersCount = useMemo(() => {
    const currentDate = now ?? new Date();
    return birthdays.filter((p) => {
      const r = reminderFor(p, currentDate, reminderSettings.daysBefore);
      return r.enabled && r.next.daysLeft <= r.daysBefore;
    }).length;
  }, [birthdays, reminderSettings, now]);

  const share = async () => {
    const data = {
      title: "DOBverse",
      text: "Discover your birth story on DOBverse",
      url: location.origin,
    };
    if (navigator.share) navigator.share(data).catch(() => {});
    else navigator.clipboard?.writeText(data.url);
  };
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-background/85 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => openMenu()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-card lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {back ? (
          <button
            onClick={() => router.history.back()}
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border bg-card lg:grid"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="hidden h-11 w-11 shrink-0 place-items-center lg:grid">
            <Menu className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">
            {greeting ? <>👋 {title}</> : title}
          </h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {now && (
          <div className="hidden items-center gap-3 rounded-xl border bg-card px-4 py-2 shadow-soft md:flex">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div className="text-xs leading-tight">
              <div className="font-semibold">{WEEKDAYS[now.getDay()]}</div>
              <div className="text-muted-foreground">{fmtLong(now)}</div>
            </div>
          </div>
        )}
        <Link
          to="/reminders"
          className="relative grid h-11 w-11 place-items-center rounded-full border bg-card shadow-soft"
          aria-label="Notifications"
          title={
            activeRemindersCount > 0
              ? `${activeRemindersCount} active reminder${activeRemindersCount !== 1 ? "s" : ""}`
              : "Birthday Reminders"
          }
        >
          <Bell className="h-5 w-5" />
          {activeRemindersCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {activeRemindersCount > 9 ? "9+" : activeRemindersCount}
            </span>
          )}
        </Link>
        <button
          onClick={share}
          className="hidden h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold text-primary shadow-soft sm:flex"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          onClick={toggle}
          className="grid h-11 w-11 place-items-center rounded-full border bg-card shadow-soft"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link
          to="/settings"
          className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
          aria-label="Profile"
        >
          {birth?.name?.trim()[0] ? (
            birth.name.trim()[0].toUpperCase()
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </Link>
      </div>
    </header>
  );
}
