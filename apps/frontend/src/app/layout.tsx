import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/components/seo/metadata";
import { AuthProvider } from "@/context/AuthContext";
import { UsersProvider } from "@/context/UsersContext";
import { ConversationsProvider } from "@/context/ConversationsContext";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const lora = Lora({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-body`}>
        <AuthProvider>
          <UsersProvider>
            <ConversationsProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </ConversationsProvider>
          </UsersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
