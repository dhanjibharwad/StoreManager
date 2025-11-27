import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";
// import GoogleMapScript from "./GoogleMapScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "UNION ENTERPRIZE | Your True Destination",
 description: "Resolve your issue as fast as possible. Connect to us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favlogo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/favlogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/favlogo.png" />

           <link rel="manifest" href="/images/favlogo.png" />
            <link rel="icon" type="image/png" sizes="192x192" href="/images/favlogo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>  
         {/* <GoogleMapScript /> */}
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}
