import {
  Code,
  Cpu,
  HardDrive,
  Monitor,
  Network,
  Package,
  Printer,
  Smartphone,
} from "lucide-react";
import { Category, Department, Status } from "../backend";

export const CATEGORY_OPTIONS: {
  value: Category;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: Category.Computer,
    label: "Computer",
    icon: <Cpu className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Monitor,
    label: "Monitor",
    icon: <Monitor className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Printer,
    label: "Printer",
    icon: <Printer className="h-3.5 w-3.5" />,
  },
  {
    value: Category.NetworkDevice,
    label: "Network Device",
    icon: <Network className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Phone,
    label: "Phone",
    icon: <Smartphone className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Peripheral,
    label: "Peripheral",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Software,
    label: "Software",
    icon: <Code className="h-3.5 w-3.5" />,
  },
  {
    value: Category.Other,
    label: "Other",
    icon: <HardDrive className="h-3.5 w-3.5" />,
  },
];

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: Status.Active, label: "Active" },
  { value: Status.Inactive, label: "Inactive" },
  { value: Status.InRepair, label: "In Repair" },
  { value: Status.Retired, label: "Retired" },
];

export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: Department.IT, label: "IT" },
  { value: Department.Biomedical, label: "Biomedical" },
  { value: Department.Engineering, label: "Engineering" },
  { value: Department.Accounts, label: "Accounts" },
  { value: Department.HR, label: "HR" },
  { value: Department.Finance, label: "Finance" },
  { value: Department.Administration, label: "Administration" },
  { value: Department.Maintenance, label: "Maintenance" },
  { value: Department.Other, label: "Other" },
];

export const VENDOR_OPTIONS = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "Microsoft",
  "Cisco",
  "Samsung",
  "Acer",
  "ASUS",
  "Toshiba",
  "Other",
];

export function getCategoryIcon(category: Category) {
  const found = CATEGORY_OPTIONS.find((c) => c.value === category);
  return found?.icon ?? <HardDrive className="h-3.5 w-3.5" />;
}

export function StatusBadge({ status }: { status: Status }) {
  const config = {
    [Status.Active]: {
      label: "Active",
      className:
        "bg-[oklch(0.72_0.18_145/0.15)] text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145/0.3)]",
      pulse: true,
    },
    [Status.Inactive]: {
      label: "Inactive",
      className:
        "bg-[oklch(0.55_0.02_240/0.15)] text-[oklch(0.65_0.02_240)] border-[oklch(0.55_0.02_240/0.3)]",
      pulse: false,
    },
    [Status.InRepair]: {
      label: "In Repair",
      className:
        "bg-[oklch(0.78_0.16_70/0.15)] text-[oklch(0.78_0.16_70)] border-[oklch(0.78_0.16_70/0.3)]",
      pulse: false,
    },
    [Status.Retired]: {
      label: "Retired",
      className:
        "bg-[oklch(0.6_0.22_25/0.15)] text-[oklch(0.6_0.22_25)] border-[oklch(0.6_0.22_25/0.3)]",
      pulse: false,
    },
  };
  const { label, className, pulse } = config[status] ?? config[Status.Inactive];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded border ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
