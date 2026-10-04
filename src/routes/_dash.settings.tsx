import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Download,
  FileText,
  Folder,
  Globe,
  Info,
  Lock,
  Mail,
  Monitor,
  Moon,
  Music,
  Palette,
  Play,
  Plus,
  RefreshCw,
  Settings as Gear,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
  ListChecks,
  BadgeInfo,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Panel } from "@/components/app/ui";
import { Topbar } from "@/components/app/AppShell";
import { Switch } from "@/components/ui/switch";
import { usePWAInstall } from "@/lib/pwa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { playBirthdaySong, setPrefs, usePrefs } from "@/lib/astro";
import { download, enableBrowserNotifications, setReminderSettings } from "@/lib/birthdays-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_dash/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DOBverse" },
      {
        name: "description",
        content: "Customize DOBverse: theme, accent color, notifications, and your local data.",
      },
      { property: "og:title", content: "Settings — DOBverse" },
      { property: "og:description", content: "Customize DOBverse the way you like." },
    ],
  }),
  component: SettingsPage,
});

const ACCENTS = [
  { v: "", c: "oklch(0.53 0.25 290)", n: "Violet" },
  { v: "oklch(0.62 0.22 350)", c: "oklch(0.72 0.18 350)", n: "Pink" },
  { v: "oklch(0.55 0.2 260)", c: "oklch(0.6 0.2 260)", n: "Blue" },
  { v: "oklch(0.55 0.13 175)", c: "oklch(0.62 0.13 175)", n: "Teal" },
  { v: "oklch(0.65 0.18 55)", c: "oklch(0.72 0.18 55)", n: "Orange" },
  { v: "oklch(0.58 0.22 27)", c: "oklch(0.63 0.22 27)", n: "Red" },
];
const INFO: Record<string, { t: string; d: string }> = {
  privacy: {
    t: "Privacy Policy",
    d: "DOBverse runs entirely in your browser. Your birth details, saved birthdays and preferences are stored only in this browser's local storage. Nothing is sent to a server, sold, or shared.",
  },
  storage: {
    t: "Data Storage",
    d: 'All data lives in your browser\'s local storage under keys starting with "dobverse". Clearing site data or using Reset App removes it. Use Export Data to keep a backup.',
  },
  permissions: {
    t: "Permissions",
    d: "DOBverse only asks for notification permission, and only when you enable reminders. You can revoke it anytime from your browser's site settings.",
  },
  version: { t: "Version 1.0.0", d: "You're on the latest version of DOBverse." },
  changelog: {
    t: "Changelog",
    d: "1.0.0 — Birthday Reminders, Calendar, Compare Birthdays, Birthday Card Generator, Settings and About pages.",
  },
  contact: {
    t: "Contact Us",
    d: "We'd love to hear from you! Share feedback and ideas with the DOBverse team.",
  },
};

function SettingsPage() {
  const p = usePrefs();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [info, setInfo] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const out: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith("dobverse")) out[k] = localStorage.getItem(k);
    }
    download(
      `dobverse-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ app: "DOBverse", version: 1, data: out }, null, 2),
      "application/json",
    );
    toast.success("Your data was exported");
  };
  const importData = async (f?: File) => {
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (j.app !== "DOBverse" || typeof j.data !== "object") throw new Error();
      Object.entries(j.data as Record<string, string>).forEach(
        ([k, v]) => k.startsWith("dobverse") && typeof v === "string" && localStorage.setItem(k, v),
      );
      toast.success("Data imported — reloading");
      setTimeout(() => location.reload(), 700);
    } catch {
      toast.error("That file isn't a valid DOBverse backup");
    }
  };
  const resetApp = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("dobverse"))
      .forEach((k) => localStorage.removeItem(k));
    try {
      sessionStorage.removeItem("dobverse.splash");
    } catch {
      /* ignore */
    }
    document.documentElement.removeAttribute("style");
    location.href = "/";
  };
  const toggleNotif = async (v: boolean) => {
    if (v) {
      const ok = await enableBrowserNotifications();
      if (!ok) {
        toast.error("Notifications were blocked by your browser");
        return;
      }
    } else setReminderSettings({ browser: false });
    setPrefs({ notifications: v });
  };
  const Section = ({
    icon: I,
    title,
    children,
  }: {
    icon: typeof Bell;
    title: string;
    children: React.ReactNode;
  }) => (
    <Panel className="p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
        <I className="h-6 w-6 text-primary" />
        {title}
      </h2>
      {children}
    </Panel>
  );
  const Toggle = ({
    t,
    d,
    v,
    on,
  }: {
    t: string;
    d: string;
    v: boolean;
    on: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-semibold">{t}</div>
        <div className="text-sm text-muted-foreground">{d}</div>
      </div>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
  const LinkItem = ({
    icon: I,
    t,
    d,
    k,
  }: {
    icon: typeof Bell;
    t: string;
    d: string;
    k: string;
  }) => (
    <button
      onClick={() => (k === "notif" ? toggleNotif(true) : k === "features" ? null : setInfo(k))}
      className="flex items-center gap-3 p-3 text-left hover:bg-accent/40 md:border-l md:first:border-l-0"
    >
      <I className="h-6 w-6 shrink-0 text-primary" />
      <div className="flex-1">
        <div className="text-sm font-semibold">{t}</div>
        <div className="text-xs text-muted-foreground">{d}</div>
      </div>
      <ChevronRight className="h-4 w-4" />
    </button>
  );

  return (
    <>
      <Topbar back title="Settings" subtitle="Customize DOBverse the way you like." />
      <div className="mx-auto grid max-w-5xl gap-5 px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Gear className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize DOBverse the way you like.</p>
            </div>
          </div>
          <Select value={p.theme} onValueChange={(v) => setPrefs({ theme: v as typeof p.theme })}>
            <SelectTrigger className="h-12 w-44 rounded-xl">
              <Moon className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light Mode</SelectItem>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Section icon={Palette} title="Appearance">
          <div className="grid gap-8 md:grid-cols-2 md:divide-x">
            <div className="grid gap-6">
              <div>
                <div className="font-semibold">Theme</div>
                <div className="mb-3 text-sm text-muted-foreground">
                  Choose your preferred theme
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      ["light", Sun, "Light"],
                      ["dark", Moon, "Dark"],
                      ["system", Monitor, "System"],
                    ] as const
                  ).map(([v, I, l]) => (
                    <button
                      key={v}
                      onClick={() => setPrefs({ theme: v })}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium",
                        p.theme === v && "border-primary bg-primary/10 text-primary",
                      )}
                    >
                      <I className="h-5 w-5" />
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold">Accent Color</div>
                <div className="mb-3 text-sm text-muted-foreground">Choose your favorite color</div>
                <div className="flex flex-wrap items-center gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.n}
                      onClick={() => setPrefs({ accent: a.v })}
                      title={a.n}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full text-primary-foreground",
                        p.accent === a.v && "ring-2 ring-offset-2 ring-offset-background",
                      )}
                      style={{ background: a.c, ["--tw-ring-color" as string]: a.c }}
                    >
                      {p.accent === a.v && "✓"}
                    </button>
                  ))}
                  <button
                    onClick={() => customRef.current?.click()}
                    className="grid h-9 w-9 place-items-center rounded-full border"
                    aria-label="Custom color"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <input
                    ref={customRef}
                    type="color"
                    hidden
                    onChange={(e) => setPrefs({ accent: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="md:pl-8">
              <div className="font-semibold">Language</div>
              <div className="mb-3 text-sm text-muted-foreground">Select your language</div>
              <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                <span className="text-xl">🇺🇸</span>
                <span className="font-medium">English</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Available
                </span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-muted-foreground">
                <Globe className="h-5 w-5" />
                More Languages
                <span className="rounded bg-muted px-2 py-0.5 text-xs">Coming Soon</span>
                <Lock className="ml-auto h-4 w-4" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                More languages will be available in future updates.
              </p>
            </div>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div className="grid gap-6 md:grid-cols-2 md:divide-x">
            <div className="grid gap-6 md:pr-8">
              <Toggle
                t="Enable Notifications"
                d="Receive reminders and important updates"
                v={p.notifications}
                on={toggleNotif}
              />
              <Toggle
                t="Birthday Reminders"
                d="Get notified about upcoming birthdays"
                v={p.birthdayReminders}
                on={(v) => setPrefs({ birthdayReminders: v })}
              />
              <Toggle
                t="Birthday Celebration Animation"
                d="Show celebration animation on birthdays"
                v={p.celebration}
                on={(v) => setPrefs({ celebration: v })}
              />
            </div>
            <div className="grid gap-6 md:pl-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">Reminder Time</div>
                  <div className="text-sm text-muted-foreground">
                    Set default time for birthday reminders
                  </div>
                </div>
                <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <input
                    type="time"
                    value={p.reminderTime}
                    onChange={(e) => setPrefs({ reminderTime: e.target.value })}
                    className="bg-transparent text-sm outline-none"
                  />
                </label>
              </div>
              <Toggle
                t="Birthday Music"
                d="Play birthday music during celebration"
                v={p.music}
                on={(v) => setPrefs({ music: v })}
              />
              <div className="flex items-center gap-3">
                <Select
                  value={p.song}
                  onValueChange={(v) => setPrefs({ song: v })}
                  disabled={!p.music}
                >
                  <SelectTrigger className="h-12 flex-1 rounded-xl">
                    <Music className="h-4 w-4 text-primary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Happy Birthday (Classic)</SelectItem>
                    <SelectItem value="chime">Happy Birthday (Chime)</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={playBirthdaySong}
                  disabled={!p.music}
                  className="grid h-12 w-12 place-items-center rounded-full border text-primary disabled:opacity-50"
                  aria-label="Play"
                >
                  <Play className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground">
            Browser notifications work while DOBverse is active in your browser. Background
            notifications when the app is completely closed require push notifications.
          </div>
        </Section>

        <Section icon={Folder} title="Data Management">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                i: Upload,
                t: "Export Local Data",
                d: "Download all your data to a file (JSON)",
                b: "Export Data",
                bi: Download,
                f: exportData,
                danger: false,
              },
              {
                i: Upload,
                t: "Import Local Data",
                d: "Import previously exported data",
                b: "Import Data",
                bi: Upload,
                f: () => fileRef.current?.click(),
                danger: false,
              },
              {
                i: RefreshCw,
                t: "Reset App",
                d: "Clear all local data and reset everything",
                b: "Reset App",
                bi: Trash2,
                f: () => setReset(true),
                danger: true,
              },
            ].map((c) => (
              <div
                key={c.t}
                className={cn("rounded-2xl border p-4", c.danger && "bg-destructive/5")}
              >
                <div className="flex gap-3">
                  <c.i className={cn("h-6 w-6", c.danger ? "text-destructive" : "text-primary")} />
                  <div>
                    <div className="font-semibold">{c.t}</div>
                    <div className="text-sm text-muted-foreground">{c.d}</div>
                  </div>
                </div>
                <button
                  onClick={c.f}
                  className={cn(
                    "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold",
                    c.danger
                      ? "border-destructive text-destructive"
                      : "border-primary text-primary",
                  )}
                >
                  <c.bi className="h-4 w-4" />
                  {c.b}
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              importData(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent/60 px-4 py-3 text-sm">
            <Info className="h-5 w-5 text-primary" />
            All data is stored locally in your browser. We never upload or share your data.
          </div>
        </Section>

        <Section icon={ShieldCheck} title="Privacy">
          <div className="grid md:grid-cols-4">
            <LinkItem icon={FileText} t="Privacy Policy" d="Read our privacy policy" k="privacy" />
            <LinkItem
              icon={Database}
              t="Data Storage"
              d="Learn how your data is stored"
              k="storage"
            />
            <LinkItem icon={Lock} t="Permissions" d="Manage app permissions" k="permissions" />
            <LinkItem
              icon={Bell}
              t="Browser Notifications"
              d="Manage notification permission"
              k="notif"
            />
          </div>
        </Section>

        <Section icon={Smartphone} title="App Installation (PWA)">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                {isInstalled
                  ? "DOBverse is Installed"
                  : canInstall
                    ? "Install DOBverse Desktop & Mobile App"
                    : "DOBverse Web Application"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isInstalled
                  ? "Running as a standalone application on your device with offline support."
                  : canInstall
                    ? "Install DOBverse for native standalone window, instant launch, and offline caching."
                    : "Installable directly via Chrome menu (⋮ → Install DOBverse) or browser Add to Home Screen."}
              </p>
            </div>
            {isInstalled ? (
              <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                Installed
              </span>
            ) : canInstall ? (
              <button
                onClick={async () => {
                  const ok = await promptInstall();
                  if (ok) toast.success("DOBverse installed successfully!");
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-cta px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                <Download className="h-4 w-4" />
                Install DOBverse
              </button>
            ) : null}
          </div>
        </Section>

        <Section icon={BadgeInfo} title="About DOBverse">
          <div className="grid md:grid-cols-4">
            <LinkItem icon={RefreshCw} t="Version" d="1.0.0" k="version" />
            <Link
              to="/about"
              className="flex items-center gap-3 p-3 hover:bg-accent/40 md:border-l"
            >
              <Sparkles className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Features</div>
                <div className="text-xs text-muted-foreground">Explore DOBverse features</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <LinkItem icon={ListChecks} t="Changelog" d="See what's new" k="changelog" />
            <LinkItem icon={Mail} t="Contact Us" d="We'd love to hear from you" k="contact" />
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-accent/50 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-cta text-primary-foreground">
            <ShieldCheck />
          </div>
          <div className="flex-1 text-primary">
            All your data is stored locally on your device.
            <br />
            We never collect or upload your personal information. 💜
          </div>
          <span className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
            <Star className="h-4 w-4 text-primary" />
            Version 1.0.0
          </span>
        </div>
      </div>

      <Dialog open={!!info} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{info && INFO[info].t}</DialogTitle>
            <DialogDescription>{info && INFO[info].d}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AlertDialog open={reset} onOpenChange={setReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset DOBverse?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently clears your birth details, saved birthdays, card designs and
              preferences from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetApp}
              className="bg-destructive text-destructive-foreground"
            >
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
