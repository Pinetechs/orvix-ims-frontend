import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      companies: 'Companies',
      users: 'Users',
      inventoryTasks: 'Inventory Tasks',
      reports: 'Reports',
      login: 'Login',
      logout: 'Logout',
      changePassword: 'Change Password',
    },
  },
  ar: {
    translation: {
      dashboard: 'لوحة التحكم',
      companies: 'الشركات',
      users: 'المستخدمون',
      inventoryTasks: 'مهام الجرد',
      reports: 'التقارير',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      changePassword: 'تغيير كلمة المرور',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    lng: 'en',
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
