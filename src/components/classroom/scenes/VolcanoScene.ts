import * as THREE from 'three';
import { SceneModule } from './WaterCycleScene';

export const VolcanoScene: SceneModule = {
  id: 'volcano',
  title: 'Volcanology: Magma Kinetics & Eruption Dynamics',
  defaultCameraPos: [0, 3.8, 8.2],
  defaultTarget: [0, 0.8, 0],
  stages: [
    {
      id: 'all',
      name: 'Eruption Process',
      description: 'Continuous ascent of molten magma from deep crustal chambers through the central conduit.',
      cameraPosition: [0, 3.8, 8.2],
      cameraTarget: [0, 0.8, 0],
    },
    {
      id: 'magma',
      name: '1. Magma Reservoir',
      description: 'Subterranean molten rock chamber under extreme lithostatic and volatile gas pressure.',
      cameraPosition: [0, 0.4, 4.5],
      cameraTarget: [0, -1.2, 0],
    },
    {
      id: 'conduit',
      name: '2. Conduit Vent Throat',
      description: 'Vertical volcanic pipe transporting pressurized magma towards the surface.',
      cameraPosition: [2.5, 2.0, 4.0],
      cameraTarget: [0, 1.2, 0],
    },
    {
      id: 'crater',
      name: '3. Crater & Lava Eruption',
      description: 'Explosive fragmentation into ash plumes and effusive molten lava flows down slopes.',
      cameraPosition: [0, 4.2, 4.5],
      cameraTarget: [0, 2.8, 0],
    },
  ],
  labels: [
    {
      id: 'magma-chamber',
      name: 'Magma Chamber',
      position: [0, -1.2, 0],
      cameraPosition: [0, 0.2, 4.2],
      shortExplanation: 'Subterranean reservoir of molten rock under extreme lithostatic pressure.',
      detailedExplanation: 'Dissolved volatile gases (H₂O, CO₂, SO₂) exsolve from magma as it ascends to lower pressures, creating high explosive potential.',
      scienceFormula: 'P_lithostatic = ρ · g · h',
      accentColor: '#f97316',
      category: 'Subterranean Reservoir',
    },
    {
      id: 'conduit',
      name: 'Central Conduit Throat',
      position: [0, 1.2, 0.2],
      cameraPosition: [1.8, 2.0, 3.5],
      shortExplanation: 'Vertical pipe conduit connecting magma reservoir to surface vent.',
      detailedExplanation: 'Decompression causes gas bubbles to expand rapidly, fragmenting the viscous silicate melt into ash, pumice, and pyroclasts.',
      scienceFormula: 'Navier-Stokes Magma Flux',
      accentColor: '#ef4444',
      category: 'Volcanic Vent Pipe',
    },
    {
      id: 'crater',
      name: 'Caldera Crater & Lava Stream',
      position: [0, 2.8, 0],
      cameraPosition: [0, 4.2, 3.5],
      shortExplanation: 'Summit vent erupting incandescent lava and particulate ash plumes.',
      detailedExplanation: 'Lava temperatures reach 1,150°C. Basaltic flows form pahoehoe ropes and blocky aʻa crusts as surfaces radiate heat into cold mountain air.',
      scienceFormula: 'T_lava ≈ 1,150 °C',
      accentColor: '#dc2626',
      category: 'Summit Caldera',
    },
  ],
  scientificParameters: [
    { name: 'Lava Temperature', value: '1,150', unit: '°C', description: 'Basaltic effusive magma thermal temperature' },
    { name: 'Chamber Pressure', value: '185', unit: 'MPa', description: 'Lithostatic confining pressure in the magma chamber' },
    { name: 'Silica Content', value: '52', unit: '%', description: 'Determines viscosity and explosive classification' },
    { name: 'Eruption Plume', value: '7.8', unit: 'km', description: 'Ascending convective ash column altitude' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    // 1. Volcano Mountain Cone
    const coneGeo = new THREE.ConeGeometry(3.8, 4.2, 28, 1, true);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x44403c,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 1.9, 0);
    group.add(cone);

    // 2. Magma Chamber (Glowing underground sphere)
    const magmaGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const magmaMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const magma = new THREE.Mesh(magmaGeo, magmaMat);
    magma.position.set(0, -1.2, 0);
    group.add(magma);

    // 3. Central Conduit (Vertical glowing cylinder)
    const condGeo = new THREE.CylinderGeometry(0.45, 0.65, 3.8, 20);
    const condMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xf97316,
      emissiveIntensity: 1.4,
      roughness: 0.3,
    });
    const cond = new THREE.Mesh(condGeo, condMat);
    cond.position.set(0, 1.8, 0);
    group.add(cond);

    // 4. Summit Caldera Crater
    const craterGeo = new THREE.RingGeometry(0.5, 1.2, 28);
    const craterMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(0, 4.0, 0);
    group.add(crater);

    // 5. Flowing Lava Streams down mountain slopes
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 1.2,
      roughness: 0.25,
    });
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 3.2, 12), lavaMat);
    l1.position.set(1.4, 2.0, 0.8);
    l1.rotation.z = -Math.PI / 5;
    group.add(l1);

    // 6. Eruption Particle Column (Molten pyroclastic sparks & ash)
    const pyroCount = 110;
    const pyroGeo = new THREE.BufferGeometry();
    const pyroPos = new Float32Array(pyroCount * 3);
    for (let i = 0; i < pyroCount; i++) {
      pyroPos[i * 3] = (Math.random() - 0.5) * 1.4;
      pyroPos[i * 3 + 1] = 4.0 + Math.random() * 2.8;
      pyroPos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    pyroGeo.setAttribute('position', new THREE.BufferAttribute(pyroPos, 3));
    const pyroMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.12, transparent: true, opacity: 0.9 });
    const pyro = new THREE.Points(pyroGeo, pyroMat);
    pyro.name = 'pyroclasts';
    group.add(pyro);
    particleSystems.current.push(pyro);

    dynamicMeshes.current.push({
      mesh: magma,
      update: (t) => {
        magma.scale.set(1.0 + Math.sin(t * 2) * 0.04, 1.0 + Math.sin(t * 2) * 0.04, 1.0 + Math.sin(t * 2) * 0.04);
      },
    });
  },
};
