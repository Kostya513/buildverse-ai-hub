import { useEffect, useRef } from 'react';

export const ArchitecturalPattern = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const lines = svgRef.current.querySelectorAll('line, path, rect');
    lines.forEach((line, index) => {
      const length = (line as SVGGeometryElement).getTotalLength?.() || 100;
      (line as SVGLineElement).style.strokeDasharray = `${length}`;
      (line as SVGLineElement).style.strokeDashoffset = `${length}`;
      (line as SVGLineElement).style.animation = `drawLine 14s ease-in-out ${index * 0.1}s infinite`;
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          @keyframes drawLine {
            0%, 100% { stroke-dashoffset: 100; opacity: 0; }
            10%, 90% { stroke-dashoffset: 0; opacity: 1; }
          }
        `}</style>
      </defs>

      {/* Слой 1: Сетка */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={`${i * 80}`}
          x2="100%"
          y2={`${i * 80}`}
          stroke="#A8C5D6"
          strokeWidth="0.5"
          opacity="0.06"
        />
      ))}
      {Array.from({ length: 30 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={`${i * 80}`}
          y1="0"
          x2={`${i * 80}`}
          y2="100%"
          stroke="#A8C5D6"
          strokeWidth="0.5"
          opacity="0.06"
        />
      ))}

      {/* Слой 2: Контуры зданий */}
      {[
        { x: 100, y: 200, w: 60, h: 120 },
        { x: 200, y: 150, w: 80, h: 170 },
        { x: 350, y: 180, w: 70, h: 140 },
        { x: 500, y: 160, w: 90, h: 160 },
        { x: 700, y: 190, w: 65, h: 130 },
        { x: 850, y: 170, w: 75, h: 150 },
        { x: 1000, y: 185, w: 85, h: 135 },
        { x: 1150, y: 175, w: 70, h: 145 },
      ].map((building, i) => (
        <g key={`building-${i}`}>
          <rect
            x={building.x}
            y={building.y}
            width={building.w}
            height={building.h}
            fill="none"
            stroke="#4DD0E1"
            strokeWidth="1"
            opacity="0.12"
          />
          {/* Окна */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 2 }).map((_, col) => (
              <rect
                key={`window-${i}-${row}-${col}`}
                x={building.x + 10 + col * 25}
                y={building.y + 15 + row * 25}
                width="12"
                height="15"
                fill="none"
                stroke="#4DD0E1"
                strokeWidth="0.5"
                opacity="0.08"
              />
            ))
          )}
        </g>
      ))}

      {/* Слой 3: Диагонали и дуги */}
      <line x1="0" y1="100" x2="400" y2="300" stroke="#80DEEA" strokeWidth="1" opacity="0.08" />
      <line x1="200" y1="0" x2="600" y2="400" stroke="#80DEEA" strokeWidth="1" opacity="0.08" />
      <line x1="800" y1="50" x2="1200" y2="350" stroke="#80DEEA" strokeWidth="1" opacity="0.08" />
      <path d="M 0 300 Q 200 200 400 300" fill="none" stroke="#80DEEA" strokeWidth="1" opacity="0.08" />
      <path d="M 800 100 Q 1000 200 1200 100" fill="none" stroke="#80DEEA" strokeWidth="1" opacity="0.08" />
    </svg>
  );
};