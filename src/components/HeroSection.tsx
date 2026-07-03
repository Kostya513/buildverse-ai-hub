import { ArchitecturalPattern } from './patterns/ArchitecturalPattern';

interface HeroSectionProps {
  onStartProject?: () => void;
}

export const HeroSection = ({ onStartProject }: HeroSectionProps) => {
  return (
    <section className="relative w-full" style={{ height: '400px' }}>
      {/* Фон */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #0F1F3A 0%, #0A1628 100%)'
        }}
      />

      {/* SVG-паттерн */}
      <ArchitecturalPattern />

      {/* Текстовый блок */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Заголовок */}
        <h2
          className="text-center mb-6"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 300,
            fontSize: '46px',
            color: '#E8EEF2',
            lineHeight: 1.3,
            textShadow: `
              0 2px 4px rgba(10,22,40,0.6),
              0 8px 16px rgba(77,208,225,0.15),
              0 16px 32px rgba(77,208,225,0.08)
            `
          }}
        >
          Постройте будущее сегодня
        </h2>

        {/* Подзаголовок */}
        <div className="flex items-center gap-4 mb-10">
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 300,
              fontSize: '18px',
              color: '#E8EEF2',
              opacity: 0.8,
              textShadow: '0 1px 2px rgba(10,22,40,0.5), 0 4px 8px rgba(77,208,225,0.1)'
            }}
          >
            AI-технологии
          </span>
          <div className="w-px h-5" style={{ backgroundColor: '#A8C5D6', opacity: 0.4 }} />
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 300,
              fontSize: '18px',
              color: '#E8EEF2',
              opacity: 0.8,
              textShadow: '0 1px 2px rgba(10,22,40,0.5), 0 4px 8px rgba(77,208,225,0.1)'
            }}
          >
            Реальные материалы
          </span>
          <div className="w-px h-5" style={{ backgroundColor: '#A8C5D6', opacity: 0.4 }} />
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 300,
              fontSize: '18px',
              color: '#E8EEF2',
              opacity: 0.8,
              textShadow: '0 1px 2px rgba(10,22,40,0.5), 0 4px 8px rgba(77,208,225,0.1)'
            }}
          >
            Проверенные подрядчики
          </span>
        </div>

        {/* Кнопка */}
        <button
          onClick={onStartProject}
          className="px-8 py-3 rounded-lg border transition-all duration-300 hover:scale-105 group"
          style={{
            width: '220px',
            height: '52px',
            borderColor: '#E8EEF2',
            borderWidth: '1.5px',
            color: '#E8EEF2',
            backgroundColor: 'transparent',
            boxShadow: '0 2px 4px rgba(10,22,40,0.4), 0 6px 12px rgba(77,208,225,0.12)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            Начать проект
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>
      </div>
    </section>
  );
};