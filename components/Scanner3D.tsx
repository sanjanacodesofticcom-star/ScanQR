'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Scan, Sparkles, Zap, Shield, CreditCard } from 'lucide-react';

export default function Scanner3D() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 12, ry: -18, rz: 4 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move handler for interactive 3D parallax tilt & smooth drift
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth) * 2 - 1; // -1 to 1
      const yNorm = (e.clientY / innerHeight) * 2 - 1; // -1 to 1

      setMousePos({ x: xNorm * 30, y: yNorm * 20 });
      setTilt({
        rx: 12 - yNorm * 18,
        ry: -18 + xNorm * 22,
        rz: 4 + xNorm * 5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 pointer-events-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* 3D Holographic Perspective Stage */}
      <div 
        className="relative group cursor-grab active:cursor-grabbing"
        style={{ perspective: 1200 }}
      >
        {/* Glow Halo behind scanner */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-sky-500/20 to-indigo-600/20 rounded-full blur-xl animate-pulse pointer-events-none -z-10" />

        {/* 3D Floating Scanner Body */}
        <div 
          className="w-44 h-48 sm:w-52 sm:h-56 relative transition-transform duration-300 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(${tilt.rz}deg)`,
          }}
        >
          {/* Layer 1: Base Platform with Dark Blue Glass */}
          <div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900/95 via-[#0c1e3d]/90 to-[#071329]/95 border border-cyan-500/40 shadow-2xl shadow-blue-950/40 backdrop-blur-md overflow-hidden flex flex-col justify-between p-3.5"
            style={{
              transform: 'translateZ(0px)',
              boxShadow: '0 20px 40px -10px rgba(10, 25, 47, 0.5), inset 0 0 15px rgba(56, 189, 248, 0.2)',
            }}
          >
            {/* Holographic Circuit Grid Texture */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.1) 1px, transparent 1px)`,
                backgroundSize: '16px 16px, 8px 8px, 8px 8px',
              }}
            />

            {/* Top HUD Bar */}
            <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 z-10">
              <span className="flex items-center gap-1 font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                3D SCANNER
              </span>
              <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                LIVE
              </span>
            </div>

            {/* Bottom Status Info */}
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 z-10 border-t border-cyan-900/40 pt-1.5">
              <span className="text-cyan-400/80">UPI • NPCI</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
          </div>

          {/* Layer 2: 3D Hologram QR Target Plane */}
          <div 
            className="absolute inset-4 rounded-xl border border-cyan-400/50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center overflow-hidden"
            style={{
              transform: 'translateZ(24px)',
            }}
          >
            {/* Glowing 3D QR Matrix Pattern */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <QrCode className="w-full h-full text-cyan-400/80 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]" />

              {/* Central Target Reticle */}
              <div className="absolute w-8 h-8 rounded-full border border-cyan-300/80 animate-ping pointer-events-none" />
              <div className="absolute w-4 h-4 rounded-full bg-cyan-400/30 border border-cyan-200 pointer-events-none flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </div>

            {/* HUD Corner Brackets */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-2 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
          </div>

          {/* Layer 3: Sweeping Neon Laser Scan Beam */}
          <div 
            className="absolute inset-x-3 pointer-events-none overflow-hidden"
            style={{
              transform: 'translateZ(38px)',
              top: 16,
              bottom: 16,
            }}
          >
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#38bdf8,0_0_30px_#0284c7] animate-laserSweep" />
            <div className="w-full h-8 bg-gradient-to-b from-cyan-400/20 to-transparent animate-laserSweepCone" />
          </div>

          {/* Layer 4: Floating Mini Credit Card Hologram */}
          <div 
            className="absolute -top-3 -right-3 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-300/40 text-white shadow-lg shadow-blue-500/30 flex items-center gap-1.5 text-[9px] font-bold font-mono tracking-wider animate-floatSlow"
            style={{
              transform: 'translateZ(52px)',
            }}
          >
            <CreditCard className="w-3 h-3 text-cyan-200" />
            <span>CC UPI</span>
          </div>

          {/* Layer 5: Floating Node Badge */}
          <div 
            className="absolute -bottom-2 -left-2 px-2 py-1 rounded-md bg-slate-900/90 border border-cyan-500/50 text-cyan-300 shadow-md text-[8px] font-mono flex items-center gap-1 animate-floatReverse"
            style={{
              transform: 'translateZ(44px)',
            }}
          >
            <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span>FAST PAY</span>
          </div>
        </div>

        {/* Small Tooltip hint */}
        <div className="text-center mt-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[9px] font-mono text-cyan-300 shadow-sm">
            ✦ 3D Interactive Scanner
          </span>
        </div>
      </div>
    </div>
  );
}
