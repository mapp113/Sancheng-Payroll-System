"use client";

//test
import {createContext, useContext, useEffect, useMemo, useState} from "react";

type Language = "vi" | "en";

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
};

const STORAGE_KEY = "scpm.language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isSupportedLanguage(value: unknown): value is Language {
    return value === "vi" || value === "en";
}

export function LanguageProvider({children}: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("vi");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
        if (isSupportedLanguage(storedLanguage)) {
            setLanguageState(storedLanguage);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        document.documentElement.lang = language;
        document.documentElement.dataset.language = language;
        window.localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    const setLanguage = (nextLanguage: Language) => {
        setLanguageState(nextLanguage);
    };

    const toggleLanguage = () => {
        setLanguageState((prev) => (prev === "vi" ? "en" : "vi"));
    };

    const value = useMemo(
        () => ({language, setLanguage, toggleLanguage}),
        [language]
    );

    return (
        <LanguageContext.Provider value={value}>
            <div data-language={language}>{children}</div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }

    return context;
}