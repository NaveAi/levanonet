import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NavHeader } from "@/components/nav-header";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "לו — רשת המשפחה",
  description: "רשת חברתית משפחתית פרטית",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let htmlClass = "";
  let bodyClass = "";

  if (session?.user?.id) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });
    if (settings?.theme === "DARK") htmlClass = "dark";
    if (settings?.theme === "LIGHT") htmlClass = "light";
    if (settings?.fontSize === "large") bodyClass = "text-lg";
  }

  return (
    <html lang="he" dir="rtl" className={`${geist.variable} h-full ${htmlClass}`.trim()}>
      <body
        className={`min-h-full text-[var(--foreground)] antialiased ${bodyClass}`.trim()}
      >
        <Providers>
          <NavHeader />
          <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-2xl px-4 py-6 sm:max-w-3xl sm:px-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
