import Link from "next/link";
import { Album, Home, Library, Search, Settings, ShieldCheck,Video, Truck,HardDrive } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
  { href: "/videoediting", label: "Video Editing", icon: Video },
  { href: "/storage", label: "Storage", icon: HardDrive},
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SideNav() {
  return (
    <nav className="space-y-3 text-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Album className="w-6 h-6 text-indigo-500" />
        <div>
          <div className="font-semibold leading-tight text-gray-900">SmartGallery</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green-500" /> privacy-first
          </div>
        </div>
      </div>

      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-500" /> <span>{label}</span>
        </Link>
      ))}

      <div className="mt-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="text-sm font-medium text-indigo-700 mb-1">Auto-Tagging</div>
        <p className="text-xs text-gray-600">Objects, Scenes, Emotions, OCR. Editable & redactable.</p>
      </div>
    </nav>
  );
}
