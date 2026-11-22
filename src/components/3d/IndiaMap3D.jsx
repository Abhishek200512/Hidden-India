import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DESTINATIONS } from '../../data/destinations';
import { INDIA_BOUNDARY } from '../../data/indiaBoundary';
import { fetchLiveDestinationWeather } from '../../services/weatherService';
import { Compass, Sparkles, Maximize2, RotateCcw, MapPin, ArrowRight, Heart, CloudSun, Wind, Droplets, RefreshCw } from 'lucide-react';

export default function IndiaMap3D({ onSelectDestination, onToggleWishlist, wishlist = [] }) {
  const mountRef = useRef(null);
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [hoveredDest, setHoveredDest] = useState(null);
  const [atmosphere, setAtmosphere] = useState('midnight'); // 'midnight' | 'golden' | 'emerald'
  const [isRotating, setIsRotating] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch live weather telemetry whenever selected destination changes
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      if (!selectedDest) return;
      setIsLoadingWeather(true);
      try {
        const data = await fetchLiveDestinationWeather(
          selectedDest.coordinates.lat,
          selectedDest.coordinates.lng
        );
        if (isMounted) {
          setWeatherData(data);
          setIsLoadingWeather(false);
        }
      } catch {
        if (isMounted) setIsLoadingWeather(false);
      }
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [selectedDest]);

  const handleManualWeatherRefresh = async () => {
    if (!selectedDest || isLoadingWeather) return;
    setIsLoadingWeather(true);
    const data = await fetchLiveDestinationWeather(
      selectedDest.coordinates.lat,
      selectedDest.coordinates.lng,
      true
    );
    setWeatherData(data);
    setIsLoadingWeather(false);
  };

  // Scene references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const markersRef = useRef([]);
  const pulseRingsRef = useRef([]);
  const arcsGroupRef = useRef(null);
  const terrainMeshRef = useRef(null);
  const lightsRef = useRef({});
  const animationFrameRef = useRef(null);
  const targetCamPosRef = useRef(null);
  const targetLookAtRef = useRef(null);

  // Convert real WGS84 lat/lng to 3D Map coordinates
  // Geographic center of India is approx Lat 22.75° N, Lng 82.75° E
  // Lat span: 8.0° to 37.5° (~29.5 deg). Lng span: 68.0° to 97.5° (~29.5 deg).
  // At 22.75° N, 1 deg longitude = cos(22.75°) * 111 km ≈ 102.3 km.
  // 1 deg latitude = 111 km. Ratio is ~0.922.
  // Thus X span = 29.5 units, Z span = 32.0 units (correct geographic aspect ratio).
  const geoTo3D = (lat, lng) => {
    const x = ((lng - 82.75) / 29.5) * 29.5;
    const z = -((lat - 22.75) / 29.5) * 32.0;

    // Approximate topographic relief elevation:
    let y = 0.32;
    if (lat > 29) y += (lat - 29) * 0.12; // Greater Himalayas & Ladakh
    if (lng > 89 && lat > 23) y += 0.42;  // Northeast hills
    if (lng < 77 && lat < 21 && lat > 10) y += 0.32; // Western Ghats

    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x06090e, 0.015);

    const width = currentMount.clientWidth || 800;
    const height = currentMount.clientHeight || 650;

    // Camera with responsive framing
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );

    // Initial camera position tailored to viewport width
    if (width < 640) {
      camera.position.set(0, 32, 22);
      camera.fov = 48;
    } else if (width < 1024) {
      camera.position.set(0, 28, 20);
      camera.fov = 45;
    } else {
      camera.position.set(0, 24, 18);
      camera.fov = 45;
    }
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 55;
    controls.minDistance = 6;
    controls.maxPolarAngle = Math.PI / 2 - 0.08; // Prevent camera from flipping below horizon
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.45;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2638, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffecd0, 2.2);
    dirLight.position.set(22, 42, 22);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xd4af37, 3.8, 65);
    goldPointLight.position.set(0, 9, 0);
    scene.add(goldPointLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-25, 22, -25);
    scene.add(rimLight);

    lightsRef.current = { ambientLight, dirLight, goldPointLight, rimLight };

    // Starfield Background
    const starCount = 1100;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 160;
      starPositions[i + 1] = Math.random() * 80 + 4;
      starPositions[i + 2] = (Math.random() - 0.5) * 160;

      const isGold = Math.random() > 0.65;
      starColors[i] = isGold ? 1.0 : 0.85;
      starColors[i + 1] = isGold ? 0.86 : 0.9;
      starColors[i + 2] = isGold ? 0.45 : 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // High-Fidelity 3D Extruded India Subcontinent Landmass
    // Using official 423-point WGS84 geographic boundary
    const shape = new THREE.Shape();
    INDIA_BOUNDARY.forEach((pt, idx) => {
      const pos3d = geoTo3D(pt[0], pt[1]);
      if (idx === 0) {
        shape.moveTo(pos3d.x, pos3d.z);
      } else {
        shape.lineTo(pos3d.x, pos3d.z);
      }
    });
    shape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 1.0,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.22,
      bevelSegments: 3
    };

    const terrainGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate to lie flat on XZ plane where -Z is North and +Z is South
    terrainGeometry.rotateX(Math.PI / 2);

    // Apply elevation relief gradient on the top surface
    const posAttr = terrainGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      if (vy > 0.1) {
        let elevation = 0;
        // Northern Himalayan crest (vz < -5)
        if (vz < -5) {
          elevation += Math.abs(vz + 5) * 0.14 + Math.sin(vx * 0.7) * 0.25;
        }
        // Western Ghats ridge (vx < -3, -5 < vz < 10)
        if (vx < -3 && vz > -5 && vz < 10) {
          elevation += Math.sin(vz * 0.6) * 0.28 + 0.2;
        }
        // Northeast hill tract (vx > 7, vz < 2)
        if (vx > 7 && vz < 2) {
          elevation += 0.32 + Math.cos(vz) * 0.15;
        }
        posAttr.setY(i, vy + elevation);
      }
    }
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1824,
      roughness: 0.42,
      metalness: 0.58,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = -0.3;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Glowing India Outer Geographic Border Outline
    const linePoints = [];
    INDIA_BOUNDARY.forEach((pt) => {
      const pos = geoTo3D(pt[0], pt[1]);
      linePoints.push(new THREE.Vector3(pos.x, 0.34, pos.z));
    });
    linePoints.push(linePoints[0]); // close loop

    const borderGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const borderMat = new THREE.LineBasicMaterial({
      color: 0xd4af37,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    const borderLine = new THREE.Line(borderGeo, borderMat);
    scene.add(borderLine);

    // Concentric coordinate grid ring under India
    const gridHelper = new THREE.PolarGridHelper(24, 16, 8, 64, 0x1f2937, 0x0f172a);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // Decorative Compass Rose on Canvas Floor
    const compassGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(20, 20.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, transparent: true, opacity: 0.28 });
    const compassRing = new THREE.Mesh(ringGeo, ringMat);
    compassRing.rotateX(Math.PI / 2);
    compassRing.position.y = -1.1;
    compassGroup.add(compassRing);
    scene.add(compassGroup);

    // Refined, Non-Oversized 3D Destination Markers & Click Targets
    const markers = [];
    const pulseRings = [];

    DESTINATIONS.forEach((dest) => {
      const pos = geoTo3D(dest.coordinates.lat, dest.coordinates.lng);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.userData = dest;

      // 1. Sleek Vertical Glowing Beacon Needle
      const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 8);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        emissive: 0xd4af37,
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.88,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 0.55;
      markerGroup.add(pillar);

      // 2. Refined Floating Jewel at top of beacon
      const diamondGeo = new THREE.OctahedronGeometry(0.24, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xfff0b3,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.9,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 1.35;
      diamond.castShadow = true;
      markerGroup.add(diamond);

      // 3. Ground Pulsing Beacon Ring
      const ringGeo = new THREE.RingGeometry(0.2, 0.32, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const groundRing = new THREE.Mesh(ringGeo, ringMat);
      groundRing.rotateX(Math.PI / 2);
      groundRing.position.y = 0.04;
      markerGroup.add(groundRing);
      pulseRings.push(groundRing);

      // 4. Large Invisible Raycasting Sphere for effortless clicking/tapping
      const hitGeo = new THREE.SphereGeometry(1.0, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.position.y = 0.8;
      markerGroup.add(hitSphere);

      scene.add(markerGroup);
      markers.push(markerGroup);
    });

    markersRef.current = markers;
    pulseRingsRef.current = pulseRings;

    // Flight Arcs connecting selected destinations across India
    const arcsGroup = new THREE.Group();
    const arcPairs = [
      ['gurez-valley', 'spiti-valley'],
      ['spiti-valley', 'tirthan-valley'],
      ['tirthan-valley', 'orchha'],
      ['orchha', 'gandikota'],
      ['gandikota', 'chettinad'],
      ['orchha', 'sandakphu'],
      ['sandakphu', 'ziro-valley'],
      ['ziro-valley', 'majuli-island'],
      ['majuli-island', 'dzukou-valley'],
      ['dzukou-valley', 'mawlynnong-bridges'],
      ['orchha', 'lonar-crater'],
      ['lonar-crater', 'gandikota'],
    ];

    arcPairs.forEach(([idA, idB]) => {
      const destA = DESTINATIONS.find(d => d.id === idA);
      const destB = DESTINATIONS.find(d => d.id === idB);
      if (!destA || !destB) return;

      const posA = geoTo3D(destA.coordinates.lat, destA.coordinates.lng);
      const posB = geoTo3D(destB.coordinates.lat, destB.coordinates.lng);

      const midPoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      const distance = posA.distanceTo(posB);
      midPoint.y += Math.min(distance * 0.35, 4.2);

      const curve = new THREE.QuadraticBezierCurve3(posA, midPoint, posB);
      const points = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineDashedMaterial({
        color: 0xd4af37,
        dashSize: 0.35,
        gapSize: 0.25,
        transparent: true,
        opacity: 0.32,
        linewidth: 1.5,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLine.computeLineDistances();
      arcsGroup.add(arcLine);
    });

    scene.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    // Raycasting for interactive marker clicks & hovers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers, true);

      if (intersects.length > 0) {
        let rootGroup = intersects[0].object;
        while (rootGroup.parent && !rootGroup.userData.id) {
          rootGroup = rootGroup.parent;
        }

        if (rootGroup.userData && rootGroup.userData.id) {
          const dest = rootGroup.userData;
          focusDestination(dest);
          // Directly open the destination modal as requested by user
          if (onSelectDestination) {
            onSelectDestination(dest);
          }
        }
      }
    };

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers, true);

      if (intersects.length > 0) {
        let rootGroup = intersects[0].object;
        while (rootGroup.parent && !rootGroup.userData.id) {
          rootGroup = rootGroup.parent;
        }
        if (rootGroup.userData && rootGroup.userData.id) {
          setHoveredDest(rootGroup.userData);
          currentMount.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredDest(null);
      currentMount.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Responsive Resize Handler with viewport aspect compensation
    const handleResize = () => {
      if (!currentMount || !renderer || !camera) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;

      if (w < 640) {
        camera.fov = 48;
      } else {
        camera.fov = 45;
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Controls update
      controls.update();

      // Subtle hover animation on diamond jewels
      markers.forEach((m, idx) => {
        const diamond = m.children[1];
        if (diamond) {
          diamond.position.y = 1.35 + Math.sin(elapsedTime * 2.5 + idx) * 0.12;
          diamond.rotation.y = elapsedTime * 1.1 + idx;
        }
      });

      // Pulsing beacon ground rings
      pulseRings.forEach((ring, idx) => {
        const pulse = (Math.sin(elapsedTime * 3.0 + idx) + 1) / 2;
        ring.scale.set(1 + pulse * 0.65, 1 + pulse * 0.65, 1);
        ring.material.opacity = 0.88 - pulse * 0.55;
      });

      // Smooth Camera Lerping if focusing a destination
      if (targetCamPosRef.current && targetLookAtRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.05);
        controls.target.lerp(targetLookAtRef.current, 0.05);

        if (camera.position.distanceTo(targetCamPosRef.current) < 0.2) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      }
      if (controls) {
        controls.dispose();
      }
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update atmosphere lighting presets
  useEffect(() => {
    if (!lightsRef.current.ambientLight || !terrainMeshRef.current) return;
    const { ambientLight, dirLight, goldPointLight, rimLight } = lightsRef.current;

    if (atmosphere === 'midnight') {
      ambientLight.color.setHex(0x1a2638);
      ambientLight.intensity = 1.3;
      dirLight.color.setHex(0xffecd0);
      dirLight.intensity = 2.0;
      goldPointLight.color.setHex(0xd4af37);
      goldPointLight.intensity = 3.6;
      rimLight.color.setHex(0x38bdf8);
      terrainMeshRef.current.material.color.setHex(0x0c141f);
    } else if (atmosphere === 'golden') {
      ambientLight.color.setHex(0x452511);
      ambientLight.intensity = 1.6;
      dirLight.color.setHex(0xfbbf24);
      dirLight.intensity = 2.8;
      goldPointLight.color.setHex(0xff7828);
      goldPointLight.intensity = 5.0;
      rimLight.color.setHex(0xf59e0b);
      terrainMeshRef.current.material.color.setHex(0x22130c);
    } else if (atmosphere === 'emerald') {
      ambientLight.color.setHex(0x064e3b);
      ambientLight.intensity = 1.5;
      dirLight.color.setHex(0x34d399);
      dirLight.intensity = 2.2;
      goldPointLight.color.setHex(0x10b981);
      goldPointLight.intensity = 4.0;
      rimLight.color.setHex(0x06b6d4);
      terrainMeshRef.current.material.color.setHex(0x041f18);
    }
  }, [atmosphere]);

  // Update controls auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Smooth camera focus to specific destination
  const focusDestination = (dest) => {
    setSelectedDest(dest);
    setIsRotating(false);

    const pos = geoTo3D(dest.coordinates.lat, dest.coordinates.lng);
    targetCamPosRef.current = new THREE.Vector3(pos.x + 3.0, pos.y + 5.5, pos.z + 7.5);
    targetLookAtRef.current = new THREE.Vector3(pos.x, pos.y + 1.0, pos.z);
  };

  // Reset to full overhead view
  const resetCamera = () => {
    const isMobile = window.innerWidth < 640;
    targetCamPosRef.current = new THREE.Vector3(0, isMobile ? 32 : 24, isMobile ? 22 : 18);
    targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    setIsRotating(true);
  };

  // Preset regional sector viewpoints
  const focusRegion = (region) => {
    setIsRotating(false);
    if (region === 'North') {
      targetCamPosRef.current = new THREE.Vector3(-2, 15, -3);
      targetLookAtRef.current = new THREE.Vector3(-2, 1.2, -10);
    } else if (region === 'Northeast') {
      targetCamPosRef.current = new THREE.Vector3(12, 14, 0);
      targetLookAtRef.current = new THREE.Vector3(9, 1.0, -4);
    } else if (region === 'South') {
      targetCamPosRef.current = new THREE.Vector3(0, 16, 18);
      targetLookAtRef.current = new THREE.Vector3(0, 0.5, 9);
    } else if (region === 'West') {
      targetCamPosRef.current = new THREE.Vector3(-10, 15, 6);
      targetLookAtRef.current = new THREE.Vector3(-3.5, 0.8, 1);
    } else {
      resetCamera();
    }
  };

  const isSaved = wishlist.includes(selectedDest.id);

  return (
    <div className="relative w-full h-[680px] sm:h-[740px] lg:h-[820px] rounded-3xl overflow-hidden glass-panel border border-amber-500/20 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full select-none" />

      {/* Top Left: Title Badge & Atmosphere Controls */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-3 pointer-events-auto z-20 max-w-[280px] sm:max-w-md">
        <div className="glass-panel-gold px-4 py-2.5 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <span>Interactive 3D Subcontinent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              India's Unmapped Frontiers
            </p>
          </div>
        </div>

        {/* Atmosphere Presets */}
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10 w-fit">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Aura:
          </span>
          <button
            onClick={() => setAtmosphere('midnight')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              atmosphere === 'midnight'
                ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Midnight
          </button>
          <button
            onClick={() => setAtmosphere('golden')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              atmosphere === 'golden'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Golden Hour
          </button>
          <button
            onClick={() => setAtmosphere('emerald')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              atmosphere === 'emerald'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cyber Emerald
          </button>
        </div>
      </div>

      {/* Top Right: Camera Viewpoints & Auto-Rotation Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 pointer-events-auto z-20">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 backdrop-blur-md transition-all ${
            isRotating
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
          title="Toggle Auto Orbit Rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRotating ? 'Orbiting' : 'Paused'}</span>
        </button>

        <button
          onClick={resetCamera}
          className="px-3 py-2 rounded-xl text-xs font-medium border bg-black/40 border-white/10 text-slate-300 hover:bg-white/10 backdrop-blur-md transition-all flex items-center gap-1.5"
          title="Reset Camera to Overhead View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>

      {/* Regional Quick Jump Tabs */}
      <div className="absolute top-20 sm:top-24 right-4 sm:right-6 hidden sm:flex flex-col gap-1.5 pointer-events-auto z-20 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 px-2 py-0.5">
          Fly To Sector
        </span>
        {['All', 'North', 'Northeast', 'South', 'West'].map((region) => (
          <button
            key={region}
            onClick={() => focusRegion(region)}
            className="text-left text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-amber-500/20 hover:text-amber-200 transition-all flex items-center justify-between gap-3"
          >
            <span>{region === 'All' ? 'All India' : region}</span>
            <ArrowRight className="w-3 h-3 opacity-50" />
          </button>
        ))}
      </div>

      {/* Hover Tooltip when pointer is over a 3D marker */}
      {hoveredDest && (
        <div className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 left-1/2 bottom-32 bg-black/90 border border-amber-500/50 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md text-center animate-fadeIn">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{hoveredDest.name}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {hoveredDest.state} · {hoveredDest.altitude} · Click to explore dossier
          </div>
        </div>
      )}

      {/* Bottom Floating Inspector Card for Selected Destination */}
      {selectedDest && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md pointer-events-auto z-20">
          <div className="glass-panel-gold p-4 sm:p-5 rounded-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-serif-luxury text-lg font-bold text-white tracking-wide leading-tight">
                    {selectedDest.name}
                  </h4>
                  <p className="text-xs text-amber-400/90 font-medium">
                    {selectedDest.state} · {selectedDest.altitude}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleWishlist(selectedDest.id)}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
              {selectedDest.description}
            </p>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
              <div className="bg-black/40 rounded-lg p-2 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Best Season</span>
                <span className="font-semibold text-amber-200 truncate block">
                  {selectedDest.bestTime.split('(')[0]}
                </span>
              </div>
              <div className="bg-black/40 rounded-lg p-2 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Seclusion Index</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {selectedDest.seclusionIndex}% Unexplored
                </span>
              </div>
            </div>

            {/* Live Meteorological & Geospatial Telemetry */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20 mb-3 text-[11px]">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold text-[10px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Ground Telemetry
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>{weatherData?.localTime ? `${weatherData.localTime} IST` : 'Live IST'}</span>
                  <button
                    onClick={handleManualWeatherRefresh}
                    disabled={isLoadingWeather}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                    title="Refresh live telemetry"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingWeather ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
              {isLoadingWeather ? (
                <div className="flex items-center justify-center py-1 text-slate-400 text-xs gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Connecting to Open-Meteo telemetry...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-200">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">{weatherData?.temp ?? '--'}°C</span>
                      <span className="text-slate-400 text-[10px] ml-1">({weatherData?.condition || 'Analyzing...'})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-sky-400" />
                      {weatherData?.humidity ?? '--'}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-teal-400" />
                      {weatherData?.windSpeed ?? '--'} km/h
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectDestination(selectedDest)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Explore Full Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right: Interactive Markers Horizontal Carousel */}
      <div className="absolute bottom-4 right-4 hidden xl:flex items-center gap-1.5 z-20 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 max-w-sm overflow-x-auto scrollbar-none">
        {DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            onClick={() => {
              focusDestination(dest);
              if (onSelectDestination) onSelectDestination(dest);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedDest.id === dest.id
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {dest.name}
          </button>
        ))}
      </div>
    </div>
  );
}
