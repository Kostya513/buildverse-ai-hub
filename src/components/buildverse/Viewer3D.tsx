import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";

/* Simple house wireframe model */
const HouseModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Foundation */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.3, 3]} />
        <meshStandardMaterial color="#4a9e8e" transparent opacity={0.6} wireframe={false} />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[3.8, 2, 2.8]} />
        <meshStandardMaterial color="#2dd4bf" transparent opacity={0.15} wireframe />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3, 1.2, 4]} />
        <meshStandardMaterial color="#14b8a6" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Floor planes */}
      <mesh position={[0, 1.15, 0]}>
        <planeGeometry args={[3.8, 2.8]} />
        <meshStandardMaterial color="#2dd4bf" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.7, 1.41]}>
        <planeGeometry args={[0.7, 1.4]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Windows */}
      {[[-1.2, 1.2, 1.41], [1.2, 1.2, 1.41]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <planeGeometry args={[0.6, 0.5]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

const Viewer3D = () => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden glass-card">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {["Слои", "Объекты", "Сечение"].map((label) => (
          <button
            key={label}
            className="glass-card px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right tools */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        {["IFC", "RVT", "DWG"].map((fmt) => (
          <button
            key={fmt}
            className="glass-card px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
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

      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} color="#2dd4bf" />
          <directionalLight position={[-3, 5, -3]} intensity={0.3} color="#38bdf8" />
          <pointLight position={[0, 3, 0]} intensity={0.3} color="#f59e0b" />
          <HouseModel />
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
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.1}
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Viewer3D;
