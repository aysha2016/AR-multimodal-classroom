import * as THREE from 'three';
import { SceneModule } from './WaterCycleScene';

export const PlantCellScene: SceneModule = {
  id: 'plant-cell',
  title: 'Plant Cell: Eukaryotic Organelles, Photosynthesis & Osmosis',
  defaultCameraPos: [0, 3.2, 7.6],
  defaultTarget: [0, 0.4, 0],
  stages: [
    {
      id: 'all',
      name: 'Eukaryotic Cell Overview',
      description: 'Intact plant cell with rigid cellulose wall, photosynthetic chloroplasts, and massive turgid central vacuole.',
      cameraPosition: [0, 3.2, 7.6],
      cameraTarget: [0, 0.4, 0],
    },
    {
      id: 'photosynthesis',
      name: '1. Photosynthesis in Chloroplasts',
      description: 'Solar photons, CO₂, and H₂O enter thylakoid grana, producing glucose (C₆H₁₂O₆) and releasing oxygen (O₂).',
      cameraPosition: [-1.8, 1.8, 4.2],
      cameraTarget: [-1.3, 0.6, 0.9],
    },
    {
      id: 'osmosis-turgor',
      name: '2. Osmosis & Vacuolar Turgor',
      description: 'Water enters via osmosis across the tonoplast, generating 0.7 MPa hydrostatic turgor against the cell wall.',
      cameraPosition: [1.2, 2.6, 4.5],
      cameraTarget: [0.6, 0.3, -0.2],
    },
    {
      id: 'nucleus-control',
      name: '3. Nucleus & Protein Synthesis',
      description: 'Double-membrane nuclear envelope with pores, enclosing chromatin DNA and dense nucleolus.',
      cameraPosition: [-0.4, 1.8, 3.8],
      cameraTarget: [-0.6, 0.4, -0.6],
    },
    {
      id: 'mitochondria-energy',
      name: '4. Cellular Respiration',
      description: 'Folded inner cristae break down carbohydrates to synthesize ATP chemical energy.',
      cameraPosition: [1.6, 1.2, 3.8],
      cameraTarget: [1.1, -0.2, 0.6],
    },
  ],
  labels: [
    {
      id: 'cell-wall',
      name: 'Cellulose Cell Wall',
      position: [2.3, 0.4, 0.8],
      cameraPosition: [3.4, 1.2, 2.4],
      shortExplanation: 'Rigid outer casing of intertwined cellulose microfibrils providing mechanical strength.',
      detailedExplanation: 'Withstands high internal hydrostatic turgor pressure (up to 1.0 MPa), preventing osmotic lysis and maintaining plant rigidity without an internal skeleton.',
      scienceFormula: 'Cellulose: (C₆H₁₀O₅)ₙ | Tensile Strength ≈ 100 MPa',
      accentColor: '#16a34a',
      category: 'Structural Barrier',
    },
    {
      id: 'chloroplast',
      name: 'Chloroplast (Photosynthesis)',
      position: [-1.35, 0.65, 1.15],
      cameraPosition: [-2.4, 1.4, 2.8],
      shortExplanation: 'Photosynthetic organelle converting sunlight, CO₂, and H₂O into chemical energy and glucose.',
      detailedExplanation: 'Thylakoid membranes hold chlorophyll photosystems (P680/P700). Light reactions generate ATP/NADPH, powering Calvin cycle glucose synthesis in the stroma.',
      scienceFormula: '6 CO₂ + 6 H₂O + Photons → C₆H₁₂O₆ + 6 O₂',
      accentColor: '#22c55e',
      category: 'Solar Energy Conversion',
    },
    {
      id: 'central-vacuole',
      name: 'Central Vacuole & Tonoplast',
      position: [0.65, 0.25, -0.2],
      cameraPosition: [1.5, 2.0, 3.6],
      shortExplanation: 'Fluid-filled compartment occupying up to 80% of cell volume, maintaining hydrostatic turgor.',
      detailedExplanation: 'Bound by the semi-permeable tonoplast membrane. Actively accumulates mineral ions and organic acids, drawing in water via osmosis to generate turgor pressure.',
      scienceFormula: 'Water Potential: Ψ = Ψ_s + Ψ_p [Turgor ≈ 0.7 MPa]',
      accentColor: '#38bdf8',
      category: 'Osmotic & Storage Organelle',
    },
    {
      id: 'nucleus',
      name: 'Nucleus & Nucleolus',
      position: [-0.65, 0.45, -0.65],
      cameraPosition: [-0.8, 1.6, 2.2],
      shortExplanation: 'Command center holding genomic DNA chromatin and synthesizing ribosomal RNA.',
      detailedExplanation: 'Enclosed by a perforated double nuclear envelope with nuclear pore complexes regulating nucleocytoplasmic transport of transcription factors and mRNA.',
      scienceFormula: 'Central Dogma: DNA → mRNA → Ribosome → Protein',
      accentColor: '#a855f7',
      category: 'Genetic Regulation',
    },
    {
      id: 'mitochondria',
      name: 'Mitochondrion (ATP)',
      position: [1.2, -0.25, 0.75],
      cameraPosition: [2.0, 0.8, 2.5],
      shortExplanation: 'Power plant with folded inner cristae generating ATP via oxidative phosphorylation.',
      detailedExplanation: 'Converts pyruvate and oxygen into ATP across the inner mitochondrial membrane proton gradient, driving cellular metabolic reactions.',
      scienceFormula: 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~32 ATP',
      accentColor: '#f97316',
      category: 'Cellular Respiration',
    },
    {
      id: 'cell-membrane',
      name: 'Plasma Membrane & Cytoplasm',
      position: [-0.1, -1.1, 0.6],
      cameraPosition: [0.5, -0.4, 3.0],
      shortExplanation: 'Selective phospholipid bilayer supporting cyclosis cytoplasmic streaming.',
      detailedExplanation: 'Contains aquaporins, ion pumps, and receptor kinases. The gel-like cytosol carries nutrients, enzymes, and drifting vesicles around actin filaments.',
      scienceFormula: 'Selective Permeability & Cytoskeletal Streaming',
      accentColor: '#06b6d4',
      category: 'Membrane Transport & Cytosol',
    },
  ],
  scientificParameters: [
    { name: 'Turgor Pressure', value: '0.72', unit: 'MPa', description: 'Hydrostatic pressure exerted by vacuole against cell wall' },
    { name: 'Light Wavelength', value: '430 / 680', unit: 'nm', description: 'Peak chlorophyll a absorption peaks' },
    { name: 'Glucose Synthesis', value: '48.2', unit: 'mg/hr', description: 'Photosynthetic carbohydrate generation rate' },
    { name: 'Vacuole Fraction', value: '78', unit: '%', description: 'Total internal volume occupied by central vacuole' },
    { name: 'Osmotic Potential', value: '-0.95', unit: 'MPa', description: 'Solute concentration gradient driving water inflow' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    const cellRoot = new THREE.Group();
    cellRoot.name = 'plantCellRoot';
    group.add(cellRoot);

    // 1. CELLULOSE CELL WALL (Cutaway hexagonal/prismatic box)
    // Front and top-front cutaway reveals internal organelles
    const wallShape = new THREE.Shape();
    // Prismatic plant cell outline
    wallShape.moveTo(-2.4, -1.5);
    wallShape.lineTo(2.4, -1.5);
    wallShape.lineTo(2.5, 1.5);
    wallShape.lineTo(-2.3, 1.6);
    wallShape.closePath();

    const wallExtrudeSettings = {
      depth: 3.4,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, wallExtrudeSettings);
    wallGeo.center();

    // Semi-translucent green cutaway material
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.82,
      metalness: 0.08,
      transparent: true,
      opacity: 0.42,
      wireframe: false,
    });
    const cellWall = new THREE.Mesh(wallGeo, wallMat);
    cellWall.name = 'cell-wall';
    cellWall.castShadow = !isSoftwareGl;
    cellRoot.add(cellWall);

    // Structural Cell Wall Edge Struts (Cellulose microfibrils)
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const strut1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 0.15), strutMat);
    strut1.position.set(0, 1.65, 1.7);
    const strut2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 0.15), strutMat);
    strut2.position.set(0, -1.65, 1.7);
    cellRoot.add(strut1, strut2);

    // 2. INNER PLASMA MEMBRANE & CYTOPLASM GEL
    const cytoGeo = new THREE.BoxGeometry(4.6, 3.0, 3.2);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: 0xbbf7d0,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22,
    });
    const cyto = new THREE.Mesh(cytoGeo, cytoMat);
    cyto.name = 'cytoplasm';
    cellRoot.add(cyto);

    // 3. LARGE CENTRAL VACUOLE (Turgid water reservoir with tonoplast)
    const vacGroup = new THREE.Group();
    vacGroup.name = 'central-vacuole';
    const vacGeo = new THREE.SphereGeometry(1.35, 28, 28);
    const vacMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.48,
    });
    const vacMesh = new THREE.Mesh(vacGeo, vacMat);
    vacMesh.scale.set(1.4, 0.95, 1.15);
    vacMesh.position.set(0.65, 0.1, -0.2);
    vacGroup.add(vacMesh);
    cellRoot.add(vacGroup);

    // 4. CELL NUCLEUS (with nuclear envelope pores & dense nucleolus)
    const nucGroup = new THREE.Group();
    nucGroup.name = 'nucleus';
    nucGroup.position.set(-0.7, 0.4, -0.6);

    const nucGeo = new THREE.SphereGeometry(0.72, 24, 24);
    const nucMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      roughness: 0.35,
      metalness: 0.2,
    });
    const nucMesh = new THREE.Mesh(nucGeo, nucMat);
    nucGroup.add(nucMesh);

    // Dense inner nucleolus (rRNA assembly site)
    const nucleolusGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x9f1239,
      emissiveIntensity: 0.3,
    });
    const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleolus.position.set(0.1, 0.1, 0.2);
    nucGroup.add(nucleolus);

    // Rough Endoplasmic Reticulum wrapping around nucleus
    const erMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    for (let r = 0; r < 3; r++) {
      const erLayer = new THREE.Mesh(
        new THREE.TorusGeometry(0.85 + r * 0.18, 0.06, 8, 24, Math.PI * 1.3),
        erMat
      );
      erLayer.rotation.x = Math.PI / 3 + r * 0.2;
      nucGroup.add(erLayer);
    }
    cellRoot.add(nucGroup);

    // 5. CHLOROPLASTS (Detailed photosynthetic double-membrane organelle with internal thylakoids)
    const chloroGroup = new THREE.Group();
    chloroGroup.name = 'chloroplastsGroup';

    const chloroMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.25,
      metalness: 0.2,
    });
    const thylakoidMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x15803d,
      emissiveIntensity: 0.2,
      roughness: 0.3,
    });

    const chloroLocations = [
      { pos: [-1.4, 0.7, 1.1], rot: [0.2, 0.4, -0.3], id: 'chloroplast-1' },
      { pos: [-1.7, -0.6, 0.8], rot: [-0.3, 0.2, 0.5], id: 'chloroplast-2' },
      { pos: [-0.2, 1.0, 1.2], rot: [0.4, -0.1, 0.2], id: 'chloroplast-3' },
      { pos: [1.6, 0.9, 1.0], rot: [-0.2, 0.5, -0.4], id: 'chloroplast-4' },
      { pos: [1.8, -0.6, 0.7], rot: [0.3, -0.3, 0.2], id: 'chloroplast-5' },
    ];

    chloroLocations.forEach((loc) => {
      const c = new THREE.Group();
      c.position.set(loc.pos[0], loc.pos[1], loc.pos[2]);
      c.rotation.set(loc.rot[0], loc.rot[1], loc.rot[2]);

      // Outer capsule hull
      const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.65, 10, 18), chloroMat);
      hull.name = 'chloroplast';
      c.add(hull);

      // Interior thylakoid grana discs
      for (let g = -2; g <= 2; g++) {
        const grana = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), thylakoidMat);
        grana.position.set(0, g * 0.12, 0.12);
        grana.rotation.x = Math.PI / 2;
        c.add(grana);
      }
      chloroGroup.add(c);
    });
    cellRoot.add(chloroGroup);

    // 6. MITOCHONDRIA (Energy factories with folded inner cristae)
    const mitoGroup = new THREE.Group();
    mitoGroup.name = 'mitochondriaGroup';
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.3,
      metalness: 0.25,
    });
    const cristaeMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      roughness: 0.4,
    });

    const mitoLocations = [
      { pos: [1.2, -0.25, 0.8], rot: [0.3, -0.5, 0.2] },
      { pos: [-0.8, -0.9, 0.5], rot: [-0.4, 0.3, -0.2] },
      { pos: [0.4, -0.9, 0.9], rot: [0.2, 0.4, 0.5] },
    ];

    mitoLocations.forEach((m) => {
      const mg = new THREE.Group();
      mg.position.set(m.pos[0], m.pos[1], m.pos[2]);
      mg.rotation.set(m.rot[0], m.rot[1], m.rot[2]);

      const mHull = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), mitoMat);
      mHull.name = 'mitochondria';
      mg.add(mHull);

      // Internal zigzag cristae
      for (let k = -2; k <= 2; k++) {
        const crista = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.12), cristaeMat);
        crista.position.set(0, k * 0.1, 0.08);
        mg.add(crista);
      }
      mitoGroup.add(mg);
    });
    cellRoot.add(mitoGroup);

    // 7. GOLGI APPARATUS (Folded secretion cisternae)
    const golgiGroup = new THREE.Group();
    const golgiMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    for (let i = 0; i < 4; i++) {
      const cisterna = new THREE.Mesh(
        new THREE.TorusGeometry(0.55 + i * 0.08, 0.05, 8, 20, Math.PI * 0.7),
        golgiMat
      );
      cisterna.position.set(-1.1, -0.2 + i * 0.1, -0.1);
      cisterna.rotation.set(0.4, 0.8, -0.3);
      golgiGroup.add(cisterna);
    }
    cellRoot.add(golgiGroup);

    // 8. MEANINGFUL PROCESS ANIMATION PARTICLES:
    // A. Photosynthesis Input & Output Streams (Sunlight Photons, CO₂, Glucose, O₂)
    // Input Stream (Yellow Photons & Blue H₂O molecules entering chloroplast)
    const photoInputCount = 45;
    const photoInGeo = new THREE.BufferGeometry();
    const photoInPos = new Float32Array(photoInputCount * 3);
    for (let i = 0; i < photoInputCount; i++) {
      photoInPos[i * 3] = -2.5 + Math.random() * 1.2;
      photoInPos[i * 3 + 1] = 1.6 - Math.random() * 1.0;
      photoInPos[i * 3 + 2] = 1.6 - Math.random() * 0.8;
    }
    photoInGeo.setAttribute('position', new THREE.BufferAttribute(photoInPos, 3));
    const photoInPoints = new THREE.Points(
      photoInGeo,
      new THREE.PointsMaterial({
        color: 0xfde047, // Sunlight photon energy
        size: 0.14,
        transparent: true,
        opacity: 0.9,
      })
    );
    photoInPoints.name = 'photosynthesis-inputs';
    cellRoot.add(photoInPoints);
    particleSystems.current.push(photoInPoints);

    // Output Stream (Glowing Glucose sugar crystals & Oxygen bubbles exiting chloroplast)
    const photoOutCount = 45;
    const photoOutGeo = new THREE.BufferGeometry();
    const photoOutPos = new Float32Array(photoOutCount * 3);
    for (let i = 0; i < photoOutCount; i++) {
      photoOutPos[i * 3] = -1.4 + (Math.random() - 0.5) * 0.8;
      photoOutPos[i * 3 + 1] = 0.7 + Math.random() * 1.2;
      photoOutPos[i * 3 + 2] = 1.1 + (Math.random() - 0.5) * 0.8;
    }
    photoOutGeo.setAttribute('position', new THREE.BufferAttribute(photoOutPos, 3));
    const photoOutPoints = new THREE.Points(
      photoOutGeo,
      new THREE.PointsMaterial({
        color: 0x67e8f9, // Glucose & O₂ gas bubbles
        size: 0.12,
        transparent: true,
        opacity: 0.85,
      })
    );
    photoOutPoints.name = 'photosynthesis-outputs';
    cellRoot.add(photoOutPoints);
    particleSystems.current.push(photoOutPoints);

    // B. Osmosis Water Inflow Particles (entering through cell wall into central vacuole)
    const osmosisCount = 50;
    const osmosisGeo = new THREE.BufferGeometry();
    const osmosisPos = new Float32Array(osmosisCount * 3);
    for (let i = 0; i < osmosisCount; i++) {
      osmosisPos[i * 3] = 2.4 - Math.random() * 1.8;
      osmosisPos[i * 3 + 1] = 0.2 + (Math.random() - 0.5) * 0.8;
      osmosisPos[i * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.8;
    }
    osmosisGeo.setAttribute('position', new THREE.BufferAttribute(osmosisPos, 3));
    const osmosisPoints = new THREE.Points(
      osmosisGeo,
      new THREE.PointsMaterial({
        color: 0x38bdf8, // H₂O Osmotic influx
        size: 0.1,
        transparent: true,
        opacity: 0.85,
      })
    );
    osmosisPoints.name = 'osmosis-water';
    cellRoot.add(osmosisPoints);
    particleSystems.current.push(osmosisPoints);

    // 9. DYNAMIC ANIMATION TICK: Cyclosis Cytoplasmic Streaming + Vacuole Turgor + Photosynthesis
    dynamicMeshes.current.push({
      mesh: cellRoot,
      update: (t) => {
        // Slow peaceful cellular rotation
        cellRoot.rotation.y = Math.sin(t * 0.08) * 0.15;

        // Hydrostatic Turgor Pressure breathing expansion of central vacuole
        const turgorPulse = 1.0 + Math.sin(t * 1.2) * 0.035;
        vacMesh.scale.set(1.4 * turgorPulse, 0.95 * turgorPulse, 1.15 * turgorPulse);

        // Cytoplasmic Cyclosis (Organelles and vesicles slowly drifting around central vacuole)
        chloroLocations.forEach((loc, idx) => {
          const cGroup = chloroGroup.children[idx];
          if (cGroup) {
            const streamAngle = t * 0.15 + idx * 1.25;
            cGroup.position.x = loc.pos[0] + Math.cos(streamAngle) * 0.12;
            cGroup.position.y = loc.pos[1] + Math.sin(streamAngle) * 0.08;
          }
        });

        // Photosynthesis Input Particles flowing inward towards chloroplast
        const inPos = photoInGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < photoInputCount; i++) {
          inPos[i * 3] += 0.015; // Move right toward chloroplast
          inPos[i * 3 + 1] -= 0.01; // Descend toward organelle
          if (inPos[i * 3] > -1.4) {
            inPos[i * 3] = -2.5 + Math.random() * 0.5;
            inPos[i * 3 + 1] = 1.6 - Math.random() * 0.4;
          }
        }
        photoInGeo.attributes.position.needsUpdate = true;

        // Photosynthesis Output Particles (Sugar & Oxygen floating into cytosol)
        const outPos = photoOutGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < photoOutCount; i++) {
          outPos[i * 3 + 1] += 0.018; // Ascend upward as O₂ gas & glucose
          outPos[i * 3] += Math.sin(t * 2 + i) * 0.005;
          if (outPos[i * 3 + 1] > 1.8) {
            outPos[i * 3 + 1] = 0.6 + Math.random() * 0.2;
            outPos[i * 3] = -1.4 + (Math.random() - 0.5) * 0.4;
          }
        }
        photoOutGeo.attributes.position.needsUpdate = true;

        // Osmosis Water Inflow (Moving from cell wall into vacuole)
        const osPos = osmosisGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < osmosisCount; i++) {
          osPos[i * 3] -= 0.018; // Inward toward center
          if (osPos[i * 3] < 0.6) {
            osPos[i * 3] = 2.4 - Math.random() * 0.3;
          }
        }
        osmosisGeo.attributes.position.needsUpdate = true;
      },
    });
  },
};
