import {
  Ban,
  CalendarCheck,
  CircleAlert,
  type LucideIcon,
  MessageSquareText,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
} from "lucide-react";
import type { CallOutcome } from "./types";

export type OutcomeTone = "success" | "primary" | "neutral" | "muted" | "destructive";

export const outcomes: Record<CallOutcome, { label: string; icon: LucideIcon; tone: OutcomeTone }> = {
  booking: { label: "Booked", icon: CalendarCheck, tone: "success" },
  transfer: { label: "Transferred", icon: PhoneForwarded, tone: "primary" },
  message: { label: "Message taken", icon: MessageSquareText, tone: "neutral" },
  answered: { label: "Answered", icon: PhoneIncoming, tone: "neutral" },
  spam: { label: "Spam blocked", icon: Ban, tone: "muted" },
  abandoned: { label: "Hung up", icon: PhoneMissed, tone: "muted" },
  failed: { label: "Failed", icon: CircleAlert, tone: "destructive" },
};

export const outcomeIds = Object.keys(outcomes) as CallOutcome[];
