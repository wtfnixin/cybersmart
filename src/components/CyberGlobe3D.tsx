import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Globe, Crosshair, Radio } from 'lucide-react';

export const CyberGlobe3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeNode = 'Apex Payments Primary VPC (Denver)';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 3. Dot Sphere Particles
    const dotCount = 1200;
    const dotGeometry = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotCount * 3);
    const radius = 80;

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      dotPositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      dotPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      dotPositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMaterial = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 2,
      transparent: true,
      opacity: 0.75,
    });
    const pointsMesh = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(pointsMesh);

    // 4. Wireframe Sphere Overlay
    const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1f2e4f,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireSphere = new THREE.Mesh(sphereGeo, wireMat);
    globeGroup.add(wireSphere);

    // 5. Threat Node Markers
    const targetLocations = [
      { name: 'Denver, CO (Target Origin)', pos: new THREE.Vector3(45, 30, 60), color: 0x10b981 },
      { name: 'Las Vegas, NV (Conference In-Flight Target)', pos: new THREE.Vector3(30, 20, 70), color: 0xef4444 },
      { name: 'Singapore (Titan Marine Gateway)', pos: new THREE.Vector3(-60, 5, -50), color: 0xf59e0b },
      { name: 'Austin, TX (University AI Lab Cluster)', pos: new THREE.Vector3(50, 10, 55), color: 0x8b5cf6 },
    ];

    targetLocations.forEach((loc) => {
      const beaconGeo = new THREE.SphereGeometry(3, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: loc.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(loc.pos.clone().normalize().multiplyScalar(radius + 1));
      globeGroup.add(beaconMesh);
    });

    // 6. Curved Attack Arc between Denver and Vegas
    const p1 = targetLocations[0].pos.clone().normalize().multiplyScalar(radius);
    const p2 = targetLocations[1].pos.clone().normalize().multiplyScalar(radius);
    const midPoint = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(radius + 35);

    const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
    const arcPoints = curve.getPoints(50);
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const arcLine = new THREE.Line(arcGeometry, arcMaterial);
    globeGroup.add(arcLine);

    // 7. Mouse Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        globeGroup.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-4">
      <div className="cyber-panel rounded-2xl p-6 border border-cyber-border">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cyber-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyber-cyan uppercase tracking-wider">
              <Globe className="w-4 h-4 text-cyber-cyan animate-spin" />
              TOWER 5 (#38): THREE.JS SPATIAL CYBER THREAT LATTICE
            </div>
            <h3 className="text-base font-bold font-mono text-white mt-1">
              Global OSINT Vector Mapping & Physical Geolocation Ingress
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyber-emerald animate-pulse" />
            <span>Interactive 3D View (Drag to rotate)</span>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div className="relative w-full h-[480px] rounded-xl bg-cyber-darkest border border-cyber-border overflow-hidden">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Overlaid Telemetry Cards */}
          <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border backdrop-blur-md max-w-xs text-xs font-mono pointer-events-none">
            <div className="text-[10px] text-cyber-cyan uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyber-cyan" /> Monitored Coordinates
            </div>
            <div className="text-white font-semibold">{activeNode}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active Ingress: <span className="text-cyber-crimson">Spear-phishing payload routed via Denver ✈️ Las Vegas</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-cyber-surface/90 border border-cyber-border backdrop-blur-md text-[11px] font-mono text-slate-400 pointer-events-none flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald" /> Primary VPC
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-crimson" /> Active Phishing Vector
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber" /> Offshore Gateway
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
