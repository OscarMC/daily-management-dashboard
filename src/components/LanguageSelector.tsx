import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Flag } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' },
  ];

  const currentLang = i18n.language.split('-')[0]; // maneja 'en-US' → 'en'

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => {
          const isActive = lang.code === currentLang;
          return (
            <Button
              key={lang.code}
              variant={isActive ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => changeLang(lang.code)}
              className={`
                flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'}
              `}
              aria-pressed={isActive}
              title={`${lang.name} (${lang.code})`}
            >
              <Flag
                size={16}
                className={isActive ? 'text-white' : 'text-muted-foreground'}
              />
              <span className="font-medium">{lang.code.toUpperCase()}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export { LanguageSelector };