"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

interface AdminSidebarProps {
  locale: string;
}

function buildNavItems(locale: string): NavItem[] {
  const base = `/${locale}/admin`;
  return [
    { label: "Dashboard", href: base },
    { label: "Appointments", href: `${base}/appointments` },
    { label: "Services", href: `${base}/services` },
    { label: "Staff", href: `${base}/staff` },
    { label: "Clients", href: `${base}/clients` },
    { label: "Memberships", href: `${base}/memberships` },
    { label: "Packages", href: `${base}/packages` },
    { label: "Coupons", href: `${base}/coupons` },
    { label: "Reports", href: `${base}/reports` },
    { label: "Settings", href: `${base}/settings` },
  ];
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const navItems = buildNavItems(locale);

  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 min-h-screen"
      style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-inverse)" }}
    >
      <div className="p-6">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-h4)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-inverse)",
          }}
        >
          Admin
        </span>
      </div>

      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === `/${locale}/admin`
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "block px-4 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-[--color-brand-primary-dark] font-semibold"
                      : "hover:bg-[--color-brand-primary-dark] opacity-80 hover:opacity-100",
                  ].join(" ")}
                  style={{ color: "var(--color-text-inverse)" }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
