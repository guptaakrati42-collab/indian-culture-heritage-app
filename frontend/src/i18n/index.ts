import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation resources
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import bnTranslations from './locales/bn.json';
import teTranslations from './locales/te.json';
import mrTranslations from './locales/mr.json';
import taTranslations from './locales/ta.json';
import guTranslations from './locales/gu.json';
import knTranslations from './locales/kn.json';
import mlTranslations from './locales/ml.json';
import orTranslations from './locales/or.json';
import paTranslations from './locales/pa.json';
import asTranslations from './locales/as.json';
import ksTranslations from './locales/ks.json';
import kokTranslations from './locales/kok.json';
import mniTranslations from './locales/mni.json';
import neTranslations from './locales/ne.json';
import saTranslations from './locales/sa.json';
import sdTranslations from './locales/sd.json';
import urTranslations from './locales/ur.json';
import brxTranslations from './locales/brx.json';
import satTranslations from './locales/sat.json';
import maiTranslations from './locales/mai.json';
import doiTranslations from './locales/doi.json';

// Supported languages configuration
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
  { code: 'sat', name: 'Santhali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' }
];

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  bn: { translation: bnTranslations },
  te: { translation: teTranslations },
  mr: { translation: mrTranslations },
  ta: { translation: taTranslations },
  gu: { translation: guTranslations },
  kn: { translation: knTranslations },
  ml: { translation: mlTranslations },
  or: { translation: orTranslations },
  pa: { translation: paTranslations },
  as: { translation: asTranslations },
  ks: { translation: ksTranslations },
  kok: { translation: kokTranslations },
  mni: { translation: mniTranslations },
  ne: { translation: neTranslations },
  sa: { translation: saTranslations },
  sd: { translation: sdTranslations },
  ur: { translation: urTranslations },
  brx: { translation: brxTranslations },
  sat: { translation: satTranslations },
  mai: { translation: maiTranslations },
  doi: { translation: doiTranslations }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    backend: {
      loadPath: '/locales/{{lng}}.json'
    }
  });

export default i18n;