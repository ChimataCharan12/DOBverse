import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  ArrowRight,
  Cake,
  Check,
  CircleHelp,
  Copy,
  Download,
  Expand,
  Heart,
  Minus,
  Plus,
  Redo2,
  RotateCw,
  Save,
  Share2,
  Shrink,
  Trash2,
  Undo2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import balloonsAsset from "@/assets/card/el-balloons.png";
import cakeAsset from "@/assets/card/el-cake.png";
import { Topbar } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useCurrentBirth, useNow } from "@/lib/birth-store";
import { ageParts, birthDate, fmtDate, lifeStats, totals, weekday } from "@/lib/birth";
import { birthFlower, birthstone, moonPhase, zodiac } from "@/lib/astro";
import {
  newId,
  nextOccurrence,
  selfAsPerson,
  upsertBirthday,
  useBirthdays,
  type Person,
} from "@/lib/birthdays-store";
import {
  BACKGROUNDS,
  BG_COLORS,
  INK,
  SIZES,
  TEMPLATES,
  defaultDesign,
  historyInit,
  historyRedo,
  historySet,
  historyUndo,
  newElId,
  newElement,
  resizeBox,
  saveDesign,
  templateById,
  templateElements,
  useSavedDesigns,
  type CardEl,
  type Design,
  type ElType,
  type History,
  type SizeKey,
} from "@/lib/card-designs";
import { cn } from "@/lib/utils";

const ELEMENTS: { type: ElType; label: string; symbol: string }[] = [
  { type: "photo", label: "Photo", symbol: "▧" },
  { type: "name", label: "Name", symbol: "Aa" },
  { type: "dob", label: "DOB", symbol: "▣" },
  { type: "age", label: "Age", symbol: "♙" },
  { type: "zodiac", label: "Zodiac", symbol: "♌" },
  { type: "moon", label: "Moon", symbol: "◐" },
  { type: "statDays", label: "Days Lived", symbol: "⌛" },
  { type: "statHeartbeats", label: "Heartbeats", symbol: "♥" },
  { type: "flower", label: "Flower", symbol: "✿" },
  { type: "birthstone", label: "Birthstone", symbol: "◉" },
  { type: "quote", label: "Quote", symbol: "❝" },
  { type: "wish", label: "Wish Card", symbol: "✨" },
  { type: "countdown", label: "Countdown", symbol: "◴" },
  { type: "qr", label: "QR Code", symbol: "▦" },
  { type: "divider", label: "Divider", symbol: "—" },
  { type: "balloons", label: "Balloons", symbol: "●" },
  { type: "cake", label: "Cake", symbol: "♨" },
  { type: "icon", label: "Icons", symbol: "♡" },
  { type: "shape", label: "Shapes", symbol: "◇" },
];

const EDITABLE: ElType[] = ["heading", "message", "quote", "name", "wish"];
const panel = "rounded-lg border border-border bg-card shadow-soft";
const label = "text-xs font-semibold text-foreground";

function personFacts(person: Person | undefined, now: Date) {
  if (!person) return null;
  const date = birthDate({ dob: person.dob, time: person.time });
  const next = nextOccurrence(person, now);
  const age = next.daysLeft === 0 ? next.turning : ageParts(date, now).years;
  const tot = totals(date, now);
  const life = lifeStats(date, now);
  const heartbeatsMil = Math.max(1, Math.round(life.heartbeats / 1_000_000));
  const dogYears = ((tot.days / 365.25) * 7).toFixed(1);
  return {
    date,
    next,
    age,
    turning: next.turning,
    daysLived: tot.days.toLocaleString(),
    heartbeatsMil,
    dogYears,
    sign: zodiac(date),
    flower: birthFlower(date),
    stone: birthstone(date),
    moon: moonPhase(date),
  };
}

function elContent(
  el: CardEl,
  person: Person | undefined,
  now: Date,
  photo: string | null,
  qr: string,
) {
  const f = personFacts(person, now);
  if (el.type === "photo")
    return photo ? (
      <img
        src={photo}
        alt="Birthday portrait"
        className="h-full w-full rounded-full object-cover"
      />
    ) : (
      <div className="grid h-full w-full place-items-center rounded-full border-2 border-dashed border-current opacity-40">
        <UserRound className="h-1/2 w-1/2" />
      </div>
    );
  if (el.type === "balloons" || el.type === "cake")
    return (
      <img
        src={el.type === "balloons" ? balloonsAsset : cakeAsset}
        alt=""
        className="h-full w-full object-contain"
      />
    );
  if (el.type === "qr")
    return qr ? (
      <img src={qr} alt="Birthday card QR code" className="h-full w-full object-contain" />
    ) : null;
  if (el.type === "divider")
    return <span className="block w-full border-t-2 border-current opacity-60" />;
  if (el.type === "shape")
    return <span className="block h-full w-full rounded-full border-4 border-current opacity-60" />;
  if (el.type === "icon") return <Heart className="h-full w-full fill-current" />;
  if (el.type === "heading" || el.type === "message" || el.type === "quote") return el.text;

  if (!f) return el.type === "name" ? "Your name" : "—";
  switch (el.type) {
    case "name":
      return el.text || (person?.name ? `${person.name}!` : "Your name");
    case "dob":
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <small className="opacity-80 text-[10px]">Date of birth</small>
          <strong>{fmtDate(f.date)}</strong>
          <small className="opacity-80 text-[10px]">{weekday(f.date)}</small>
        </div>
      );
    case "age":
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <small className="opacity-80 text-[10px]">Milestone</small>
          <strong>Turns {f.turning} Today! 🎉</strong>
        </div>
      );
    case "statDays":
      return (
        <div className="flex flex-col items-center justify-center text-center px-1">
          <small className="opacity-80 text-[10px]">You've lived</small>
          <strong className="text-sm sm:text-base font-bold text-primary dark:text-amber-300">
            {f.daysLived}
          </strong>
          <small className="opacity-80 text-[9px]">Days · 🐾 ~{f.dogYears} Dog Yrs</small>
        </div>
      );
    case "statHeartbeats":
      return (
        <div className="flex flex-col items-center justify-center text-center px-1">
          <small className="opacity-80 text-[10px]">Estimated Heartbeats</small>
          <strong className="text-sm sm:text-base font-bold text-magenta dark:text-pink-300">
            {f.heartbeatsMil} Million
          </strong>
          <small className="opacity-80 text-[9px]">And counting... 💜</small>
        </div>
      );
    case "countdown":
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <small className="opacity-80 text-[10px]">Next birthday</small>
          <strong>{f.next.daysLeft === 0 ? "Today!" : f.next.daysLeft}</strong>
          <small className="opacity-80 text-[10px]">
            {f.next.daysLeft === 0 ? "Happy birthday" : "Days left"}
          </small>
        </div>
      );
    case "zodiac":
    case "statZodiac":
      return (
        <div className="flex flex-col items-center justify-center text-center px-1">
          <small className="opacity-80 text-[10px]">Zodiac Sign</small>
          <strong>
            {f.sign.name} {f.sign.sym}
          </strong>
          <small className="opacity-80 text-[9px]">
            {f.sign.el} · {f.sign.ruler}
          </small>
        </div>
      );
    case "flower":
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <small className="opacity-80 text-[10px]">Birth flower</small>
          <strong>✿ {f.flower}</strong>
        </div>
      );
    case "birthstone":
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <small className="opacity-80 text-[10px]">Birthstone</small>
          <strong>◈ {f.stone}</strong>
        </div>
      );
    case "moon":
    case "statMoon":
      return (
        <div className="flex flex-col items-center justify-center text-center px-1">
          <small className="opacity-80 text-[10px]">Current Moon Phase</small>
          <strong>
            {f.moon.icon} {f.moon.name}
          </strong>
          <small className="opacity-80 text-[9px]">🌙 {f.moon.illum}% Illuminated</small>
        </div>
      );
    case "wish":
      return (
        <div className="flex flex-col items-center justify-center text-center px-3 py-1">
          <p className="text-xs font-medium leading-snug">
            {el.text ||
              `You are amazing, ${person?.name || "Friend"}! ✨ Wishing you a year filled with happiness, growth, love and endless success. 💜`}
          </p>
        </div>
      );
    default:
      return null;
  }
}

export function CardEditor() {
  const self = useCurrentBirth();
  const people = useBirthdays();
  const all = [selfAsPerson(self), ...people];
  const now = useNow(60_000) ?? new Date();
  const saved = useSavedDesigns();
  const [history, setHistory] = useState<History<Design>>(() =>
    historyInit(defaultDesign("self", "celebration")),
  );
  const design = history.present;
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showAll, setShowAll] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", dob: "" });
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    id: string;
    mode: "move" | "resize" | "rotate";
    x: number;
    y: number;
    base: Design;
    el: CardEl;
  } | null>(null);

  const person = all.find((p) => p.id === design.personId);
  const dimensions = SIZES[design.sizeKey];
  const ink = INK[design.theme];
  const template = templateById(design.templateId);
  const selectedEl = design.elements.find((e) => e.id === selected);
  const background =
    design.bgColor ||
    BACKGROUNDS.find((b) => b.id === design.bg)?.css ||
    `url("${template.image}")`;
  const cardInfo = person
    ? `DOBverse birthday card for ${person.name}, born ${person.dob}. ${locationSafeOrigin()}`
    : "DOBverse birthday card";

  useEffect(() => {
    QRCode.toDataURL(cardInfo, {
      margin: 1,
      width: 240,
      color: { dark: design.theme === "dark" ? "#f2c66d" : "#2a1a5e", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [cardInfo, design.theme]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
      } else if (stageRef.current) {
        if (stageRef.current.requestFullscreen) {
          await stageRef.current.requestFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  function change(fn: (d: Design) => Design) {
    setHistory((h) => historySet(h, fn(h.present)));
  }

  function patchEl(patch: Partial<CardEl>) {
    if (selected)
      change((d) => ({
        ...d,
        elements: d.elements.map((e) => (e.id === selected ? { ...e, ...patch } : e)),
      }));
  }

  function addElement(type: ElType) {
    const e = newElement(type, dimensions.w, dimensions.h);
    change((d) => ({ ...d, elements: [...d.elements, e] }));
    setSelected(e.id);
    if (type === "photo" && !design.photo) uploadRef.current?.click();
  }

  function removeElement() {
    if (selected) {
      change((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== selected) }));
      setSelected(null);
    }
  }

  function duplicateElement() {
    if (selectedEl) {
      const e = { ...selectedEl, id: newElId(), x: selectedEl.x + 35, y: selectedEl.y + 35 };
      change((d) => ({ ...d, elements: [...d.elements, e] }));
      setSelected(e.id);
    }
  }

  function pointerDown(
    ev: PointerEvent<HTMLElement>,
    el: CardEl,
    mode: "move" | "resize" | "rotate",
  ) {
    if (el.locked) return;
    ev.stopPropagation();
    ev.preventDefault();
    setSelected(el.id);
    drag.current = { id: el.id, mode, x: ev.clientX, y: ev.clientY, base: design, el };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  }

  function pointerMove(ev: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    const rect = canvas.current?.getBoundingClientRect();
    if (!active || !rect) return;
    const dx = ((ev.clientX - active.x) * dimensions.w) / rect.width;
    const dy = ((ev.clientY - active.y) * dimensions.h) / rect.height;
    let patch: Partial<CardEl>;
    if (active.mode === "move") patch = { x: active.el.x + dx, y: active.el.y + dy };
    else if (active.mode === "resize") patch = resizeBox(active.el, dx, dy, ev.shiftKey);
    else {
      const cx = rect.left + ((active.el.x + active.el.w / 2) * rect.width) / dimensions.w;
      const cy = rect.top + ((active.el.y + active.el.h / 2) * rect.height) / dimensions.h;
      patch = {
        rot: Math.round((Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90),
      };
    }
    setHistory((h) =>
      historySet(
        h,
        {
          ...h.present,
          elements: h.present.elements.map((e) => (e.id === active.id ? { ...e, ...patch } : e)),
        },
        false,
      ),
    );
  }

  function pointerUp() {
    const active = drag.current;
    if (active) {
      setHistory((h) => historySet(h, h.present, true, active.base));
      drag.current = null;
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photos must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        change((d) => ({ ...d, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function exportPng(): Promise<string | null> {
    if (!canvas.current) return null;
    setBusy(true);
    canvas.current.classList.add("card-exporting");
    try {
      const rect = canvas.current.getBoundingClientRect();
      return await toPng(canvas.current, {
        pixelRatio: dimensions.w / rect.width,
        cacheBust: true,
        backgroundColor: design.theme === "dark" ? "#160f2b" : "#fff",
      });
    } catch {
      toast.error("Couldn't export the card. Try again after the images load.");
      return null;
    } finally {
      canvas.current?.classList.remove("card-exporting");
      setBusy(false);
    }
  }

  function downloadUrl(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }

  async function downloadPng() {
    const image = await exportPng();
    if (image) downloadUrl(image, `dobverse-${person?.name || "birthday"}.png`);
  }

  async function downloadPdf() {
    const image = await exportPng();
    if (!image) return;
    const pdf = new jsPDF({
      orientation: dimensions.w > dimensions.h ? "landscape" : "portrait",
      unit: "px",
      format: [dimensions.w, dimensions.h],
      hotfixes: ["px_scaling"],
    });
    pdf.addImage(image, "PNG", 0, 0, dimensions.w, dimensions.h);
    pdf.save(`dobverse-${person?.name || "birthday"}.pdf`);
  }

  async function shareCard() {
    const image = await exportPng();
    if (!image) return;
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "birthday-card.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Birthday card", files: [file] });
        return;
      }
      await navigator.clipboard.writeText(cardInfo);
      toast.success("Card details copied. Download the PNG to share the picture.");
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        toast.error("Sharing is unavailable here. Download the PNG instead.");
    }
  }

  function save() {
    const id = savedId || newElId();
    if (saveDesign({ id, savedAt: Date.now(), design, thumb: null })) {
      setSavedId(id);
      toast.success("Design saved on this device.");
    } else toast.error("Device storage is full. Try a smaller photo.");
  }

  function selectTemplate(id: string) {
    const t = templateById(id);
    change((d) => ({
      ...d,
      templateId: id,
      theme: t.theme,
      bg: null,
      bgColor: null,
      elements: templateElements(t, d.sizeKey),
    }));
  }

  function addPerson() {
    if (
      !newPerson.name.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(newPerson.dob) ||
      newPerson.dob > new Date().toISOString().slice(0, 10)
    ) {
      toast.error("Enter a name and valid date of birth.");
      return;
    }
    const p: Person = {
      id: newId(),
      name: newPerson.name.trim(),
      dob: newPerson.dob,
      category: "others",
    };
    upsertBirthday(p);
    change((d) => ({ ...d, personId: p.id }));
    setNewPerson({ name: "", dob: "" });
    setAddOpen(false);
  }

  const zoomOut = () => setZoom((v) => Math.max(70, v - 10));
  const zoomIn = () => setZoom((v) => Math.min(150, v + 10));
  const zoomReset = () => setZoom(100);

  const tool = (title: string, action: () => void, icon: React.ReactNode, disabled = false) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={action}
    >
      {icon}
    </Button>
  );

  return (
    <>
      <Topbar title="Birthday Card Generator" subtitle="Create a card worth keeping." />
      <main className="card-workspace px-4 pb-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Birthday Card Generator 🎉
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Design beautiful birthday cards with drag & drop. Move, resize and rotate elements
              freely.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setHelp(true)}>
            <CircleHelp />
            How it works?
          </Button>
        </div>

        {/* Three-Column Workflow Clarity Header */}
        <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border bg-card/60 p-2 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              ①
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">Select Person</div>
              <div className="text-[11px] text-muted-foreground truncate">
                Choose who the card is for
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 border-t border-border/50 sm:border-t-0 sm:border-l sm:border-r">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              ②
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">Design Card</div>
              <div className="text-[11px] text-muted-foreground truncate">Customize your card</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 border-t border-border/50 sm:border-t-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              ③
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">Preview & Export</div>
              <div className="text-[11px] text-muted-foreground truncate">Review and save</div>
            </div>
          </div>
        </div>

        <div className="editor-layout grid items-start gap-3 xl:grid-cols-[230px_minmax(0,1fr)_300px] 2xl:grid-cols-[250px_minmax(0,1fr)_320px]">
          {/* Column 1: Select Person & Card Settings */}
          <aside className={`${panel} space-y-5 p-3`}>
            <section>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-primary">①</span>
                <h3 className={label}>Select Person</h3>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Choose who the card is for</p>
              <div className="mt-2 flex gap-1">
                <select
                  aria-label="Select person"
                  value={person?.id || ""}
                  onChange={(e) => change((d) => ({ ...d, personId: e.target.value }))}
                  className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-2 text-xs"
                >
                  <option value="" disabled>
                    Select a person
                  </option>
                  {all.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {fmtDate(birthDate({ dob: p.dob }))}
                    </option>
                  ))}
                </select>
                {tool("Add person", () => setAddOpen(true), <Plus />)}
              </div>
              {person && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {person.name} · {fmtDate(birthDate({ dob: person.dob }))}
                </p>
              )}
            </section>

            <section>
              <h3 className={label}>Photo (Optional)</h3>
              <input
                ref={uploadRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                aria-label="Upload photo"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="mt-2 flex items-center gap-2">
                {design.photo ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={design.photo}
                    alt="Uploaded portrait"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-accent">
                    <UserRound className="text-primary" />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-0 flex-1 text-[11px]"
                  onClick={() => uploadRef.current?.click()}
                >
                  <Upload />
                  {design.photo ? "Replace photo" : "Upload photo"}
                </Button>
                {design.photo &&
                  tool("Remove photo", () => change((d) => ({ ...d, photo: null })), <Trash2 />)}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                JPG, PNG, WebP · max 5 MB · stays on this device
              </p>
            </section>

            <section className="space-y-3 border-t pt-3">
              <h3 className={label}>Card Settings</h3>
              <label className="block text-[11px] font-medium">
                Card Size
                <select
                  aria-label="Card size"
                  value={design.sizeKey}
                  onChange={(e) => change((d) => ({ ...d, sizeKey: e.target.value as SizeKey }))}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
                >
                  {Object.entries(SIZES).map(([key, v]) => (
                    <option key={key} value={key}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-[11px] font-medium">Theme</span>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {(["light", "dark"] as const).map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={design.theme === t ? "default" : "outline"}
                      onClick={() => change((d) => ({ ...d, theme: t }))}
                    >
                      {t === "light" ? "☼" : "☾"} {t === "light" ? "Light" : "Dark"}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium">Background Swatch</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BACKGROUNDS.map((b) => (
                    <Button
                      key={b.id}
                      variant="ghost"
                      size="icon"
                      title={b.id}
                      aria-label={`${b.id} background`}
                      onClick={() => change((d) => ({ ...d, bg: b.id, bgColor: null }))}
                      className={`h-7 w-7 border p-0 ${design.bg === b.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="h-6 w-6 rounded" style={{ background: b.css }} />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium">Background Color</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {BG_COLORS.map((c, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="icon"
                      title={`Color ${i + 1}`}
                      aria-label={`Background color ${i + 1}`}
                      onClick={() => change((d) => ({ ...d, bg: null, bgColor: c }))}
                      className={`h-6 w-6 rounded-full border p-0 ${design.bgColor === c ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="h-5 w-5 rounded-full" style={{ background: c }} />
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setHistory((h) =>
                    historySet(h, defaultDesign(h.present.personId, h.present.templateId)),
                  );
                  setSelected(null);
                  setSavedId(null);
                }}
              >
                <RotateCw />
                Reset Elements
              </Button>
            </section>
          </aside>

          {/* Column 2: Design Card Studio & Canvas Stage */}
          <section className="min-w-0">
            <div
              ref={stageRef}
              className={cn(
                panel,
                "canvas-stage flex min-h-[480px] flex-col items-center justify-center overflow-auto p-3 sm:p-5 transition-all",
                isFullscreen &&
                  "fixed inset-0 z-50 h-screen w-screen rounded-none bg-cosmic/95 p-6 backdrop-blur-md",
              )}
            >
              <div
                style={{
                  width: `${zoom}%`,
                  maxWidth: `${Math.round(490 * (zoom / 100))}px`,
                  minWidth: `${Math.round(280 * (zoom / 100))}px`,
                  transition: "width 0.15s ease-out, max-width 0.15s ease-out",
                }}
              >
                <div
                  ref={canvas}
                  className="card-art relative w-full overflow-hidden shadow-soft rounded-lg"
                  onClick={() => setSelected(null)}
                  style={
                    {
                      aspectRatio: `${dimensions.w}/${dimensions.h}`,
                      background,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: ink.ink,
                      containerType: "inline-size",
                    } as CSSProperties
                  }
                >
                  {design.elements.map((e) => {
                    const active = selected === e.id;
                    const visual: CSSProperties = {
                      left: `${(e.x / dimensions.w) * 100}%`,
                      top: `${(e.y / dimensions.h) * 100}%`,
                      width: `${(e.w / dimensions.w) * 100}%`,
                      height: `${(e.h / dimensions.h) * 100}%`,
                      transform: `rotate(${e.rot}deg)`,
                      color:
                        e.color ||
                        (e.type === "heading" || e.type === "name" ? ink.accent : ink.ink),
                      textAlign: e.align || "center",
                      fontSize: `${((e.fontSize || (e.type === "heading" ? 100 : e.type === "name" ? 92 : e.type === "message" || e.type === "quote" ? 32 : e.type === "wish" ? 24 : 28)) / dimensions.w) * 100}cqw`,
                      fontFamily:
                        e.font === "script"
                          ? '"Brush Script MT", "Segoe Script", cursive'
                          : e.font === "display"
                            ? "Georgia, serif"
                            : "var(--font-sans)",
                      fontWeight: e.bold ? 700 : undefined,
                      fontStyle: e.italic ? "italic" : undefined,
                    };
                    const chip = [
                      "dob",
                      "age",
                      "zodiac",
                      "flower",
                      "birthstone",
                      "moon",
                      "countdown",
                      "statDays",
                      "statHeartbeats",
                      "statMoon",
                      "statZodiac",
                      "wish",
                    ].includes(e.type);
                    return (
                      <div
                        key={e.id}
                        data-card-element={e.type}
                        className={`card-element absolute flex select-none items-center justify-center cursor-move ${active ? "card-selected" : ""}`}
                        style={visual}
                        onPointerDown={(ev) => pointerDown(ev, e, "move")}
                        onPointerMove={pointerMove}
                        onPointerUp={pointerUp}
                        onLostPointerCapture={pointerUp}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <div
                          className={`flex h-full w-full flex-col items-center justify-center overflow-hidden leading-tight ${chip ? "card-chip rounded-md px-[3%]" : ""} ${e.type === "photo" ? "rounded-full border-[.5cqw] border-current" : ""}`}
                          style={
                            chip
                              ? { background: ink.chip, border: `1px solid ${ink.chipBorder}` }
                              : {}
                          }
                        >
                          {elContent(e, person, now, design.photo, qr)}
                        </div>
                        {active && (
                          <>
                            <span
                              className="card-handle card-handle-resize"
                              title="Drag to resize"
                              onPointerDown={(ev) => pointerDown(ev, e, "resize")}
                            />
                            <span
                              className="card-handle card-handle-rotate"
                              title="Drag to rotate"
                              onPointerDown={(ev) => pointerDown(ev, e, "rotate")}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isFullscreen && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-card/90 p-2 shadow-lg backdrop-blur-sm">
                  {tool("Zoom out", zoomOut, <Minus />, zoom <= 70)}
                  <span className="w-12 text-center text-xs font-semibold">{zoom}%</span>
                  {tool("Zoom in", zoomIn, <Plus />, zoom >= 150)}
                  {tool("Exit fullscreen", toggleFullscreen, <Shrink />)}
                </div>
              )}
            </div>

            {selectedEl && (
              <div className={`${panel} mt-2 flex flex-wrap items-center gap-2 p-2`}>
                <span className="mr-auto text-xs font-semibold capitalize">{selectedEl.type}</span>
                {EDITABLE.includes(selectedEl.type) && (
                  <input
                    aria-label="Element text"
                    className="min-w-[150px] flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    value={
                      selectedEl.text ?? (selectedEl.type === "name" ? person?.name || "" : "")
                    }
                    onChange={(e) => patchEl({ text: e.target.value })}
                  />
                )}
                {EDITABLE.includes(selectedEl.type) && (
                  <>
                    <input
                      type="number"
                      min="12"
                      max="250"
                      aria-label="Font size"
                      title="Font size"
                      value={selectedEl.fontSize || 32}
                      onChange={(e) => patchEl({ fontSize: Number(e.target.value) })}
                      className="w-14 rounded-md border bg-background p-1.5 text-xs"
                    />
                    <input
                      type="color"
                      title="Text color"
                      aria-label="Text color"
                      value={selectedEl.color || ink.accent}
                      onChange={(e) => patchEl({ color: e.target.value })}
                      className="h-8 w-9 cursor-pointer"
                    />
                  </>
                )}
                {tool("Duplicate element", duplicateElement, <Copy />)}
                {tool("Delete element", removeElement, <Trash2 />)}
              </div>
            )}

            {/* Workspace Zoom & Action Toolbar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {tool(
                "Undo",
                () => {
                  setHistory(historyUndo);
                  setSelected(null);
                },
                <Undo2 />,
                !history.past.length,
              )}
              {tool(
                "Redo",
                () => {
                  setHistory(historyRedo);
                  setSelected(null);
                },
                <Redo2 />,
                !history.future.length,
              )}
              <span className="mx-2 h-5 border-l" />
              {tool("Zoom out", zoomOut, <Minus />, zoom <= 70)}
              <span className="w-12 text-center text-xs font-semibold">{zoom}%</span>
              {tool("Zoom in", zoomIn, <Plus />, zoom >= 150)}
              {tool(
                isFullscreen ? "Exit fullscreen" : "Fullscreen workspace",
                toggleFullscreen,
                isFullscreen ? <Shrink /> : <Expand />,
              )}
              <span className="ml-2 text-[11px] text-muted-foreground hidden sm:inline">
                Drag to move · corners to resize · top handle to rotate
              </span>
            </div>

            {/* Recent Saved Designs */}
            <div className={`${panel} mt-3 p-3`}>
              <h3 className={label}>Recent Saved Designs</h3>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {saved.length ? (
                  saved.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-20 w-20 shrink-0 flex-col p-1 text-[10px]"
                      title={`Load design saved ${new Date(item.savedAt).toLocaleString()}`}
                      onClick={() => {
                        setHistory(historyInit(item.design));
                        setSavedId(item.id);
                        setSelected(null);
                      }}
                    >
                      <img
                        src={templateById(item.design.templateId).image}
                        className="h-12 w-full rounded-sm object-cover"
                        alt="Saved design"
                      />
                      <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                    </Button>
                  ))
                ) : (
                  <p className="py-3 text-xs text-muted-foreground">
                    Your saved cards will appear here.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Column 3: Elements, Templates & Preview & Export */}
          <aside className="space-y-3">
            <section className={`${panel} p-3`}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-primary">②</span>
                <h3 className={label}>Add Elements</h3>
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Add elements onto the card canvas
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ELEMENTS.map((e) => (
                  <Button
                    key={e.type}
                    variant="outline"
                    onClick={() => addElement(e.type)}
                    className="h-[54px] min-w-0 flex-col gap-0.5 px-0.5 text-[10px]"
                  >
                    <span className="text-lg leading-none text-primary">{e.symbol}</span>
                    <span className="truncate w-full text-center">{e.label}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className={`${panel} p-3`}>
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <h3 className={label}>Templates</h3>
                  <p className="text-[10px] text-muted-foreground">Select a theme layout</p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-[11px]"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Show Less" : "View All"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.slice(0, showAll ? TEMPLATES.length : 6).map((t) => (
                  <Button
                    key={t.id}
                    variant="ghost"
                    title={t.label}
                    aria-label={`${t.label} template`}
                    className={`relative h-auto w-full overflow-hidden rounded-md border p-0 ${design.templateId === t.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => selectTemplate(t.id)}
                  >
                    <img src={t.image} alt={t.label} className="aspect-[3/4] w-full object-cover" />
                    {design.templateId === t.id && (
                      <Check className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                    )}
                  </Button>
                ))}
              </div>
            </section>

            {/* Preview & Export Panel */}
            <section className={`${panel} p-3 space-y-2`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-primary">③</span>
                <h3 className={label}>Preview & Export</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Review and export your birthday card
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="min-w-0 text-[11px]"
                  disabled={busy}
                  onClick={() => void downloadPng()}
                >
                  <Download />
                  Download PNG
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-w-0 text-[11px]"
                  disabled={busy}
                  onClick={() => void downloadPdf()}
                >
                  <Download />
                  Download PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-w-0 text-[11px]"
                  disabled={busy}
                  onClick={() => void shareCard()}
                >
                  <Share2 />
                  Share Card
                </Button>
                <Button size="sm" variant="outline" className="min-w-0 text-[11px]" onClick={save}>
                  <Save />
                  Save Design
                </Button>
              </div>
            </section>
          </aside>
        </div>

        {addOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-cosmic/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add person"
          >
            <div className={`${panel} w-full max-w-sm space-y-4 p-5`}>
              <div className="flex justify-between">
                <h3 className="font-semibold">Add a person</h3>
                {tool("Close", () => setAddOpen(false), <X />)}
              </div>
              <label className="block text-xs">
                Name
                <input
                  autoFocus
                  value={newPerson.name}
                  onChange={(e) => setNewPerson((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border bg-background p-2"
                />
              </label>
              <label className="block text-xs">
                Date of birth
                <input
                  type="date"
                  value={newPerson.dob}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setNewPerson((p) => ({ ...p, dob: e.target.value }))}
                  className="mt-1 w-full rounded-md border bg-background p-2"
                />
              </label>
              <Button className="w-full" onClick={addPerson}>
                <Plus />
                Add Person
              </Button>
            </div>
          </div>
        )}

        {help && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-cosmic/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="How it works"
          >
            <div className={`${panel} w-full max-w-sm space-y-3 p-5`}>
              <div className="flex justify-between">
                <h3 className="font-semibold">Create your birthday card</h3>
                {tool("Close", () => setHelp(false), <X />)}
              </div>
              <p className="text-sm">
                ① Select a person to personalize details automatically.
                <br />
                ② Choose a template or arrange elements on the canvas.
                <br />③ Preview and export your card as high-res PNG or PDF.
              </p>
              <Button onClick={() => setHelp(false)}>
                Start designing <ArrowRight />
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function locationSafeOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}
