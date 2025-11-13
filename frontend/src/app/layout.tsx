import type {Metadata} from "next";
import './globals.css'
import Providers from "./providers";

export const metadata: Metadata = {
    title: "Sangcheng Payroll Manager",
    description: "Payroll management system for Sangcheng",
    icons: {
        icon: "/logo.jpg",
    },
};
export default function RootLayout({children}: { children: React.ReactNode }) {

    return (
        <html lang="en">
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}