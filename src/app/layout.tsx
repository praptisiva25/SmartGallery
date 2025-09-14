import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
title: "SmartGallery",
description: "Private, AI‑powered photo & video library",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en" className="dark">
<body className={`${inter.className} bg-hero min-h-screen`}>{children}</body>
</html>
);
}