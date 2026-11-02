import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Lesson, InteractiveLabel } from '../../types';
import { buildSubjectModel, DynamicMeshItem } from './subject3DBuilder';
import { SceneControlPanel, SceneRenderSettings } from './SceneControlPanel';
import { ScientificDiagramView } from './ScientificDiagramView';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  Camera,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Compass,
  Sliders,
  Grid,
} from 'lucide-react';

interface Classroom3DSceneProps {
  lesson: Lesson;
  activeLabel: InteractiveLabel | null;
  onSelectLabel: (label: InteractiveLabel) => void;
  onAskTutorAboutLabel: (label: InteractiveLabel) => void;
  isPlayingNarration: boolean;
  onToggleNarration: () => void;
}

export const Classroom3DScene: React.FC<Classroom3DSceneProps> = ({
  lesson,
  activeLabel,
  onSelectLabel,
  onAskTutorAboutLabel,
  isPlayingNarration,
  onToggleNarration,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoFeedRef = useRef<HTMLVideoElement>(null);

  // View mode: '3d' | '2d' | 'ar'
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'ar'>('3d');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'default' | 'top' | 'cross' | 'close'>('default');

  // 3D Scene Shading & Optics Control Panel state
  const [showControlPanel, setShowControlPanel] = useState<boolean>(false);
  const [renderSettings, setRenderSettings] = useState<SceneRenderSettings>({
    ambientOcclusion: true,
    aoIntensity: 0.8,
    lightingIntensity: 1.0,
    renderMode: 'solid',
  });

  // AR state & hardware checks
  const [arStatus, setArStatus] = useState<{
    supported: boolean;
    active: boolean;
    error?: string;
  }>({ supported: true, active: false });

  // Scene references for updates without recreation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const particleSystemsRef = useRef<THREE.Points[]>([]);
  const dynamicMeshesRef = useRef<{ mesh: THREE.Mesh; update: (t: number, dt: number) => void }[]>([]);

  // Lighting & Material Refs for dynamic shader updates
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunKeyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillBlueLightRef = useRef<THREE.DirectionalLight | null>(null);
  const groundPlaneRef = useRef<THREE.Mesh | null>(null);

  // Camera target interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.5, 7.5));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));

  // Mouse interaction state for manual orbit/zoom
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 8.5,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Track active label reference for 3D pins highlight
  const activeLabelRef = useRef<InteractiveLabel | null>(activeLabel);
  useEffect(() => {
    activeLabelRef.current = activeLabel;
    if (activeLabel && activeLabel.cameraPosition && cameraRef.current) {
      targetCamPosRef.current.set(...activeLabel.cameraPosition);
      targetLookAtRef.current.set(...activeLabel.position);
    }
  }, [activeLabel]);

  // Dynamic Shader & Shading Settings Updater (Live without canvas re-creation)
  useEffect(() => {
    // 1. Update Lighting Intensity
    const lightMult = renderSettings.lightingIntensity;
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.7 * lightMult;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.6 * lightMult;
      // Ambient Occlusion: adjust ground contrast color
      if (renderSettings.ambientOcclusion) {
        hemiLightRef.current.groundColor.setHex(0x0a101f);
      } else {
        hemiLightRef.current.groundColor.setHex(0x475569);
      }
    }
    if (sunKeyLightRef.current) {
      sunKeyLightRef.current.intensity = 2.2 * lightMult;
      sunKeyLightRef.current.castShadow = renderSettings.ambientOcclusion;
    }
    if (fillBlueLightRef.current) {
      fillBlueLightRef.current.intensity = 0.9 * lightMult;
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure =
        1.15 * Math.min(1.4, Math.max(0.7, 0.8 + 0.3 * lightMult));
      rendererRef.current.shadowMap.enabled = renderSettings.ambientOcclusion;
    }

    // 2. Ambient Occlusion Ground Contact Shadow
    if (groundPlaneRef.current && groundPlaneRef.current.material) {
      const mat = groundPlaneRef.current.material as THREE.MeshStandardMaterial;
      if (renderSettings.ambientOcclusion) {
        mat.opacity = 0.85 * renderSettings.aoIntensity;
        mat.visible = true;
      } else {
        mat.opacity = 0.0;
        mat.visible = false;
      }
      mat.needsUpdate = true;
    }

    // 3. Render Mode (Solid vs Wireframe vs Hybrid)
    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat && 'wireframe' in mat) {
              if (renderSettings.renderMode === 'wireframe') {
                mat.wireframe = true;
                mat.transparent = false;
                mat.opacity = 1.0;
              } else if (renderSettings.renderMode === 'hybrid') {
                mat.wireframe = true;
                mat.transparent = true;
                mat.opacity = 0.85;
              } else {
                // solid mode
                mat.wireframe = false;
                // Preserve transparency for water / fluids
                if (mesh.name === 'water' || mesh.name === 'lake') {
                  mat.transparent = true;
                  mat.opacity = 0.85;
                }
              }
              mat.needsUpdate = true;
            }
          });
        }
      });
    }
  }, [renderSettings]);

  // Handle AR camera stream activation
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (viewMode === 'ar') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoFeedRef.current) {
              videoFeedRef.current.srcObject = s;
              videoFeedRef.current.play();
            }
            setArStatus({ supported: true, active: true });
          })
          .catch((err) => {
            console.warn('AR camera access not granted:', err);
            setArStatus({
              supported: false,
              active: false,
              error: 'Camera permission denied or camera unavailable. Rendering in 3D AR simulator mode.',
            });
          });
      } else {
        setArStatus({
          supported: false,
          active: false,
          error: 'WebXR/Camera API not supported on this browser. Displaying 3D AR spatial simulator.',
        });
      }
    } else {
      if (videoFeedRef.current && videoFeedRef.current.srcObject) {
        const tracks = (videoFeedRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoFeedRef.current.srcObject = null;
      }
      setArStatus((prev) => ({ ...prev, active: false }));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [viewMode]);

  // Build and mount Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = viewMode === 'ar' ? null : new THREE.Color(0x0b1120);
    if (viewMode !== 'ar') {
      scene.fog = new THREE.FogExp2(0x0b1120, 0.045);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 3.8, 8.5);
    targetCamPosRef.current.set(0, 3.8, 8.5);

    // 2. Renderer with strict Three.js skill PBR setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: viewMode === 'ar',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl && renderSettings.ambientOcclusion;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7 * renderSettings.lightingIntensity);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      0x93c5fd,
      renderSettings.ambientOcclusion ? 0x0a101f : 0x475569,
      0.6 * renderSettings.lightingIntensity
    );
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.2 * renderSettings.lightingIntensity);
    sunKeyLightRef.current = sunKeyLight;
    sunKeyLight.position.set(6, 12, 6);
    if (!isSoftwareGl && renderSettings.ambientOcclusion) {
      sunKeyLight.castShadow = true;
      sunKeyLight.shadow.mapSize.width = 1024;
      sunKeyLight.shadow.mapSize.height = 1024;
      sunKeyLight.shadow.camera.near = 0.5;
      sunKeyLight.shadow.camera.far = 30;
      sunKeyLight.shadow.bias = -0.0005;
    }
    scene.add(sunKeyLight);

    const fillBlueLight = new THREE.DirectionalLight(0x38bdf8, 0.9 * renderSettings.lightingIntensity);
    fillBlueLightRef.current = fillBlueLight;
    fillBlueLight.position.set(-8, 6, -4);
    scene.add(fillBlueLight);

    // 5. Construct 3D Educational Subject Group (Composite 3-12 Part Mesh)
    const subjectGroup = new THREE.Group();
    modelGroupRef.current = subjectGroup;
    scene.add(subjectGroup);

    particleSystemsRef.current = [];
    dynamicMeshesRef.current = [];

    buildSubjectModel(lesson.sceneType, subjectGroup, dynamicMeshesRef, particleSystemsRef, isSoftwareGl);

    // Apply active render mode (wireframe/solid) right away
    if (renderSettings.renderMode !== 'solid') {
      subjectGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat && 'wireframe' in mat) {
              mat.wireframe = true;
              mat.needsUpdate = true;
            }
          });
        }
      });
    }

    // 6. Ground plane shadow contact (Ambient Occlusion Grounding)
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = viewMode === 'ar'
      ? new THREE.ShadowMaterial({ opacity: 0.45 })
      : new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.9,
          metalness: 0.1,
          transparent: true,
          opacity: renderSettings.ambientOcclusion ? 0.85 * renderSettings.aoIntensity : 0.0,
          visible: renderSettings.ambientOcclusion,
        });
    const groundPlane = new THREE.Mesh(shadowGeo, shadowMat);
    groundPlaneRef.current = groundPlane;
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.02;
    groundPlane.receiveShadow = !isSoftwareGl && renderSettings.ambientOcclusion;
    scene.add(groundPlane);

    // 7. Raycasting for label pin click detection
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(subjectGroup.children, true);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        // Find closest label to clicked point
        let closestLabel: InteractiveLabel | null = null;
        let minDist = 3.5;

        for (const lbl of lesson.labels) {
          const lblVec = new THREE.Vector3(...lbl.position);
          const dist = hitPoint.distanceTo(lblVec);
          if (dist < minDist) {
            minDist = dist;
            closestLabel = lbl;
          }
        }

        if (closestLabel) {
          onSelectLabel(closestLabel);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Orbit drag controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosRef.current.x;
      const deltaY = e.clientY - previousMousePosRef.current.y;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };

      orbitSphericalRef.current.theta -= deltaX * 0.008;
      orbitSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, orbitSphericalRef.current.phi - deltaY * 0.008)
      );

      const { radius, theta, phi } = orbitSphericalRef.current;
      targetCamPosRef.current.x = radius * Math.sin(phi) * Math.sin(theta);
      targetCamPosRef.current.y = radius * Math.cos(phi);
      targetCamPosRef.current.z = radius * Math.sin(phi) * Math.cos(theta);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitSphericalRef.current.radius = Math.max(
        3.0,
        Math.min(14.0, orbitSphericalRef.current.radius + e.deltaY * 0.005)
      );
      const { radius, theta, phi } = orbitSphericalRef.current;
      targetCamPosRef.current.x = radius * Math.sin(phi) * Math.sin(theta);
      targetCamPosRef.current.y = radius * Math.cos(phi);
      targetCamPosRef.current.z = radius * Math.sin(phi) * Math.cos(theta);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Render & Animation Loop with Exponential Damping
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera smooth damping
      camera.position.lerp(targetCamPosRef.current, 0.08);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
      camera.lookAt(currentLookAtRef.current);

      // Model animation ticks
      if (isAnimationPlaying) {
        const effectiveDelta = delta * animSpeed;
        const effectiveTime = elapsed * animSpeed;

        for (const item of dynamicMeshesRef.current) {
          item.update(effectiveTime, effectiveDelta);
        }

        for (const ps of particleSystemsRef.current) {
          const positions = ps.geometry.attributes.position.array as Float32Array;
          const count = positions.length / 3;

          // Animate particles based on type
          if (ps.name === 'evaporation') {
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] += 0.035 * animSpeed;
              if (positions[i * 3 + 1] > 3.8) {
                positions[i * 3 + 1] = 0.4 + Math.random() * 0.2;
              }
            }
            ps.geometry.attributes.position.needsUpdate = true;
          } else if (ps.name === 'rain') {
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] -= 0.09 * animSpeed;
              if (positions[i * 3 + 1] < 0.2) {
                positions[i * 3 + 1] = 3.6 + Math.random() * 0.4;
              }
            }
            ps.geometry.attributes.position.needsUpdate = true;
          } else if (ps.name === 'electrons') {
            for (let i = 0; i < count; i++) {
              positions[i * 3] += Math.sin(elapsed * 2 + i) * 0.01;
            }
            ps.geometry.attributes.position.needsUpdate = true;
          }
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Cleanup on unmount or scene change
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [lesson.id, viewMode, isAnimationPlaying, animSpeed]);

  // Preset camera transitions
  const applyCameraPreset = (preset: 'default' | 'top' | 'cross' | 'close') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;

    if (preset === 'default') {
      targetCamPosRef.current.set(0, 3.8, 8.5);
      targetLookAtRef.current.set(0, 0.5, 0);
      orbitSphericalRef.current = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (preset === 'top') {
      targetCamPosRef.current.set(0, 9.5, 0.5);
      targetLookAtRef.current.set(0, 0, 0);
      orbitSphericalRef.current = { radius: 9.5, theta: 0, phi: 0.1 };
    } else if (preset === 'cross') {
      targetCamPosRef.current.set(7.5, 1.8, 0);
      targetLookAtRef.current.set(0, 1.0, 0);
      orbitSphericalRef.current = { radius: 7.5, theta: Math.PI / 2, phi: Math.PI / 2.5 };
    } else if (preset === 'close') {
      if (activeLabel) {
        targetCamPosRef.current.set(
          activeLabel.position[0] + 1.5,
          activeLabel.position[1] + 1.2,
          activeLabel.position[2] + 2.0
        );
        targetLookAtRef.current.set(...activeLabel.position);
      } else {
        targetCamPosRef.current.set(0, 2.0, 4.5);
        targetLookAtRef.current.set(0, 0.8, 0);
      }
    }
  };

  const handleResetCamera = () => {
    applyCameraPreset('default');
  };

  const toggleFullscreen = () => {
    if (!mountRef.current?.parentElement) return;
    if (!document.fullscreenElement) {
      mountRef.current.parentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full h-full flex-1 relative ${viewMode === '2d' ? 'hidden' : 'block'}`}
      />

      {/* AR Background Video Feed */}
      {viewMode === 'ar' && (
        <video
          ref={videoFeedRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}

      {/* AR Diagnostics / Placement Guide Overlay */}
      {viewMode === 'ar' && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col items-center">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 text-cyan-200 text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 max-w-md text-center">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {arStatus.active
                ? 'Camera pass-through active. 3D model anchored in your physical space. Move your device to inspect.'
                : arStatus.error || 'Initializing WebAR spatial camera...'}
            </span>
          </div>
        </div>
      )}

      {/* 2D Scientific Diagram View for All Models */}
      {viewMode === '2d' && (
        <ScientificDiagramView
          lesson={lesson}
          activeLabel={activeLabel}
          onSelectLabel={onSelectLabel}
          onSwitchTo3D={() => setViewMode('3d')}
          isPlayingNarration={isPlayingNarration}
        />
      )}

      {/* Interactive 3D Floating Badges & Labels Overlay */}
      {showLabels && viewMode === '3d' && (
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 max-w-xl pointer-events-auto">
          {lesson.labels.map((lbl) => {
            const isSelected = activeLabel?.id === lbl.id;
            return (
              <button
                key={lbl.id}
                onClick={() => onSelectLabel(lbl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all backdrop-blur-md shadow-md flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-blue-500/25'
                    : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lbl.accentColor }} />
                <span>{lbl.name}</span>
                {isSelected && <Sparkles className="w-3 h-3 text-amber-300" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Label Insight Card */}
      {activeLabel && viewMode !== '2d' && (
        <div className="absolute top-16 left-4 z-20 max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeLabel.accentColor }} />
              <h4 className="text-sm font-bold text-white">{activeLabel.name}</h4>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {activeLabel.category}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
            {activeLabel.detailedExplanation}
          </p>

          {activeLabel.scienceFormula && (
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-300 mb-3">
              {activeLabel.scienceFormula}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskTutorAboutLabel(activeLabel)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI Tutor About This
            </button>
          </div>
        </div>
      )}

      {/* FLOATING 3D SHADING & OPTICS CONTROL PANEL (Mounted above the bottom dock) */}
      {showControlPanel && viewMode === '3d' && (
        <div className="absolute bottom-20 right-4 sm:right-10 z-40">
          <SceneControlPanel
            settings={renderSettings}
            onChangeSettings={(newS) => setRenderSettings((prev) => ({ ...prev, ...newS }))}
            onReset={() =>
              setRenderSettings({
                ambientOcclusion: true,
                aoIntensity: 0.8,
                lightingIntensity: 1.0,
                renderMode: 'solid',
              })
            }
            onClose={() => setShowControlPanel(false)}
          />
        </div>
      )}

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 w-[94%] max-w-[890px]"
        style={{
          transform: isHudCollapsed ? 'translate(-50%, calc(100% - 24px))' : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Expand Toggle Button Pinned to Top Edge */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
            className="px-4 py-1 rounded-t-xl bg-slate-900/90 backdrop-blur-md border border-b-0 border-slate-700 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 shadow-lg"
          >
            {isHudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Collapse HUD</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2">
          {/* Mode Selector (3D / 2D / AR) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Model
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Diagram
            </button>
            <button
              onClick={() => setViewMode('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === 'ar'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              AR View
            </button>
          </div>

          {/* 3D Shading Control Panel Button (AO, Lighting, Wireframe) */}
          {viewMode === '3d' && (
            <button
              onClick={() => setShowControlPanel(!showControlPanel)}
              title="Toggle 3D Shading & Optics Control Panel (Ambient Occlusion, Wireframe, Lighting)"
              className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showControlPanel ||
                renderSettings.renderMode !== 'solid' ||
                !renderSettings.ambientOcclusion ||
                renderSettings.lightingIntensity !== 1.0
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Shading Controls</span>
              {renderSettings.renderMode === 'wireframe' && (
                <span className="text-[9px] bg-blue-700 text-white px-1 py-0.5 rounded uppercase font-mono font-bold">
                  Wireframe
                </span>
              )}
            </button>
          )}

          {/* Camera Angles */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => applyCameraPreset('default')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                cameraPreset === 'default' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Orbit
            </button>
            <button
              onClick={() => applyCameraPreset('top')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                cameraPreset === 'top' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top-Down
            </button>
            <button
              onClick={() => applyCameraPreset('cross')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium ${
                cameraPreset === 'cross' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side Cutaway
            </button>
            <button
              onClick={handleResetCamera}
              title="Reset Camera View"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Animation Playback & Speed */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              title={isAnimationPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isAnimationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-0.5">
              {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                    animSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Labels, Narration, Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowLabels(!showLabels)}
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showLabels
                  ? 'bg-slate-800 border-slate-700 text-blue-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
              }`}
            >
              {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onToggleNarration}
              title={isPlayingNarration ? 'Mute Teacher Narration' : 'Enable Narration'}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isPlayingNarration
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
              }`}
            >
              {isPlayingNarration ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
