import type { ReactNode } from "react";

export default function AuthorizationLayout({
                                                children,
                                            }: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#14365f] via-[#1f5ca0] to-[#3aa0d1] flex items-center justify-center px-4 py-10">
            {children}
        </div>
    );
}