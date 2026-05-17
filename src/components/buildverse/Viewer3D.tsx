import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Layers as LayersIcon, Box, Scissors, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import ExportModelModal from "./ExportModelModal";

interface LayerCfg {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

const HouseModel = ({ layers, section }: { layers: Record<string, LayerCfg>; section: { x: number; y: number; z: number; active: boolean } }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  const sectionClip = section.active
    ? [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), section.x),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), section.y),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), section.z),
      ]
    : undefined;

  const mat = (color: string, opacity: number, wireframe = false) => (
    <meshStandardMaterial
      color={color}
      transparent
      opacity={opacity}
      wireframe={wireframe}
      side={THREE.DoubleSide}
      clippingPlanes={sectionClip}
      clipShadows
    />
  );

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {layers.foundation.visible && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.3, 3]} />
          {mat("#4a9e8e", layers.foundation.opacity)}
        </mesh>
      )}
      {layers.walls.visible && (
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[3.8, 2, 2.8]} />
          {mat("#2dd4bf", layers.walls.opacity * 0.4, true)}
        </mesh>
      )}
      {layers.roof.visible && (
        <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3, 1.2, 4]} />
          {mat("#14b8a6", layers.roof.opacity * 0.6, true)}
        </mesh>
      )}
      {layers.openings.visible && (
        <>
          <mesh position={[0, 0.7, 1.41]}>
            <planeGeometry args={[0.7, 1.4]} />
            {mat("#f59e0b", layers.openings.opacity)}
          </mesh>
          {[[-1.2, 1.2, 1.41], [1.2, 1.2, 1.41]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <planeGeometry args={[0.6, 0.5]} />
              {mat("#38bdf8", layers.openings.opacity)}
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

const OBJECTS = [
  { id: "F-001", name: "Фундамент монолитный", type: "Foundation", material: "Бетон B25", volume: "12.3 м³" },
  { id: "W-001", name: "Стена несущая", type: "Wall", material: "Кирпич М150", volume: "8.4 м³" },
  { id: "W-002", name: "Стена перегородка", type: "Wall", material: "Газобетон D500", volume: "3.2 м³" },
  { id: "R-001", name: "Кровля скатная", type: "Roof", material: "Металлочерепица", volume: "45 м²" },
  { id: "D-001", name: "Дверь входная", type: "Door", material: "Сталь", volume: "0.98 м²" },
  { id: "WD-001", name: "Окно ПВХ", type: "Window", material: "Двухкамерный стеклопакет", volume: "0.3 м²" },
];

const Viewer3D = () => {
  const [activePanel, setActivePanel] = useState<"layers" | "objects" | "section" | null>(null);
  const [exportFormat, setExportFormat] = useState<"IFC" | "RVT" | "DWG" | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<string, LayerCfg>>({
    foundation: { id: "foundation", name: "Фундамент", visible: true, opacity: 0.6 },
    walls: { id: "walls", name: "Стены", visible: true, opacity: 1 },
    roof: { id: "roof", name: "Кровля", visible: true, opacity: 1 },
    openings: { id: "openings", name: "Окна и двери", visible: true, opacity: 1 },
  });
  const [section, setSection] = useState({ x: 0, y: 0, z: 0, active: false });

  const toggleLayer = (id: string) =>
    setLayers((p) => ({ ...p, [id]: { ...p[id], visible: !p[id].visible } }));
  const setLayerOpacity = (id: string, v: number) =>
    setLayers((p) => ({ ...p, [id]: { ...p[id], opacity: v } }));

  const togglePanel = (p: "layers" | "objects" | "section") =>
    setActivePanel((cur) => (cur === p ? null : p));

  const toolbarBtn = (id: "layers" | "objects" | "section", label: string, Icon: typeof LayersIcon) => (
    <button
      key={id}
      type="button"
      onClick={() => togglePanel(id)}
      className={`glass-card px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
        activePanel === id ? "bg-primary/20 text-primary border border-primary/40" : "text-muted-foreground hover:text-foreground hover:bg-white/10"
      }`}
    >
      <Icon className="w-3 h-3" /> {label}
    </button>
  );

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {toolbarBtn("layers", "Слои", LayersIcon)}
        {toolbarBtn("objects", "Объекты", Box)}
        {toolbarBtn("section", "Сечение", Scissors)}
      </div>

      {/* Right tools (export) */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        {(["IFC", "RVT", "DWG"] as const).map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => setExportFormat(fmt)}
            className="glass-card px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="glass-card rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground">
          Вращайте модель • Колесо мыши для масштаба
        </div>
      </div>

      {/* Layers Panel */}
      {activePanel === "layers" && (
        <div className="absolute top-14 left-3 z-20 w-64 glass-card rounded-xl p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">Слои модели</h4>
            <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-3">
            {Object.values(layers).map((l) => (
              <div key={l.id} className="space-y-1.5">
                <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <Checkbox checked={l.visible} onCheckedChange={() => toggleLayer(l.id)} />
                  <span className={l.visible ? "text-foreground" : "text-muted-foreground/50"}>{l.name}</span>
                </label>
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-[9px] text-muted-foreground w-12">Прозр.</span>
                  <Slider
                    value={[l.opacity * 100]}
                    onValueChange={(v) => setLayerOpacity(l.id, v[0] / 100)}
                    max={100}
                    step={5}
                    disabled={!l.visible}
                    className="flex-1"
                  />
                  <span className="text-[9px] text-muted-foreground w-8 text-right">{Math.round(l.opacity * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objects Panel */}
      {activePanel === "objects" && (
        <div className="absolute top-14 left-3 z-20 w-72 glass-card rounded-xl p-3 animate-fade-in max-h-[80%] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">Объекты модели</h4>
            <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-1">
            {OBJECTS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedObject(selectedObject === o.id ? null : o.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedObject === o.id ? "bg-primary/20 border border-primary/40" : "hover:bg-white/10"
                }`}
              >
                <p className="text-[11px] text-foreground font-medium">{o.name}</p>
                <p className="text-[9px] text-muted-foreground">{o.id} • {o.type}</p>
              </button>
            ))}
          </div>
          {selectedObject && (() => {
            const o = OBJECTS.find((x) => x.id === selectedObject);
            if (!o) return null;
            return (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[10px]">
                <p className="text-muted-foreground">Свойства:</p>
                <p><span className="text-muted-foreground">Материал:</span> <span className="text-foreground">{o.material}</span></p>
                <p><span className="text-muted-foreground">Объём:</span> <span className="text-foreground">{o.volume}</span></p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Section Panel */}
      {activePanel === "section" && (
        <div className="absolute top-14 left-3 z-20 w-64 glass-card rounded-xl p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">Сечение модели</h4>
            <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
          <label className="flex items-center gap-2 text-[11px] cursor-pointer mb-3">
            <Checkbox checked={section.active} onCheckedChange={(v) => setSection((s) => ({ ...s, active: !!v }))} />
            <span className="text-foreground">Включить сечение</span>
          </label>
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="space-y-1 mb-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Ось {axis.toUpperCase()}</span>
                <span className="text-foreground">{section[axis].toFixed(2)}</span>
              </div>
              <Slider
                value={[section[axis]]}
                onValueChange={(v) => setSection((s) => ({ ...s, [axis]: v[0] }))}
                min={-3}
                max={3}
                step={0.1}
                disabled={!section.active}
              />
            </div>
          ))}
        </div>
      )}

      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true, localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} color="#2dd4bf" />
          <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#38bdf8" />
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#f59e0b" />
          <HouseModel layers={layers} section={section} />
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellColor="#2dd4bf"
            sectionSize={5}
            sectionColor="#14b8a6"
            fadeDistance={15}
            fadeStrength={1}
            infiniteGrid
            position={[0, -0.01, 0]}
          />
          <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={20} maxPolarAngle={Math.PI / 2.1} />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      <ExportModelModal
        open={exportFormat !== null}
        format={exportFormat ?? "IFC"}
        onOpenChange={(v) => !v && setExportFormat(null)}
      />
    </div>
  );
};

export default Viewer3D;
