import * as THREE from 'three';
import { SceneModule } from './WaterCycleScene';

export const ElectricCircuitScene: SceneModule = {
  id: 'electric-circuit',
  title: 'Electric Circuit: Ohm’s Law & Electron Drift',
  defaultCameraPos: [0, 3.4, 7.5],
  defaultTarget: [0, 0.4, 0],
  stages: [
    {
      id: 'all',
      name: 'Closed Circuit',
      description: 'Continuous conduction loop: EMF power supply, copper wires, closed switch, and glowing filament lamp.',
      cameraPosition: [0, 3.4, 7.5],
      cameraTarget: [0, 0.4, 0],
    },
    {
      id: 'battery',
      name: '1. Chemical Battery (EMF)',
      description: 'Electrochemical reaction establishing electric potential difference (Voltage).',
      cameraPosition: [-2.5, 2.0, 4.0],
      cameraTarget: [-2.0, 0.5, 0],
    },
    {
      id: 'switch',
      name: '2. Circuit Switch',
      description: 'Physical conductor bridge opening or closing the electron drift loop.',
      cameraPosition: [0, 2.2, 3.8],
      cameraTarget: [0, 0.2, 1.5],
    },
    {
      id: 'bulb',
      name: '3. Incandescent Lamp',
      description: 'Joule heating in tungsten filament converts electrical energy into visible light photons.',
      cameraPosition: [2.5, 2.2, 4.0],
      cameraTarget: [2.0, 0.6, 0.2],
    },
  ],
  labels: [
    {
      id: 'battery',
      name: 'DC Power Supply (Battery)',
      position: [-2.0, 0.6, 0],
      cameraPosition: [-2.6, 1.8, 3.2],
      shortExplanation: 'Chemical energy converter creating electromotive force (EMF) potential.',
      detailedExplanation: 'Electrochemical reactions pump valence electrons from positive cathode to negative anode, establishing an electrical potential gradient (V).',
      scienceFormula: 'EMF: V = W / Q = 9.0 V',
      accentColor: '#3b82f6',
      category: 'Voltage Source (EMF)',
    },
    {
      id: 'switch',
      name: 'Mechanical Switch',
      position: [0, 0.2, 1.5],
      cameraPosition: [0, 1.4, 2.8],
      shortExplanation: 'Controls current flow: closed provides continuous path; open breaks circuit.',
      detailedExplanation: 'When closed, physical metal contacts permit valence electron drift. When open, infinite air resistance drops current to zero instantaneously.',
      scienceFormula: 'Closed: R ≈ 0 Ω | Open: R = ∞ Ω',
      accentColor: '#10b981',
      category: 'Circuit Control',
    },
    {
      id: 'lamp',
      name: 'Incandescent Lamp (Load)',
      position: [2.0, 0.6, 0.2],
      cameraPosition: [2.4, 1.8, 2.8],
      shortExplanation: 'Tungsten filament that heats to incandescence as drifting electrons collide.',
      detailedExplanation: 'Joule heating (P = I²R) converts electrical energy into thermal glow as electrons scatter against metal lattice ions.',
      scienceFormula: 'P = V · I = I² · R = 27 W',
      accentColor: '#fbbf24',
      category: 'Electrical Resistive Load',
    },
  ],
  scientificParameters: [
    { name: 'Supply Voltage (V)', value: '9.0', unit: 'Volts', description: 'Electromotive potential difference across battery terminals' },
    { name: 'Filament Resistance (R)', value: '3.0', unit: 'Ohms (Ω)', description: 'Ohmic resistance of the incandescent tungsten coil' },
    { name: 'Electric Current (I)', value: '3.0', unit: 'Amperes (A)', description: 'Rate of charge drift through conductor (I = V / R)' },
    { name: 'Power Dissipation (P)', value: '27.0', unit: 'Watts (W)', description: 'Electrical energy converted into light and heat per second' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    // 1. DC Battery (Blue & Orange cylinder with terminals)
    const battGroup = new THREE.Group();
    battGroup.position.set(-2.0, 0.6, 0);

    const battGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 20);
    const battMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.6 });
    const battBody = new THREE.Mesh(battGeo, battMat);
    battGroup.add(battBody);

    // Terminal
    const termGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
    const termMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const termPos = new THREE.Mesh(termGeo, termMat);
    termPos.position.y = 0.9;
    battGroup.add(termPos);
    group.add(battGroup);

    // 2. Copper Wire Loop (Rectangular loop with beveled curves)
    const wirePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 0.1, 0),
      new THREE.Vector3(-2.0, 0.1, 1.5),
      new THREE.Vector3(-0.4, 0.1, 1.5),
      new THREE.Vector3(0.4, 0.1, 1.5),
      new THREE.Vector3(2.0, 0.1, 1.5),
      new THREE.Vector3(2.0, 0.1, 0),
      new THREE.Vector3(2.0, 0.1, -1.5),
      new THREE.Vector3(-2.0, 0.1, -1.5),
      new THREE.Vector3(-2.0, 0.1, 0),
    ]);
    const wireGeo = new THREE.TubeGeometry(wirePath, 64, 0.08, 12, true);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // 3. Switch Mechanism (Base and pivot arm)
    const switchBaseGeo = new THREE.BoxGeometry(0.8, 0.15, 0.4);
    const switchBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const switchBase = new THREE.Mesh(switchBaseGeo, switchBaseMat);
    switchBase.position.set(0, 0.08, 1.5);
    group.add(switchBase);

    // Switch Blade Lever
    const leverGeo = new THREE.BoxGeometry(0.65, 0.06, 0.1);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const lever = new THREE.Mesh(leverGeo, leverMat);
    lever.position.set(0, 0.2, 1.5);
    group.add(lever);

    // 4. Incandescent Filament Lamp (Glass bulb with glowing filament)
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(2.0, 0.5, 0);

    const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.45, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const bulbBase = new THREE.Mesh(baseGeo, baseMat);
    bulbGroup.add(bulbBase);

    const glassGeo = new THREE.SphereGeometry(0.75, 24, 24);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 0.8;
    bulbGroup.add(glass);
    group.add(bulbGroup);

    // 5. Drifting Electron Particles (Negative charges circulating)
    const electronCount = 85;
    const electronGeo = new THREE.BufferGeometry();
    const electronPos = new Float32Array(electronCount * 3);
    for (let i = 0; i < electronCount; i++) {
      const u = i / electronCount;
      const pt = wirePath.getPointAt(u);
      electronPos[i * 3] = pt.x;
      electronPos[i * 3 + 1] = pt.y + 0.02;
      electronPos[i * 3 + 2] = pt.z;
    }
    electronGeo.setAttribute('position', new THREE.BufferAttribute(electronPos, 3));
    const electronMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.11, transparent: true, opacity: 0.95 });
    const electrons = new THREE.Points(electronGeo, electronMat);
    electrons.name = 'electrons';
    group.add(electrons);
    particleSystems.current.push(electrons);

    dynamicMeshes.current.push({
      mesh: glass,
      update: (t) => {
        // Glowing pulsation
        glassMat.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.2;
      },
    });
  },
};
