"use client";

import {LanguageProvider} from "@/lib/language-context";
import {NotificationProvider} from "@/app/_components/common/pop-box/notification/notification-context";
import BottomRightNotification from "@/app/_components/common/pop-box/notification/bottom-right";

export default function Providers({children}: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <NotificationProvider>
                {children}
                <BottomRightNotification />
            </NotificationProvider>
        </LanguageProvider>
    );
}