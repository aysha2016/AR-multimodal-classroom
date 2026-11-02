import * as THREE from 'three';
import { SceneModule } from './WaterCycleScene';

export const SolarSystemScene: SceneModule = {
  id: 'solar-system',
  title: 'The Solar System: Heliocentric Dynamics',
  defaultCameraPos: [0, 6.5, 9.5],
  defaultTarget: [0, 0, 0],
  stages: [
    {
      id: 'all',
      name: 'Planetary Orbits',
      description: 'Keplerian orbital kinematics of the eight major planets around the central Sun.',
      cameraPosition: [0, 6.5, 9.5],
      cameraTarget: [0, 0, 0],
    },
    {
      id: 'sun',
      name: '1. The Sun',
      description: 'G-type main-sequence star comprising 99.86% of the total system mass.',
      cameraPosition: [0, 2.0, 4.2],
      cameraTarget: [0, 0, 0],
    },
    {
      id: 'inner',
      name: '2. Terrestrial Planets',
      description: 'Mercury, Venus, Earth, and Mars: dense silicate and metal compositions.',
      cameraPosition: [2.2, 3.2, 4.0],
      cameraTarget: [1.2, 0, 0],
    },
    {
      id: 'outer',
      name: '3. Gas & Ice Giants',
      description: 'Jupiter, Saturn, Uranus, and Neptune: massive hydrogen-helium atmospheres and ring systems.',
      cameraPosition: [4.5, 5.0, 7.5],
      cameraTarget: [3.5, 0, 0],
    },
  ],
  labels: [
    {
      id: 'sun',
      name: 'The Sun (Sol)',
      position: [0, 0, 0],
      cameraPosition: [0, 1.8, 3.8],
      shortExplanation: 'Central star powering planetary heat, light, and solar wind.',
      detailedExplanation: 'Core nuclear fusion converts 600 million tons of hydrogen into helium every second, generating photons that take 100,000 years to reach the convective surface.',
      scienceFormula: '4 ¹H → ⁴He + 2 e⁺ + 2 ν_e + 26.7 MeV',
      accentColor: '#f59e0b',
      category: 'G-Type Main Sequence Star',
    },
    {
      id: 'earth',
      name: 'Earth & Moon',
      position: [2.6, 0, 0],
      cameraPosition: [2.8, 1.2, 2.2],
      shortExplanation: 'The only confirmed planetary body supporting liquid water oceans and carbon-based life.',
      detailedExplanation: 'Located in the circumstellar habitable zone, with active plate tectonics and a dipolar magnetic field deflecting lethal cosmic rays.',
      scienceFormula: 'Distance: 1.00 AU (149.6 × 10⁶ km)',
      accentColor: '#38bdf8',
      category: 'Terrestrial Habitable Planet',
    },
    {
      id: 'jupiter',
      name: 'Jupiter (Gas Giant)',
      position: [4.4, 0, 0],
      cameraPosition: [4.8, 1.5, 3.0],
      shortExplanation: 'Largest planet with 2.5 times the mass of all other planets combined.',
      detailedExplanation: 'Dominated by metallic hydrogen in its deep mantle, with a dynamic magnetosphere and iconic Great Red Spot anticyclonic storm.',
      scienceFormula: 'Mass: 317.8 Earth Masses',
      accentColor: '#fb923c',
      category: 'Jovian Gas Giant',
    },
  ],
  scientificParameters: [
    { name: 'Solar Mass', value: '1.989 × 10³⁰', unit: 'kg', description: 'Total gravitational mass of the Sun' },
    { name: 'Earth Orbital Velocity', value: '29.78', unit: 'km/s', description: 'Average heliocentric velocity of Earth' },
    { name: 'Solar Surface Temp', value: '5,778', unit: 'K', description: 'Photosphere effective blackbody temperature' },
    { name: 'Astronomical Unit (AU)', value: '149.6', unit: 'million km', description: 'Mean distance from Earth to Sun' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    // 1. Central Sun
    const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    group.add(sun);

    // Glowing Corona Halo
    const coronaGeo = new THREE.RingGeometry(1.4, 2.4, 36);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    corona.rotation.x = Math.PI / 2;
    group.add(corona);

    // Planet data configurations (scaled for visual clarity)
    const planets = [
      { name: 'Mercury', dist: 1.8, size: 0.16, color: 0x94a3b8, speed: 3.2 },
      { name: 'Venus', dist: 2.3, size: 0.24, color: 0xfacc15, speed: 2.4 },
      { name: 'Earth', dist: 3.0, size: 0.28, color: 0x38bdf8, speed: 1.8, hasMoon: true },
      { name: 'Mars', dist: 3.8, size: 0.2, color: 0xef4444, speed: 1.4 },
      { name: 'Jupiter', dist: 4.8, size: 0.58, color: 0xfb923c, speed: 0.9 },
      { name: 'Saturn', dist: 5.9, size: 0.48, color: 0xfde047, speed: 0.65, hasRings: true },
      { name: 'Uranus', dist: 6.8, size: 0.36, color: 0x67e8f9, speed: 0.45 },
      { name: 'Neptune', dist: 7.6, size: 0.34, color: 0x3b82f6, speed: 0.35 },
    ];

    planets.forEach((p) => {
      // Orbit Ring Line
      const orbitGeo = new THREE.RingGeometry(p.dist - 0.015, p.dist + 0.015, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      group.add(orbitRing);

      // Planet Mesh
      const pGeo = new THREE.SphereGeometry(p.size, 20, 20);
      const pMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.name = p.name;
      group.add(pMesh);

      // Saturn Rings
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.4, p.size * 2.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.8;
        pMesh.add(ring);
      }

      // Earth Moon
      if (p.hasMoon) {
        const moonGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(0.45, 0, 0);
        pMesh.add(moon);
      }

      dynamicMeshes.current.push({
        mesh: pMesh,
        update: (t) => {
          const angle = t * 0.35 * p.speed;
          pMesh.position.x = Math.cos(angle) * p.dist;
          pMesh.position.z = Math.sin(angle) * p.dist;
          pMesh.rotation.y = t * 1.5;
        },
      });
    });
  },
};
