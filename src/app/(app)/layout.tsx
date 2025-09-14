import AppHeader from "../components/chrome/AppHeader";
import SideNav from "../components/chrome/SideNav";


export default function AppLayout({ children }: { children: React.ReactNode }) {
return (
<div className="min-h-[100dvh] grid grid-cols-12">
<aside className="col-span-12 md:col-span-3 xl:col-span-2 border-r border-white/10 p-4">
<SideNav />
</aside>
<div className="col-span-12 md:col-span-9 xl:col-span-10">
<AppHeader />
<main className="p-4">{children}</main>
</div>
</div>
);
}