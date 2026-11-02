import * as THREE from 'three';
import { Lesson } from '../../types';

export interface DynamicMeshItem {
  mesh: THREE.Mesh | THREE.Group;
  update: (time: number, delta: number) => void;
}

export function buildSubjectModel(
  sceneType: Lesson['sceneType'],
  group: THREE.Group,
  dynamicMeshesRef: { current: DynamicMeshItem[] },
  particleSystemsRef: { current: THREE.Points[] },
  isSoftwareGl: boolean
) {
  // Clear any previous children safely
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
  }

  if (sceneType === 'water-cycle') {
    // -------------------------------------------------------------------------
    // 1. THE WATER CYCLE: High-fidelity procedural terrain, lake, clouds, rain
    // -------------------------------------------------------------------------
    // Mountain Base with multiple layered rock ridges
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
    lake.position.set(2.2, 0.22, 0.8);
    lake.receiveShadow = !isSoftwareGl;
    group.add(lake);

    dynamicMeshesRef.current.push({
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

    // Condensation Clouds (Assembly of 5 fluffy procedural cumulus spheres)
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

    dynamicMeshesRef.current.push({
      mesh: cloudGroup,
      update: (t) => {
        cloudGroup.position.x = -1.2 + Math.sin(t * 0.45) * 0.45;
        cloudGroup.position.y = 3.65 + Math.cos(t * 0.6) * 0.08;
      },
    });

    // Evaporation Rising Particles (Thermal water vapor ascending)
    const evapCount = 75;
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
      opacity: 0.8,
    });
    const evapPoints = new THREE.Points(evapGeo, evapMat);
    evapPoints.name = 'evaporation';
    group.add(evapPoints);
    particleSystemsRef.current.push(evapPoints);

    // Precipitation Rain Particle System (Gravity accelerated drops)
    const rainCount = 120;
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
      size: 0.09,
      transparent: true,
      opacity: 0.85,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.name = 'rain';
    group.add(rainPoints);
    particleSystemsRef.current.push(rainPoints);

  } else if (sceneType === 'heart') {
    // -------------------------------------------------------------------------
    // 2. THE HUMAN HEART: Dual-circuit pumping muscular model
    // -------------------------------------------------------------------------
    const heartGroup = new THREE.Group();
    group.add(heartGroup);

    // Left Ventricle (Thick red muscular cone)
    const lvGeo = new THREE.ConeGeometry(1.25, 2.3, 24);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
      metalness: 0.2,
    });
    const lv = new THREE.Mesh(lvGeo, lvMat);
    lv.rotation.z = Math.PI * 0.88;
    lv.position.set(-0.5, 0.4, 0);
    heartGroup.add(lv);

    // Right Ventricle (Blue circuit cone)
    const rvGeo = new THREE.ConeGeometry(0.95, 1.85, 24);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.4,
      metalness: 0.2,
    });
    const rv = new THREE.Mesh(rvGeo, rvMat);
    rv.rotation.z = Math.PI * 0.92;
    rv.position.set(0.6, 0.5, 0.2);
    heartGroup.add(rv);

    // Right Atrium
    const raGeo = new THREE.SphereGeometry(0.88, 20, 20);
    const raMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
    const ra = new THREE.Mesh(raGeo, raMat);
    ra.position.set(1.15, 1.45, 0.3);
    heartGroup.add(ra);

    // Left Atrium
    const laGeo = new THREE.SphereGeometry(0.88, 20, 20);
    const laMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const la = new THREE.Mesh(laGeo, laMat);
    la.position.set(-0.95, 1.55, -0.2);
    heartGroup.add(la);

    // Aorta Arch (Torus curve with branching carotid arteries)
    const aortaGeo = new THREE.TorusGeometry(0.95, 0.3, 18, 26, Math.PI * 0.85);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.3,
    });
    const aorta = new THREE.Mesh(aortaGeo, aortaMat);
    aorta.position.set(-0.1, 2.05, 0);
    aorta.rotation.z = -Math.PI * 0.15;
    heartGroup.add(aorta);

    // Superior Vena Cava
    const svcGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.45, 18);
    const svcMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    const svc = new THREE.Mesh(svcGeo, svcMat);
    svc.position.set(1.22, 2.35, 0.1);
    heartGroup.add(svc);

    // Cardiac Lub-Dub Dual Pulse Rhythm
    dynamicMeshesRef.current.push({
      mesh: heartGroup,
      update: (t) => {
        const beat = Math.pow(Math.sin(t * 3.6), 6) * 0.13;
        heartGroup.scale.set(1 + beat, 1 + beat, 1 + beat);
      },
    });

  } else if (sceneType === 'solar-system') {
    // -------------------------------------------------------------------------
    // 3. SOLAR SYSTEM: Sun & Keplerian Orbiting Planets
    // -------------------------------------------------------------------------
    // Central Sun
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.35,
        roughness: 0.1,
      })
    );
    group.add(sunMesh);

    const planets = [
      { name: 'Mercury', r: 0.25, dist: 2.3, color: 0x94a3b8, speed: 2.4 },
      { name: 'Venus', r: 0.42, dist: 3.2, color: 0xfbbf24, speed: 1.8 },
      { name: 'Earth', r: 0.48, dist: 4.3, color: 0x38bdf8, speed: 1.3 },
      { name: 'Mars', r: 0.32, dist: 5.4, color: 0xef4444, speed: 1.0 },
      { name: 'Jupiter', r: 1.05, dist: 7.2, color: 0xd97706, speed: 0.6 },
    ];

    planets.forEach((p) => {
      // Orbit Path Ring
      const orbitRingGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 64);
      const orbitRingMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
      orbitRing.rotation.x = Math.PI / 2;
      group.add(orbitRing);

      // Planet Sphere
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.r, 22, 22),
        new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.6, metalness: 0.1 })
      );
      group.add(pMesh);

      // Add Saturn's ring if Jupiter/Saturn
      if (p.name === 'Jupiter') {
        const ringGeo = new THREE.RingGeometry(1.3, 1.85, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfcd34d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        pMesh.add(ring);
      }

      dynamicMeshesRef.current.push({
        mesh: pMesh,
        update: (t) => {
          const angle = t * p.speed * 0.4;
          pMesh.position.x = Math.cos(angle) * p.dist;
          pMesh.position.z = Math.sin(angle) * p.dist;
          pMesh.rotation.y = t * 2.0;
        },
      });
    });

  } else if (sceneType === 'plant-cell') {
    // -------------------------------------------------------------------------
    // 4. PLANT CELL: Rigid wall, chloroplasts, nucleus, central vacuole
    // -------------------------------------------------------------------------
    // Outer hexagonal cell wall
    const wallGeo = new THREE.CylinderGeometry(3.1, 3.1, 1.25, 6);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.7,
      wireframe: true,
    });
    const cellWall = new THREE.Mesh(wallGeo, wallMat);
    group.add(cellWall);

    // Inner Cytoplasm
    const cytoGeo = new THREE.CylinderGeometry(2.8, 2.8, 1.05, 6);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      transparent: true,
      opacity: 0.48,
      roughness: 0.3,
    });
    const cyto = new THREE.Mesh(cytoGeo, cytoMat);
    group.add(cyto);

    // Large Central Vacuole (turgor pressure fluid)
    const vacGeo = new THREE.SphereGeometry(1.25, 24, 24);
    const vacMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.68,
      roughness: 0.1,
    });
    const vacuole = new THREE.Mesh(vacGeo, vacMat);
    vacuole.position.set(-0.8, 0, 0.4);
    group.add(vacuole);

    // Nucleus with Chromatin
    const nucGeo = new THREE.SphereGeometry(0.72, 22, 22);
    const nucMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    nucleus.position.set(1.2, 0.2, -0.6);
    group.add(nucleus);

    // Chloroplasts (Green photosynthetic disks)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const chMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.2, 18),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 })
      );
      chMesh.position.set(Math.cos(angle) * 1.85, 0.15, Math.sin(angle) * 1.85);
      chMesh.rotation.x = 0.3;
      group.add(chMesh);
    }

  } else if (sceneType === 'volcano') {
    // -------------------------------------------------------------------------
    // 5. VOLCANO: Stratovolcano cone, magma chamber, glowing eruption
    // -------------------------------------------------------------------------
    const coneGeo = new THREE.CylinderGeometry(0.85, 3.9, 4.2, 26, 1, true);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const volcanoCone = new THREE.Mesh(coneGeo, coneMat);
    volcanoCone.position.set(0, 1.9, 0);
    group.add(volcanoCone);

    // Magma chamber glowing reservoir
    const magmaGeo = new THREE.SphereGeometry(1.45, 22, 22);
    const magmaMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 1.45,
      roughness: 0.2,
    });
    const magma = new THREE.Mesh(magmaGeo, magmaMat);
    magma.position.set(0, -0.6, 0);
    group.add(magma);

    // Conduit pipe
    const conduitGeo = new THREE.CylinderGeometry(0.38, 0.48, 3.3, 18);
    const conduit = new THREE.Mesh(conduitGeo, magmaMat);
    conduit.position.set(0, 1.55, 0);
    group.add(conduit);

    dynamicMeshesRef.current.push({
      mesh: magma,
      update: (t) => {
        const p = 1 + Math.sin(t * 2.2) * 0.07;
        magma.scale.set(p, p, p);
      },
    });

  } else if (sceneType === 'circuit') {
    // -------------------------------------------------------------------------
    // 6. ELECTRIC CIRCUIT: Battery, Resistor, Switch, Lamp, Electron drift
    // -------------------------------------------------------------------------
    const baseGeo = new THREE.BoxGeometry(6.6, 0.26, 4.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const circuitBase = new THREE.Mesh(baseGeo, baseMat);
    group.add(circuitBase);

    // 9V DC Battery
    const batGeo = new THREE.BoxGeometry(1.45, 1.85, 0.95);
    const batMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const battery = new THREE.Mesh(batGeo, batMat);
    battery.position.set(-2.2, 1.0, 0);
    group.add(battery);

    // Incandescent Lamp with glowing filament
    const lampGeo = new THREE.SphereGeometry(0.78, 22, 22);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.25,
      roughness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(2.2, 1.0, 0);
    group.add(lamp);

    // Resistor
    const resGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.25, 18);
    resGeo.rotateZ(Math.PI / 2);
    const resMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const resistor = new THREE.Mesh(resGeo, resMat);
    resistor.position.set(0, 0.38, -1.6);
    group.add(resistor);

    // Conducting Copper Wires
    const wireGeo = new THREE.TorusGeometry(2.45, 0.065, 8, 36);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.82, roughness: 0.2 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.x = Math.PI / 2;
    wire.position.y = 0.25;
    group.add(wire);
  }
}
