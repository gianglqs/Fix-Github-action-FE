import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
   en: {
      common: require('./en/common.json'),
   },
   vn: {
      common: require('./vn/common.json'),
   },
};

i18n.use(initReactI18next).init({
   fallbackLng: 'en',
   lng: 'en',
   resources: resources,
   ns: ['common'],
   defaultNS: 'common',
   supportedLngs: ['en', 'vn'],
});

i18n.languages = ['en', 'vn'];

export default i18n;
