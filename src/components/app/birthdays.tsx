import { useEffect, useState, type ReactNode } from "react";
import { Gift, Send, Users, Heart, UserRound, Briefcase, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  newId,
  upsertBirthday,
  type Category,
  type BirthdayRepeat,
  type Person,
} from "@/lib/birthdays-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const CATS: Record<
  Category,
  { label: string; dot: string; soft: string; icon: typeof Users }
> = {
  family: { label: "Family", dot: "bg-magenta", soft: "bg-magenta/10 text-magenta", icon: Heart },
  friends: { label: "Friends", dot: "bg-info", soft: "bg-info/10 text-info", icon: Users },
  relatives: {
    label: "Relatives",
    dot: "bg-success",
    soft: "bg-success/15 text-success",
    icon: UserRound,
  },
  colleagues: {
    label: "Colleagues",
    dot: "bg-warn",
    soft: "bg-warn/15 text-warn",
    icon: Briefcase,
  },
  others: {
    label: "Others",
    dot: "bg-primary",
    soft: "bg-primary/10 text-primary",
    icon: Sparkles,
  },
};
export const CAT_KEYS = Object.keys(CATS) as Category[];

export function PersonAvatar({
  p,
  className,
}: {
  p: { name: string; category: Category };
  className?: string;
}) {
  const initials = p.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold",
        CATS[p.category].soft,
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}

export function CatBadge({ c }: { c: Category }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", CATS[c].soft)}>
      {CATS[c].label}
    </span>
  );
}

export function StatTile({
  icon,
  label,
  value,
  sub,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: Category | "primary";
}) {
  const soft = tone === "primary" ? "bg-primary/10 text-primary" : CATS[tone].soft;
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
      <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", soft)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

export function sendWishes(p: Person) {
  const text = `Happy Birthday, ${p.name}! 🎉 Wishing you a wonderful year ahead.`;
  if (navigator.share) navigator.share({ text }).catch(() => {});
  else {
    navigator.clipboard?.writeText(text);
    toast.success("Birthday wish copied to clipboard");
  }
}
export function giftIdeas(p: Person) {
  window.open(
    `https://www.google.com/search?q=${encodeURIComponent(`birthday gift ideas for ${p.relation || CATS[p.category].label.toLowerCase()}`)}`,
    "_blank",
    "noopener",
  );
}

export function PersonActions({ p }: { p: Person }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => giftIdeas(p)}
        className="grid h-9 w-9 place-items-center rounded-full border bg-card text-primary hover:bg-accent"
        aria-label="Gift ideas"
        title="Gift ideas"
      >
        <Gift className="h-4 w-4" />
      </button>
      <button
        onClick={() => sendWishes(p)}
        className="grid h-9 w-9 place-items-center rounded-full border bg-card text-primary hover:bg-accent"
        aria-label="Send wishes"
        title="Send wishes"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

type Draft = {
  name: string;
  dob: string;
  relation: string;
  category: Category;
  repeat: BirthdayRepeat;
  time: string;
  city: string;
  country: string;
};
const blank = (dob = ""): Draft => ({
  name: "",
  dob,
  relation: "",
  category: "family",
  repeat: "yearly",
  time: "",
  city: "",
  country: "",
});

export function AddBirthdayDialog({
  open,
  onOpenChange,
  initial,
  defaultDob,
  title = "Add Birthday",
  onSaved,
  showDetails,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Person;
  defaultDob?: string;
  title?: string;
  onSaved?: (p: Person) => void;
  showDetails?: boolean;
}) {
  const [d, setD] = useState<Draft>(blank());
  useEffect(() => {
    if (open)
      setD(
        initial
          ? {
              name: initial.name,
              dob: initial.dob,
              relation: initial.relation || "",
              category: initial.category,
              repeat: initial.repeat || "yearly",
              time: initial.time || "",
              city: initial.city || "",
              country: initial.country || "",
            }
          : blank(defaultDob),
      );
  }, [open, initial, defaultDob]);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) =>
    setD({ ...d, [k]: e.target.value });
  const save = () => {
    if (!d.name.trim() || !d.dob) {
      toast.error("Please add a name and date of birth");
      return;
    }
    if (new Date(d.dob) > new Date()) {
      toast.error("Date of birth can't be in the future");
      return;
    }
    const currentYear = new Date().getFullYear();
    const p: Person = {
      ...(initial || {}),
      id: initial?.id || newId(),
      name: d.name.trim(),
      dob: d.dob,
      relation: d.relation || undefined,
      category: d.category,
      repeat: d.repeat,
      targetYear: d.repeat === "once" ? (initial?.targetYear ?? currentYear) : undefined,
      time: d.time || undefined,
      city: d.city || undefined,
      country: d.country || undefined,
    };
    if (onSaved) onSaved(p);
    else upsertBirthday(p);
    toast.success(`${p.name} saved`);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Full name</Label>
            <Input value={d.name} onChange={set("name")} placeholder="Enter name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={d.dob}
                onChange={set("dob")}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Repeat</Label>
              <Select
                value={d.repeat}
                onValueChange={(v) => setD({ ...d, repeat: v as BirthdayRepeat })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Every year</SelectItem>
                  <SelectItem value="once">This year only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Relationship</Label>
            <Input value={d.relation} onChange={set("relation")} placeholder="e.g. Sister" />
          </div>
          {showDetails && (
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label>Time</Label>
                <Input type="time" value={d.time} onChange={set("time")} />
              </div>
              <div className="grid gap-1.5">
                <Label>City</Label>
                <Input value={d.city} onChange={set("city")} />
              </div>
              <div className="grid gap-1.5">
                <Label>Country</Label>
                <Input value={d.country} onChange={set("country")} />
              </div>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CAT_KEYS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setD({ ...d, category: c })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    d.category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-accent",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", CATS[c].dot)} />
                  {CATS[c].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save Birthday</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CosmicHero({
  img,
  children,
  className,
  imgClassName,
  gradientClassName,
}: {
  img: string;
  children: ReactNode;
  className?: string;
  imgClassName?: string;
  gradientClassName?: string;
}) {
  return (
    <section
      className={cn(
        "relative min-h-[190px] sm:min-h-[220px] overflow-hidden rounded-2xl bg-cosmic text-cosmic-foreground shadow-soft",
        className,
      )}
    >
      <img
        src={img}
        alt=""
        width={1536}
        height={512}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-[80%_center] sm:object-right opacity-95",
          imgClassName,
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-cosmic/90 via-cosmic/40 to-transparent",
          gradientClassName,
        )}
      />
      <div className="relative p-6 sm:p-8">{children}</div>
    </section>
  );
}
