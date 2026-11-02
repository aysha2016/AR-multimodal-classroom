import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Lesson, InteractiveLabel, TeacherAvatarConfig } from '../../types';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';
import { TEACHER_AVATARS } from '../../data/lessons';
import { getSceneModule, SceneModule } from '../classroom/scenes/SceneRegistry';
import { SceneControlPanel, SceneRenderSettings } from '../classroom/SceneControlPanel';
import { AnimatedVideoScene } from '../classroom/AnimatedVideoScene';
import { RealisticEducatorAvatar } from '../avatar/RealisticEducatorAvatar';
import { Scene3DTooltip } from '../classroom/Scene3DTooltip';
import { ScientificDiagramView } from '../classroom/ScientificDiagramView';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus,
  Box,
  Layers,
  Sparkles,
  Camera,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Activity,
  ChevronRight,
  Info,
  SkipBack,
  SkipForward,
} from 'lucide-react';

interface PrototypeExactClassroomProps {
  lesson: Lesson;
  activeLabel: InteractiveLabel | null;
  onSelectLabel: (label: InteractiveLabel) => void;
  onAskTutorAboutLabel: (label: InteractiveLabel) => void;
  onOpenARView?: () => void;
  isPlayingNarration: boolean;
  onToggleNarration: () => void;
  currentTeacher?: TeacherAvatarConfig;
  viewMode?: ClassroomViewMode;
  onViewModeChange?: (mode: ClassroomViewMode) => void;
}

export type ClassroomViewMode = 'normal' | 'simulation' | 'diagram' | 'ar';

export const PrototypeExactClassroom: React.FC<PrototypeExactClassroomProps> = ({
  lesson,
  activeLabel,
  onSelectLabel,
  onAskTutorAboutLabel,
  onOpenARView,
  isPlayingNarration,
  onToggleNarration,
  currentTeacher = TEACHER_AVATARS[0],
  viewMode: propViewMode,
  onViewModeChange,
}) => {
  // Primary View Selector: Normal View (Default) | 3D Simulation | 2D Diagram | AR View
  const [internalViewMode, setInternalViewMode] = useState<ClassroomViewMode>('normal');
  const viewMode = propViewMode ?? internalViewMode;
  const setViewMode = (mode: ClassroomViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Active Scene Module
  const sceneModule: SceneModule = getSceneModule(lesson.id);

  // Keep ref of viewMode to optimize render loop
  const viewModeRef = useRef<ClassroomViewMode>(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // Playback & Step-by-Step Educational Stage State
  const [currentStageId, setCurrentStageId] = useState<string>('all');
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const [speechText, setSpeechText] = useState<string>(lesson.teacherInitialPrompt);

  // Inspection Tools & Shading State (for 3D Simulation View)
  const [showShadingPanel, setShowShadingPanel] = useState<boolean>(false);
  const [showScientificParams, setShowScientificParams] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'default' | 'top' | 'cross' | 'close'>('default');
  const [renderSettings, setRenderSettings] = useState<SceneRenderSettings>({
    ambientOcclusion: true,
    aoIntensity: 0.8,
    lightingIntensity: 1.0,
    renderMode: 'solid',
  });

  // Avatar Teacher Micro-kinematics State (Normal View)
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState<boolean>(false);

  // AR Camera State
  const videoFeedRef = useRef<HTMLVideoElement>(null);
  const [arStatus, setArStatus] = useState<{ supported: boolean; active: boolean; error?: string }>({
    supported: true,
    active: false,
  });

  // 3D Projected Tooltip Positions & Interactive Hover/Expand States (Hidden by default to prevent congestion)
  const [show3DLabels, setShow3DLabels] = useState<boolean>(false);
  const [projectedLabels, setProjectedLabels] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [hoveredLabelId, setHoveredLabelId] = useState<string | null>(null);
  const [expandedLabelId, setExpandedLabelId] = useState<string | null>(null);

  // 3D Guided Animated Video Tour State (Normal View)
  const [isVideoTourPlaying, setIsVideoTourPlaying] = useState<boolean>(true);
  const [tourTimeSeconds, setTourTimeSeconds] = useState<number>(0);
  const [tourStageIndex, setTourStageIndex] = useState<number>(0);

  // Three.js Core Refs (Preserved across viewMode changes)
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dynamicMeshesRef = useRef<{ mesh: THREE.Object3D; update: (t: number, dt: number) => void }[]>([]);
  const particleSystemsRef = useRef<THREE.Points[]>([]);

  // Lighting & Shadow Ground Refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunKeyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillBlueLightRef = useRef<THREE.DirectionalLight | null>(null);
  const groundPlaneRef = useRef<THREE.Mesh | null>(null);

  // Smooth Camera Target Interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(sceneModule.defaultCameraPos[0], sceneModule.defaultCameraPos[1], sceneModule.defaultCameraPos[2])
  );
  const targetLookAtRef = useRef<THREE.Vector3>(
    new THREE.Vector3(sceneModule.defaultTarget[0], sceneModule.defaultTarget[1], sceneModule.defaultTarget[2])
  );
  const currentLookAtRef = useRef<THREE.Vector3>(
    new THREE.Vector3(sceneModule.defaultTarget[0], sceneModule.defaultTarget[1], sceneModule.defaultTarget[2])
  );

  // Enhanced 360 Orbit Controls State (Active in 3D Simulation View)
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 8.2,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Keep speech in sync when lesson changes
  useEffect(() => {
    setSpeechText(lesson.teacherInitialPrompt);
    setCurrentStageId('all');
    targetCamPosRef.current.set(
      sceneModule.defaultCameraPos[0],
      sceneModule.defaultCameraPos[1],
      sceneModule.defaultCameraPos[2]
    );
    targetLookAtRef.current.set(
      sceneModule.defaultTarget[0],
      sceneModule.defaultTarget[1],
      sceneModule.defaultTarget[2]
    );
    currentLookAtRef.current.set(
      sceneModule.defaultTarget[0],
      sceneModule.defaultTarget[1],
      sceneModule.defaultTarget[2]
    );
  }, [lesson.id, lesson.teacherInitialPrompt]);

  // Auto-guided video tour progression for Normal View (3D Animated Video)
  useEffect(() => {
    if (viewMode !== 'normal' || !isVideoTourPlaying) return;

    const interval = setInterval(() => {
      setTourTimeSeconds((prev) => {
        const nextTime = prev + 1;
        const stageDuration = 12; // 12 seconds per chapter
        const stages = sceneModule.stages;
        if (!stages || stages.length <= 1) return nextTime;

        // Stages loop: 1, 2, ..., N (or starting after 'all' if available)
        const chapterStages = stages.filter((s) => s.id !== 'all');
        const activePool = chapterStages.length > 0 ? chapterStages : stages;
        const targetIdx = Math.floor(nextTime / stageDuration) % activePool.length;

        if (targetIdx !== tourStageIndex) {
          setTourStageIndex(targetIdx);
          const stg = activePool[targetIdx];
          if (stg) {
            setCurrentStageId(stg.id);
            targetCamPosRef.current.set(stg.cameraPosition[0], stg.cameraPosition[1], stg.cameraPosition[2]);
            targetLookAtRef.current.set(stg.cameraTarget[0], stg.cameraTarget[1], stg.cameraTarget[2]);
            setSpeechText(`${stg.name}: ${stg.description}`);
            if (isPlayingNarration) {
              avatarAudioEngine.speak(stg.description, currentTeacher.voiceName);
            }
            // Auto open matching tooltip
            const match = sceneModule.labels.find(
              (l) => l.id.toLowerCase().includes(stg.id.toLowerCase()) || stg.id.toLowerCase().includes(l.id.toLowerCase())
            );
            if (match) {
              onSelectLabel(match);
              setExpandedLabelId(match.id);
            }
          }
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [viewMode, isVideoTourPlaying, tourStageIndex, sceneModule.stages, sceneModule.labels, isPlayingNarration, currentTeacher.voiceName]);

  // Synchronize avatar kinematics & voice synthesis
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();
    let lastBlink = Date.now();

    const loop = (t: number) => {
      const elapsed = (t - startTime) / 1000;
      // Natural respiratory cycle
      setBreathPhase(Math.sin(elapsed * 1.5) * 0.5 + 0.5);

      // Spontaneous blinking
      if (Date.now() - lastBlink > 3800) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
        lastBlink = Date.now();
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    const unsubViseme = avatarAudioEngine.subscribeVisemes((v) => {
      setMouthOpen(v.jawDrop);
      setIsTeacherSpeaking(v.viseme !== 'sil');
    });

    return () => {
      cancelAnimationFrame(animId);
      unsubViseme();
    };
  }, []);

  // Update camera target when a 3D label is selected
  useEffect(() => {
    if (activeLabel && activeLabel.cameraPosition) {
      targetCamPosRef.current.set(...activeLabel.cameraPosition);
      targetLookAtRef.current.set(...activeLabel.position);
      const text = `${activeLabel.name}: ${activeLabel.shortExplanation}`;
      setSpeechText(text);
      if (isPlayingNarration) {
        avatarAudioEngine.speak(text, currentTeacher.voiceName);
      }
    }
  }, [activeLabel]);

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
            console.warn('AR camera permission denied:', err);
            setArStatus({ supported: false, active: false, error: 'Camera permission denied or camera unavailable.' });
          });
      } else {
        setArStatus({ supported: false, active: false, error: 'WebXR / Camera API not supported on this browser.' });
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
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [viewMode]);

  // Handle dynamic Shading & Render Mode updates live in scene
  useEffect(() => {
    const mult = renderSettings.lightingIntensity;
    if (ambientLightRef.current) ambientLightRef.current.intensity = 0.75 * mult;
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.65 * mult;
      hemiLightRef.current.groundColor.setHex(renderSettings.ambientOcclusion ? 0x090e1a : 0x475569);
    }
    if (sunKeyLightRef.current) {
      sunKeyLightRef.current.intensity = 2.2 * mult;
      sunKeyLightRef.current.castShadow = renderSettings.ambientOcclusion;
    }
    if (fillBlueLightRef.current) fillBlueLightRef.current.intensity = 0.9 * mult;
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = 1.15 * Math.min(1.4, Math.max(0.7, 0.8 + 0.3 * mult));
      rendererRef.current.shadowMap.enabled = renderSettings.ambientOcclusion;
    }

    // Ground plane contact shadow
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

    // Mesh render mode (Solid vs Wireframe vs Hybrid)
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
                mat.wireframe = false;
                if (mesh.name === 'water' || mesh.name === 'lake') {
                  mat.transparent = true;
                  mat.opacity = 0.9;
                }
              }
              mat.needsUpdate = true;
            }
          });
        }
      });
    }
  }, [renderSettings]);

  // Main Three.js Scene Setup (Mounted ONCE, preserved across view modes)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = viewMode === 'ar' ? null : new THREE.Color(0x0b1120);
    if (viewMode !== 'ar') {
      scene.fog = new THREE.FogExp2(0x0b1120, 0.04);
    }

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(
      sceneModule.defaultCameraPos[0],
      sceneModule.defaultCameraPos[1],
      sceneModule.defaultCameraPos[2]
    );
    targetCamPosRef.current.set(
      sceneModule.defaultCameraPos[0],
      sceneModule.defaultCameraPos[1],
      sceneModule.defaultCameraPos[2]
    );

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

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75 * renderSettings.lightingIntensity);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x090e1a, 0.65 * renderSettings.lightingIntensity);
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

    // Construct Educational Subject Group
    const subjectGroup = new THREE.Group();
    modelGroupRef.current = subjectGroup;
    scene.add(subjectGroup);

    particleSystemsRef.current = [];
    dynamicMeshesRef.current = [];

    // Build the specific topic scene
    sceneModule.build(subjectGroup, dynamicMeshesRef, particleSystemsRef, isSoftwareGl);

    // Ground plane shadow contact
    const shadowGeo = new THREE.PlaneGeometry(18, 18);
    const shadowMat = new THREE.MeshStandardMaterial({
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

    // Raycast click detection for 3D pins
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
        let closest: InteractiveLabel | null = null;
        let minDist = 3.8;

        for (const lbl of sceneModule.labels) {
          const lblVec = new THREE.Vector3(...lbl.position);
          const dist = hitPoint.distanceTo(lblVec);
          if (dist < minDist) {
            minDist = dist;
            closest = lbl;
          }
        }
        if (closest) onSelectLabel(closest);
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Enhanced Orbit Drag Interactions
    const onMouseDown = (e: MouseEvent) => {
      // In 3D Simulation View, enable enhanced drag
      isDraggingRef.current = true;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosRef.current.x;
      const deltaY = e.clientY - previousMousePosRef.current.y;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };

      orbitSphericalRef.current.theta -= deltaX * 0.007;
      orbitSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, orbitSphericalRef.current.phi - deltaY * 0.007)
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

    // Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Continuous Animation Loop
    let frameId = 0;
    let tickCount = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera exponential smooth damping
      camera.position.lerp(targetCamPosRef.current, 0.08);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);
      camera.lookAt(currentLookAtRef.current);

      if (isAnimationPlaying) {
        const effectiveDelta = delta * animSpeed;
        const effectiveTime = elapsed * animSpeed;

        for (const item of dynamicMeshesRef.current) {
          item.update(effectiveTime, effectiveDelta);
        }

        // Particle kinematics
        for (const ps of particleSystemsRef.current) {
          const positions = ps.geometry.attributes.position.array as Float32Array;
          const count = positions.length / 3;

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
          } else if (ps.name === 'transpiration') {
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] += 0.025 * animSpeed;
              if (positions[i * 3 + 1] > 3.4) {
                positions[i * 3 + 1] = 0.9 + Math.random() * 0.2;
              }
            }
            ps.geometry.attributes.position.needsUpdate = true;
          } else if (ps.name === 'blood') {
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] += Math.sin(elapsed * 3 + i) * 0.015;
            }
            ps.geometry.attributes.position.needsUpdate = true;
          } else if (ps.name === 'pyroclasts') {
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] += 0.05 * animSpeed;
              if (positions[i * 3 + 1] > 7.0) {
                positions[i * 3 + 1] = 4.0 + Math.random() * 0.3;
              }
            }
            ps.geometry.attributes.position.needsUpdate = true;
          } else if (ps.name === 'electrons') {
            for (let i = 0; i < count; i++) {
              positions[i * 3] += Math.sin(elapsed * 2 + i) * 0.008;
            }
            ps.geometry.attributes.position.needsUpdate = true;
          }
        }
      }

      // If in Normal View, pause WebGL draw calls and label projections to give full GPU to animated video
      if (viewModeRef.current === 'normal') {
        frameId = requestAnimationFrame(tick);
        return;
      }

      renderer.render(scene, camera);

      // Project 3D label world coordinates into 2D viewport coordinates for interactive tooltips
      if (container && camera) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const coords: Record<string, { x: number; y: number; visible: boolean }> = {};
          const tempV = new THREE.Vector3();
          for (const lbl of sceneModule.labels) {
            tempV.set(lbl.position[0], lbl.position[1], lbl.position[2]);
            tempV.project(camera);
            const inFront = tempV.z < 1.0;
            const screenX = ((tempV.x + 1) * rect.width) / 2;
            const screenY = ((-tempV.y + 1) * rect.height) / 2;
            coords[lbl.id] = {
              x: Math.max(32, Math.min(rect.width - 32, screenX)),
              y: Math.max(38, Math.min(rect.height - 38, screenY)),
              visible: inFront,
            };
          }
          tickCount++;
          if (tickCount % 2 === 0) {
            setProjectedLabels(coords);
          }
        }
      }

      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
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
  }, [lesson.id, sceneModule.id, isAnimationPlaying, animSpeed]);

  // Handle stage selection (Step-by-step educational stages)
  const handleSelectStage = (stage: (typeof sceneModule.stages)[0]) => {
    setCurrentStageId(stage.id);
    targetCamPosRef.current.set(stage.cameraPosition[0], stage.cameraPosition[1], stage.cameraPosition[2]);
    targetLookAtRef.current.set(stage.cameraTarget[0], stage.cameraTarget[1], stage.cameraTarget[2]);
    setSpeechText(`${stage.name}: ${stage.description}`);
    if (isPlayingNarration) {
      avatarAudioEngine.speak(stage.description, currentTeacher.voiceName);
    }
  };

  // Preset camera transitions
  const applyCameraPreset = (preset: 'default' | 'top' | 'cross' | 'close') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;

    if (preset === 'default') {
      targetCamPosRef.current.set(
        sceneModule.defaultCameraPos[0],
        sceneModule.defaultCameraPos[1],
        sceneModule.defaultCameraPos[2]
      );
      targetLookAtRef.current.set(
        sceneModule.defaultTarget[0],
        sceneModule.defaultTarget[1],
        sceneModule.defaultTarget[2]
      );
      orbitSphericalRef.current = { radius: 8.2, theta: Math.PI / 4, phi: Math.PI / 3 };
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

  const handleSpeechPlay = () => {
    avatarAudioEngine.speak(speechText, currentTeacher.voiceName);
  };

  return (
    <div className="relative w-full aspect-[16/9] max-h-[580px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 group select-none">
      {/* 1. PERSISTENT THREE.JS 3D CANVAS (Active in 3D Simulation & AR modes) */}
      <div
        ref={mountRef}
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          viewMode === 'normal' ? 'opacity-0 pointer-events-none z-0' : 'opacity-100 pointer-events-auto z-10'
        }`}
      />

      {/* 2. NORMAL VIEW: HIGH-FIDELITY ANIMATED NATURAL VIDEO */}
      {viewMode === 'normal' && (
        <div className="absolute inset-0 z-20 w-full h-full">
          <AnimatedVideoScene
            lesson={lesson}
            activeLabel={activeLabel}
            onSelectLabel={onSelectLabel}
            currentTeacher={currentTeacher}
            isPlayingNarration={isPlayingNarration}
            onToggleNarration={onToggleNarration}
            onSwitchTo3D={() => setViewMode('simulation')}
            onSwitchToDiagram={() => setViewMode('diagram')}
            onSwitchToAR={() => {
              if (onOpenARView) {
                onOpenARView();
              } else {
                setViewMode('ar');
              }
            }}
            speechText={speechText}
            onSetSpeechText={setSpeechText}
          />
        </div>
      )}

      {/* 2.5 2D SCIENTIFIC SCHEMATIC DIAGRAM VIEW */}
      {viewMode === 'diagram' && (
        <div className="absolute inset-0 z-20 w-full h-full bg-slate-950 flex flex-col">
          <div className="p-2 sm:p-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('normal')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                &larr; Back to Class Video
              </button>
              <span className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                Schematic Diagram &bull; {lesson.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('simulation')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>3D Lab</span>
              </button>
              <div className="hidden xs:flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg text-[11px] text-blue-300 border border-slate-700/60">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>Teacher: {currentTeacher.name}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full overflow-y-auto">
            <ScientificDiagramView
              lesson={lesson}
              activeLabel={activeLabel}
              onSelectLabel={onSelectLabel}
              onSwitchTo3D={() => setViewMode('simulation')}
              isPlayingNarration={isPlayingNarration}
              currentTeacher={currentTeacher}
            />
          </div>
        </div>
      )}

      {/* 3. SIMULATION & AR OVERLAYS (Only active in 3D Simulation or AR modes) */}
      {(viewMode === 'simulation' || viewMode === 'ar') && (
        <>
          {/* AR Video Feed (Only when AR View is active) */}
          {viewMode === 'ar' && (
            <video
              ref={videoFeedRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover -z-10"
            />
          )}

          {/* TOP-RIGHT VIEW SELECTOR: Normal View | 3D Simulation | 2D Diagram | AR View */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center bg-[#0f172a]/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl">
              {/* Normal View Option (Switch back to Animated Natural Video) */}
              <button
                onClick={() => {
                  setViewMode('normal');
                  applyCameraPreset('default');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Normal View</span>
              </button>

              {/* 3D Simulation Option */}
              <button
                onClick={() => {
                  setViewMode('simulation');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'simulation'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>3D Simulation</span>
              </button>

              {/* 2D Diagram Option */}
              <button
                onClick={() => setViewMode('diagram')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>2D Diagram</span>
              </button>

              {/* AR View Option */}
              <button
                onClick={() => setViewMode('ar')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'ar'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>AR View</span>
              </button>
            </div>
          </div>


          {/* Instructor Picture-in-Picture Badge in 3D Simulation Mode */}
          {viewMode === 'simulation' && (
            <div className="absolute top-20 left-4 z-20 pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 pr-3 shadow-xl">
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-blue-500 shadow-xs">
                <img src={currentTeacher.avatarImage} alt={currentTeacher.name} className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <span className="text-[11px] font-bold text-white block">{currentTeacher.name}</span>
                <span className="text-[10px] text-blue-400 font-semibold">3D Orbit Mode Active</span>
              </div>
            </div>
          )}

          {/* 3D Interactive Hotspot Tooltips (Default: HIDDEN to prevent clutter and congestion) */}
          {show3DLabels && (
            <div className="absolute inset-0 z-20 pointer-events-none animate-in fade-in duration-200">
              {sceneModule.labels.slice(0, 4).map((lbl: InteractiveLabel) => {
                const pos = projectedLabels[lbl.id] || {
                  x: 340,
                  y: 200,
                  visible: true,
                };
                const isSelected = activeLabel?.id === lbl.id || expandedLabelId === lbl.id;
                const isHovered = hoveredLabelId === lbl.id;

                return (
                  <Scene3DTooltip
                    key={lbl.id}
                    label={lbl}
                    position={pos}
                    isActive={isSelected}
                    isHovered={isHovered}
                    onSelect={() => {
                      onSelectLabel(lbl);
                      setExpandedLabelId(lbl.id);
                      const text = `${lbl.name}: ${lbl.shortExplanation}`;
                      setSpeechText(text);
                      avatarAudioEngine.triggerGesture('point', lbl.name, 4500, 'label');
                      avatarAudioEngine.speak(text, currentTeacher.voiceName);
                    }}
                    onMouseEnter={() => setHoveredLabelId(lbl.id)}
                    onMouseLeave={() => setHoveredLabelId(null)}
                    onCloseExpanded={() => setExpandedLabelId(null)}
                    onAskTutor={() => onAskTutorAboutLabel(lbl)}
                    onExplainAndPoint={() => {
                      onSelectLabel(lbl);
                      setExpandedLabelId(lbl.id);
                      const text = `${lbl.name}: ${lbl.shortExplanation}`;
                      setSpeechText(text);
                      avatarAudioEngine.triggerGesture('point', lbl.name, 4500, 'label');
                      avatarAudioEngine.speak(text, currentTeacher.voiceName);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Educational Stage Stepper (Active in 3D Simulation Mode) */}
          {viewMode === 'simulation' && (
            <div className="absolute top-20 right-4 z-20 pointer-events-auto flex items-center gap-1 bg-[#0f172a]/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl overflow-x-auto max-w-sm sm:max-w-md scrollbar-none animate-in fade-in duration-200">
              {sceneModule.stages.map((stage: any) => {
                const isActive = currentStageId === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleSelectStage(stage)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {stage.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Floating Controls Dock */}
          <div className="absolute top-32 right-4 z-20 bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col items-center gap-3 text-slate-200 shadow-xl pointer-events-auto">
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  mountRef.current?.parentElement?.requestFullscreen();
                }
              }}
              title="Fullscreen"
              className="p-1 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* 3D Hotspot Labels Toggle (Clean scene by default) */}
            <button
              onClick={() => setShow3DLabels(!show3DLabels)}
              title={show3DLabels ? 'Hide 3D Labels' : 'Show 3D Labels'}
              className={`p-1 transition-colors relative ${
                show3DLabels ? 'text-cyan-400 ring-1 ring-cyan-500/50 rounded-lg' : 'hover:text-white'
              }`}
            >
              {show3DLabels ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            </button>

            {/* 3D Shading Control Panel Toggle */}
            <button
              onClick={() => setShowShadingPanel(!showShadingPanel)}
              title="3D Shading & Topology Controls (Wireframe, AO, Lighting)"
              className={`p-1 transition-colors relative ${
                showShadingPanel || renderSettings.renderMode !== 'solid'
                  ? 'text-cyan-400 ring-1 ring-cyan-500/50 rounded-lg'
                  : 'hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Live Scientific Parameters HUD Toggle */}
            <button
              onClick={() => setShowScientificParams(!showScientificParams)}
              title="Live Scientific Parameters HUD"
              className={`p-1 transition-colors relative ${
                showScientificParams ? 'text-amber-400 ring-1 ring-amber-500/50 rounded-lg' : 'hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Camera Preset Reset */}
            <button
              onClick={() => applyCameraPreset('default')}
              title="Reset Camera Framing"
              className="p-1 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
            </button>

            <div className="w-full h-px bg-white/15 my-0.5" />

            <button
              onClick={() => {
                orbitSphericalRef.current.radius = Math.max(3.0, orbitSphericalRef.current.radius - 0.6);
                const { radius, theta, phi } = orbitSphericalRef.current;
                targetCamPosRef.current.x = radius * Math.sin(phi) * Math.sin(theta);
                targetCamPosRef.current.y = radius * Math.cos(phi);
                targetCamPosRef.current.z = radius * Math.sin(phi) * Math.cos(theta);
              }}
              title="Zoom In"
              className="p-1 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                orbitSphericalRef.current.radius = Math.min(14.0, orbitSphericalRef.current.radius + 0.6);
                const { radius, theta, phi } = orbitSphericalRef.current;
                targetCamPosRef.current.x = radius * Math.sin(phi) * Math.sin(theta);
                targetCamPosRef.current.y = radius * Math.cos(phi);
                targetCamPosRef.current.z = radius * Math.sin(phi) * Math.cos(theta);
              }}
              title="Zoom Out"
              className="p-1 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Floating 3D Shading Control Panel */}
          {showShadingPanel && (
            <div className="absolute bottom-20 right-14 z-30 pointer-events-auto">
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
                onClose={() => setShowShadingPanel(false)}
              />
            </div>
          )}

          {/* Live Scientific Parameters HUD */}
          {showScientificParams && (
            <div className="absolute top-24 left-4 sm:left-auto sm:right-16 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-100 w-80 space-y-3 pointer-events-auto animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">Scientific Parameters</h4>
                </div>
                <button onClick={() => setShowScientificParams(false)} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {sceneModule.scientificParameters.map((p: any) => (
                  <div key={p.name} className="flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-200 block">{p.name}</span>
                      <span className="text-[9px] text-slate-400">{p.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-300">{p.value}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{p.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AR Status & Reticle Overlay */}
          {viewMode === 'ar' && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
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

          {/* Bottom Floating Speech Card in 3D Simulation Mode */}
          <div className="absolute bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3.5 pointer-events-auto left-1/2 -translate-x-1/2 w-[92%] max-w-2xl">
            <button
              onClick={handleSpeechPlay}
              title="Listen to teacher explanation"
              className="w-9 h-9 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed flex-1 select-none text-left">
              {speechText}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

