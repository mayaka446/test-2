import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mayakas Management System",
  description: "Integrated CBC and Cambridge school management platform"
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
