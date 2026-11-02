import * as THREE from 'three';
import { InteractiveLabel } from '../../../types';

export interface SceneStage {
  id: string;
  name: string;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface SceneModule {
  id: string;
  title: string;
  stages: SceneStage[];
  labels: InteractiveLabel[];
  defaultCameraPos: [number, number, number];
  defaultTarget: [number, number, number];
  scientificParameters: { name: string; value: string; unit: string; description: string }[];
  build: (
    group: THREE.Group,
    dynamicMeshes: { current: { mesh: THREE.Object3D; update: (t: number, dt: number) => void }[] },
    particleSystems: { current: THREE.Points[] },
    isSoftwareGl: boolean
  ) => void;
}

export const WaterCycleScene: SceneModule = {
  id: 'water-cycle',
  title: 'The Water Cycle: Earth Hydrological System',
  defaultCameraPos: [0, 3.6, 8.2],
  defaultTarget: [0, 0.6, 0],
  stages: [
    {
      id: 'all',
      name: 'Continuous Cycle',
      description: 'The complete closed-loop cycle operating simultaneously across planetary reservoirs.',
      cameraPosition: [0, 3.6, 8.2],
      cameraTarget: [0, 0.6, 0],
    },
    {
      id: 'evaporation',
      name: '1. Evaporation',
      description: 'Solar radiation heats the lake surface, transferring kinetic energy to water molecules that ascend as vapor.',
      cameraPosition: [3.8, 2.2, 4.2],
      cameraTarget: [2.0, 0.8, 0.8],
    },
    {
      id: 'condensation',
      name: '2. Condensation',
      description: 'Ascending humid air expands adiabatically and cools to dew point, condensing around aerosols into clouds.',
      cameraPosition: [-1.2, 4.2, 3.2],
      cameraTarget: [-1.2, 3.6, -0.6],
    },
    {
      id: 'precipitation',
      name: '3. Precipitation',
      description: 'Droplets inside clouds coalesce until gravitational force overcomes thermal updrafts, falling as rain.',
      cameraPosition: [-3.2, 2.8, 3.2],
      cameraTarget: [-2.0, 2.0, 0.2],
    },
    {
      id: 'collection',
      name: '4. Collection',
      description: 'Surface runoff flows through carved mountain streams back into the lake, completing the hydrological circuit.',
      cameraPosition: [0.8, 2.0, 4.8],
      cameraTarget: [0.2, 0.4, 0.6],
    },
    {
      id: 'transpiration',
      name: '5. Plant Transpiration',
      description: 'Vegetation absorbs groundwater through roots and releases water vapour into the atmosphere via stomata.',
      cameraPosition: [-0.6, 1.8, 3.2],
      cameraTarget: [-0.8, 0.8, 0.5],
    },
  ],
  labels: [
    {
      id: 'condensation',
      name: 'Condensation',
      position: [-1.2, 3.65, -0.6],
      cameraPosition: [-1.5, 4.2, 3.0],
      shortExplanation: 'Cooling water vapour condenses around microscopic aerosol particles to form visible clouds.',
      detailedExplanation: 'As warm, humid air rises, it expands adiabatically and cools to its dew point. Water vapor condenses around cloud condensation nuclei, releasing latent heat.',
      scienceFormula: 'H₂O (g) → H₂O (l) + Latent Heat',
      accentColor: '#818cf8',
      category: 'Cloud Formation (Exothermic)',
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      position: [-2.2, 2.2, 0.5],
      cameraPosition: [-3.5, 2.8, 2.8],
      shortExplanation: 'Condensed water droplets coalesce until gravitational pull overcomes updrafts, falling as rain.',
      detailedExplanation: 'Through collision-coalescence inside the cloud, cloud droplets grow larger and heavier. Once droplet mass exceeds thermal updrafts, gravity pulls them down.',
      scienceFormula: 'F_gravity > F_updraft',
      accentColor: '#60a5fa',
      category: 'Atmospheric Deposition',
    },
    {
      id: 'evaporation',
      name: 'Evaporation',
      position: [2.2, 1.4, 0.8],
      cameraPosition: [3.8, 2.5, 3.5],
      shortExplanation: 'Liquid water absorbs thermal energy and ascends as invisible water vapour.',
      detailedExplanation: 'Solar radiation transfers kinetic energy into surface water molecules. Hydrogen bonds break, turning liquid water into rising water vapour.',
      scienceFormula: 'H₂O (l) + ΔH_vap → H₂O (g)',
      accentColor: '#38bdf8',
      category: 'Phase Transition (Endothermic)',
    },
    {
      id: 'collection',
      name: 'Collection',
      position: [1.2, 0.28, 0.9],
      cameraPosition: [1.5, 1.6, 4.0],
      shortExplanation: 'Surface runoff and groundwater drain into lakes and oceans.',
      detailedExplanation: 'Precipitation gathers in tributaries and carved river valleys, recharging aquifers and returning water to the lake.',
      scienceFormula: 'Precipitation = Runoff + Evapotranspiration + Infiltration',
      accentColor: '#0ea5e9',
      category: 'Hydrological Basin',
    },
    {
      id: 'transpiration',
      name: 'Plant Transpiration',
      position: [-0.8, 0.95, 0.6],
      cameraPosition: [-0.6, 1.8, 3.2],
      shortExplanation: 'Vegetation releases water vapour from leaf stomata directly into the atmosphere.',
      detailedExplanation: 'Water absorbed by roots travels up xylem vessels through capillary action and negative water potential, evaporating from microscopic leaf stomata into the boundary layer.',
      scienceFormula: 'Evapotranspiration = Evaporation + Transpiration',
      accentColor: '#10b981',
      category: 'Biological Moisture Release',
    },
  ],
  scientificParameters: [
    { name: 'Solar Irradiance', value: '1,024', unit: 'W/m²', description: 'Peak thermal energy delivered to the water surface' },
    { name: 'Water Temperature', value: '23.5', unit: '°C', description: 'Average surface water temperature in collection basin' },
    { name: 'Evaporation Rate', value: '4.8', unit: 'mm/day', description: 'Rate of moisture transfer into the atmospheric boundary layer' },
    { name: 'Relative Humidity', value: '76', unit: '%', description: 'Atmospheric moisture saturation level near cloud base' },
    { name: 'Precipitation Rate', value: '14.2', unit: 'mm/hr', description: 'Average droplet mass deposition across mountain catchment' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    // 1. Mountain Base with layered rock ridges
    const mountainGeo = new THREE.ConeGeometry(3.6, 4.4, 20);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.12,
      flatShading: true,
    });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(-2.2, 2.2, -1.0);
    mountain.castShadow = !isSoftwareGl;
    mountain.receiveShadow = !isSoftwareGl;
    group.add(mountain);

    // Secondary Mountain Ridge
    const ridgeGeo = new THREE.ConeGeometry(2.4, 3.2, 16);
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(-3.5, 1.6, -2.0);
    group.add(ridge);

    // Snow peak cap with faceted geometry
    const snowGeo = new THREE.ConeGeometry(1.45, 1.65, 20);
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.05,
    });
    const snowCap = new THREE.Mesh(snowGeo, snowMat);
    snowCap.position.set(-2.2, 3.55, -1.0);
    group.add(snowCap);

    // Green foothills & lush riverbanks
    const hillGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      metalness: 0.05,
    });
    const hill1 = new THREE.Mesh(hillGeo, hillMat);
    hill1.scale.set(1.4, 0.65, 1.2);
    hill1.position.set(-0.8, 0.65, 0.5);
    group.add(hill1);

    const hill2 = new THREE.Mesh(hillGeo, hillMat);
    hill2.scale.set(1.2, 0.5, 1.0);
    hill2.position.set(0.6, 0.5, -1.2);
    group.add(hill2);

    // River runoff channel (carved flowing stream into the lake)
    const riverGeo = new THREE.CylinderGeometry(0.3, 0.7, 3.4, 16);
    riverGeo.rotateZ(Math.PI / 3);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(-0.5, 0.55, 0.4);
    group.add(river);

    // Shimmering Deep Lake Water Basin
    const lakeGeo = new THREE.CylinderGeometry(2.9, 2.9, 0.45, 36);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.name = 'lake';
    lake.position.set(2.2, 0.22, 0.8);
    lake.receiveShadow = !isSoftwareGl;
    group.add(lake);

    dynamicMeshes.current.push({
      mesh: lake,
      update: (t) => {
        lake.rotation.y = t * 0.04;
      },
    });

    // Sun with radiant coronal flare
    const sunGeo = new THREE.SphereGeometry(1.15, 28, 28);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.35,
      roughness: 0.15,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(4.2, 4.6, -2.4);
    group.add(sun);

    // Sun outer corona halo
    const haloGeo = new THREE.RingGeometry(1.35, 2.3, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.38,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(sun.position);
    halo.lookAt(0, 3.5, 7.5);
    group.add(halo);

    // Condensation Clouds (Assembly of 5 cumulus spheres)
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(-1.2, 3.65, -0.6);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.65,
      metalness: 0.04,
    });
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 18), cloudMat);
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 18, 18), cloudMat);
    c2.position.set(0.7, 0.15, 0.2);
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 18, 18), cloudMat);
    c3.position.set(-0.65, -0.1, -0.1);
    const c4 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 18), cloudMat);
    c4.position.set(0.2, 0.4, -0.2);
    const c5 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 18), cloudMat);
    c5.position.set(-0.2, 0.35, 0.25);
    cloudGroup.add(c1, c2, c3, c4, c5);
    group.add(cloudGroup);

    dynamicMeshes.current.push({
      mesh: cloudGroup,
      update: (t) => {
        cloudGroup.position.x = -1.2 + Math.sin(t * 0.45) * 0.45;
        cloudGroup.position.y = 3.65 + Math.cos(t * 0.6) * 0.08;
      },
    });

    // Rising Evaporation Particles (Thermal water vapor ascending)
    const evapCount = 90;
    const evapGeo = new THREE.BufferGeometry();
    const evapPos = new Float32Array(evapCount * 3);
    for (let i = 0; i < evapCount; i++) {
      evapPos[i * 3] = 1.2 + (Math.random() - 0.5) * 2.5;
      evapPos[i * 3 + 1] = 0.4 + Math.random() * 3.3;
      evapPos[i * 3 + 2] = 0.8 + (Math.random() - 0.5) * 2.3;
    }
    evapGeo.setAttribute('position', new THREE.BufferAttribute(evapPos, 3));
    const evapMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
    });
    const evapPoints = new THREE.Points(evapGeo, evapMat);
    evapPoints.name = 'evaporation';
    group.add(evapPoints);
    particleSystems.current.push(evapPoints);

    // Precipitation Rain Particle System
    const rainCount = 130;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = -1.8 + (Math.random() - 0.5) * 2.2;
      rainPos[i * 3 + 1] = 0.2 + Math.random() * 3.5;
      rainPos[i * 3 + 2] = -0.6 + (Math.random() - 0.5) * 1.9;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.name = 'rain';
    group.add(rainPoints);
    particleSystems.current.push(rainPoints);

    // Lush Forest Trees on Foothills (Transpiration source)
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const treeOffsets = [
      [-0.8, 0.75, 0.4],
      [-1.1, 0.82, 0.6],
      [-0.5, 0.68, 0.7],
      [-0.9, 0.9, 0.2],
      [-0.3, 0.62, 0.5],
    ];

    treeOffsets.forEach((pos, idx) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8), trunkMat);
      trunk.position.set(pos[0], pos[1], pos[2]);
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 8), foliageMat);
      foliage.position.set(pos[0], pos[1] + 0.35, pos[2]);
      treeGroup.add(trunk, foliage);
    });
    group.add(treeGroup);

    // Plant Transpiration Vapor Stream (rising from green trees)
    const transpCount = 50;
    const transpGeo = new THREE.BufferGeometry();
    const transpPos = new Float32Array(transpCount * 3);
    for (let i = 0; i < transpCount; i++) {
      transpPos[i * 3] = -0.8 + (Math.random() - 0.5) * 0.9;
      transpPos[i * 3 + 1] = 0.9 + Math.random() * 2.2;
      transpPos[i * 3 + 2] = 0.5 + (Math.random() - 0.5) * 0.8;
    }
    transpGeo.setAttribute('position', new THREE.BufferAttribute(transpPos, 3));
    const transpMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.12,
      transparent: true,
      opacity: 0.82,
    });
    const transpPoints = new THREE.Points(transpGeo, transpMat);
    transpPoints.name = 'transpiration';
    group.add(transpPoints);
    particleSystems.current.push(transpPoints);
  },
};
