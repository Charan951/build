import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Terminal, FileCode2 } from 'lucide-react';

const CODE_FILES = [
  {
    file: 'App.tsx',
    lang: 'TypeScript React',
    code: [
      'import { Architect, Deploy } from "@byt/core";',
      'import { CloudCluster, Security } from "@byt/infra";',
      '',
      'export const Application = () => {',
      '  const system = Architect({',
      '    stack: "React 19 + Node.js",',
      '    cloud: CloudCluster.AWS_EAST,',
      '    security: Security.ZERO_TRUST',
      '  });',
      '',
      '  return <Deploy platform={system} autoScale={true} />;',
      '};'
    ],
    output: '✓ Live Build Succeeded (14ms)'
  },
  {
    file: 'server.ts',
    lang: 'Node.js Express',
    code: [
      'import express from "express";',
      'import { clusterManager } from "./cluster";',
      '',
      'const app = express();',
      'app.post("/api/v1/scale", async (req, res) => {',
      '  const metrics = await clusterManager.autoScale();',
      '  res.json({ success: true, metrics });',
      '});',
      '',
      'app.listen(8080, () => console.log("🚀 Server Ready"));'
    ],
    output: '⚡ Node.js Cluster Active (6ms)'
  }
];

function formatSyntax(line: string) {
  if (!line) return '';
  if (line.trim().startsWith('//')) {
    return <span className="text-gray-500 italic font-mono">{line}</span>;
  }
  if (
    line.includes('import') ||
    line.includes('export') ||
    line.includes('const') ||
    line.includes('return') ||
    line.includes('async') ||
    line.includes('await')
  ) {
    const parts = line.split(/(\bimport\b|\bexport\b|\bconst\b|\breturn\b|\basync\b|\bawait\b|\bfrom\b)/g);
    return parts.map((part, i) => {
      if (['import', 'export', 'const', 'return', 'async', 'await', 'from'].includes(part)) {
        return <span key={i} className="text-[#F472B6] font-bold font-mono">{part}</span>;
      }
      if (part.includes('"') || part.includes("'")) {
        return <span key={i} className="text-[#FBBF24] font-mono">{part}</span>;
      }
      return <span key={i} className="text-slate-100 font-mono">{part}</span>;
    });
  }
  if (line.includes('<') && line.includes('>')) {
    return <span className="text-[#38BDF8] font-semibold font-mono">{line}</span>;
  }
  return <span className="text-slate-200 font-mono">{line}</span>;
}

// 3D Core Terminal Matrix Cube (Desktop)
const CodeTerminalCube = () => {
  const cubeRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (cubeRef.current && wireRef.current) {
      cubeRef.current.rotation.y += delta * 0.4;
      cubeRef.current.rotation.x += delta * 0.2;
      wireRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.8}>
      <group>
        <mesh ref={cubeRef} scale={1.6}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#0F1412" roughness={0.15} metalness={0.85} />
        </mesh>
        <mesh ref={wireRef} scale={2.0}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshBasicMaterial color="#CDFB47" wireframe={true} transparent={true} opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Orbital Glass Ring (Desktop)
const CodeSyntaxRing = () => {
  const ringRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.25;
      ringRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1.2}>
      <group ref={ringRef}>
        <mesh scale={2.7}>
          <torusGeometry args={[1, 0.06, 16, 80]} />
          <meshPhysicalMaterial color="#CDFB47" transmission={0.7} opacity={0.85} transparent={true} roughness={0.1} />
        </mesh>
        {[-1.6, 0, 1.6].map((pos, idx) => (
          <mesh key={idx} position={[pos * 0.8, pos * 0.6, 0]} scale={0.25}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#CDFB47" metalness={0.9} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

// 3D Data Stream Particle Field (Desktop)
const CodeDataStream = () => {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 160;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#CDFB47" opacity={0.65} transparent />
    </points>
  );
};

// Mobile Live Interactive Code Terminal Component
const MobileCodeTerminal: React.FC = () => {
  const [fileIdx, setFileIdx] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [isCompiling, setIsCompiling] = useState(false);

  const activeFile = CODE_FILES[fileIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setLineCount((prev) => {
        if (prev < activeFile.code.length) {
          return prev + 1;
        } else {
          setIsCompiling(true);
          setTimeout(() => {
            setIsCompiling(false);
            setFileIdx((curr) => (curr + 1) % CODE_FILES.length);
            setLineCount(1);
          }, 2400);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(timer);
  }, [fileIdx, activeFile.code.length]);

  return (
    <div className="w-full my-4 shadow-2xl rounded-2xl overflow-hidden bg-dark/95 border border-white/20 backdrop-blur-xl text-left">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#0B0F0D] border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />

          <div className="flex items-center gap-1 ml-1.5">
            {CODE_FILES.map((f, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFileIdx(idx);
                  setLineCount(f.code.length);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors flex items-center gap-1 ${
                  fileIdx === idx
                    ? 'bg-[#15201A] text-primary border border-primary/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileCode2 className="w-3 h-3" />
                {f.file}
              </button>
            ))}
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE
        </span>
      </div>

      {/* Terminal Editor Body */}
      <div className="p-3 font-mono text-[11px] leading-5 text-gray-200 min-h-[190px] bg-[#070A08]/95 overflow-hidden">
        {activeFile.code.slice(0, lineCount).map((line, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="w-4 text-right text-gray-600 font-mono text-[10px] select-none">{i + 1}</span>
            <span className="flex-1 whitespace-pre font-mono text-[11px] tracking-wide">
              {formatSyntax(line)}
              {i === lineCount - 1 && (
                <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse align-middle" />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Terminal Status Footer */}
      <div className="px-3 py-2 bg-[#0D1410] border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-gray-200 truncate">
          <Terminal className="w-3 h-3 text-primary shrink-0" />
          {isCompiling ? (
            <span className="text-amber-400 font-semibold truncate">⚡ Compiling AST...</span>
          ) : (
            <span className="text-emerald-400 font-bold truncate">{activeFile.output}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const HeroCanvas: React.FC = () => {
  return (
    /* Desktop View: Render Pure 3D Interactive WebGL Scene */
    <div className="hidden lg:flex relative w-full h-[550px] items-center justify-center">
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={45} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-10, -10, -5]} intensity={2} color="#CDFB47" />

        <CodeTerminalCube />
        <CodeSyntaxRing />
        <CodeDataStream />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      <div className="absolute inset-0 pointer-events-none rounded-heroCard bg-gradient-to-t from-background via-transparent to-transparent opacity-30" />
    </div>
  );
};
