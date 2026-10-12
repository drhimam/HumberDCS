import {
  Stethoscope, Heart, GitBranch, Waves, ScanLine, ShieldCheck, Users, Activity, Disc, HeartPulse, GitFork, Cpu,
  SlidersHorizontal, HeartHandshake, BookOpen,
} from "lucide-react";

const ICONS = {
  DCS5000: Stethoscope, DCS5002: Heart, DCS5003: GitBranch, DCS5004: Waves, DCS5005: ScanLine, DCS5006: ShieldCheck,
  IPE101: Users, DCS5500: Activity, DCS5501: Disc, DCS5502: HeartPulse, DCS5503: GitFork, DCS5504: Cpu,
  DCS5505: SlidersHorizontal, DCS5506: HeartHandshake,
};

export const subjectIcon = (id) => ICONS[id] || BookOpen;
