import { Inter } from "next/font/google";
import { AuthPageFrame } from "@/components/brand/AuthPageFrame";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.className} relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f4f8] via-[#f9fafb] to-[#f9fafb]`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(37,99,235,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <AuthPageFrame>{children}</AuthPageFrame>
      </div>
    </div>
  );
}
