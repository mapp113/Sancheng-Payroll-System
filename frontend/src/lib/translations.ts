"use client";

import {useCallback} from "react";

import {useLanguage} from "@/lib/language-context";
import type {Language} from "@/lib/language-context";

type TranslationTable = Record<Language, Record<string, string>>;

const translations: TranslationTable = {
    vi: {
        "navbar.adminDashboard": "Bảng điều khiển quản trị",
        "navbar.managerDashboard": "Bảng điều khiển quản lý",
        "navbar.hrDashboard": "Bảng điều khiển nhân sự",
        "navbar.language.vi": "Tiếng Việt",
        "navbar.language.en": "English",
        "navbar.switchToEnglish": "Chuyển sang tiếng Anh",
        "navbar.switchToVietnamese": "Chuyển sang tiếng Việt",
        "login.title": "Đăng nhập",
        "login.subtitle": "Chào mừng bạn trở lại!",
        "login.usernameLabel": "Tên đăng nhập:",
        "login.usernamePlaceholder": "Nhập tên đăng nhập",
        "login.passwordLabel": "Mật khẩu:",
        "login.passwordPlaceholder": "Nhập mật khẩu",
        "login.forgotPassword": "Quên mật khẩu?",
        "login.button": "Đăng nhập",
        "login.processing": "Đang xử lý...",
        "login.error": "Đăng nhập thất bại. Vui lòng thử lại.",
    },
    en: {
        "navbar.adminDashboard": "Admin Dashboard",
        "navbar.managerDashboard": "Manager Dashboard",
        "navbar.hrDashboard": "HR Dashboard",
        "navbar.language.vi": "Vietnamese",
        "navbar.language.en": "English",
        "navbar.switchToEnglish": "Switch to English",
        "navbar.switchToVietnamese": "Switch to Vietnamese",
        "login.title": "Login",
        "login.subtitle": "Welcome!",
        "login.usernameLabel": "Username:",
        "login.usernamePlaceholder": "Enter your username",
        "login.passwordLabel": "Password:",
        "login.passwordPlaceholder": "Enter your password",
        "login.forgotPassword": "Forgot password?",
        "login.button": "Login",
        "login.processing": "Processing...",
        "login.error": "Login failed. Please try again.",
    },
};

export type TranslationKey = keyof typeof translations.en;

function assertValidKey(key: string): asserts key is TranslationKey {
    if (!(key in translations.en)) {
        throw new Error(`Missing translation for key: ${key}`);
    }
}

export function translate(language: Language, key: TranslationKey): string {
    return translations[language][key];
}

export function useTranslations() {
    const {language} = useLanguage();

    return useCallback(
        (key: TranslationKey) => {
            assertValidKey(key);
            return translations[language][key];
        },
        [language]
    );
}