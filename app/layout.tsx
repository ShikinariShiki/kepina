import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Kepina Day Off",
    description: "Welcome to Kepina's special corner of the internet ✨",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
