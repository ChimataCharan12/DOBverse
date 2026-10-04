import React from "react";
import {
  AlarmClock,
  Dumbbell,
  BookOpen,
  Droplets,
  Coffee,
  GraduationCap,
  Laptop,
  Sparkles,
  Heart,
  Smile,
  Target,
  Footprints,
  Moon,
  Sun,
  Apple,
  CheckCircle2,
  CheckSquare,
  Flame,
  Trophy,
  Briefcase,
  Users,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlarmClock,
  Dumbbell,
  BookOpen,
  Droplets,
  Coffee,
  GraduationCap,
  Laptop,
  Sparkles,
  Heart,
  Smile,
  Target,
  Footprints,
  Moon,
  Sun,
  Apple,
  CheckCircle2,
  CheckSquare,
  Flame,
  Trophy,
  Briefcase,
  Users,
  Calendar,
};

export function HabitIcon({ name, className = "h-5 w-5" }: { name?: string; className?: string }) {
  const IconComponent = (name && ICON_MAP[name]) || Target || HelpCircle;
  return <IconComponent className={className} />;
}
