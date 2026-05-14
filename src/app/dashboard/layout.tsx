import { AppSidebar, MobileNav } from "@/components/layout"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex-1">
        <header className="lg:hidden border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <MobileNav />
            <div className="flex-1" />
          </div>
        </header>
        <main className="min-h-screen bg-slate-50 lg:pl-72">{children}</main>
      </div>
    </div>
  )
}