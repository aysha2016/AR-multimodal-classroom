import * as THREE from 'three';
import { SceneModule } from './WaterCycleScene';

export const HumanHeartScene: SceneModule = {
  id: 'human-heart',
  title: 'Human Heart: Cardiovascular Circulation & Internal Anatomy',
  defaultCameraPos: [0, 2.4, 7.2],
  defaultTarget: [0, 0.6, 0],
  stages: [
    {
      id: 'all',
      name: 'Complete Cardiac Cycle',
      description: 'Synchronized dual-circuit pumping cycle circulating blood through systemic and pulmonary loops at 72 BPM.',
      cameraPosition: [0, 2.4, 7.2],
      cameraTarget: [0, 0.6, 0],
    },
    {
      id: 'atrial-filling',
      name: '1. Atrial Filling & Diastole',
      description: 'Deoxygenated blood enters the Right Atrium via the Vena Cava while oxygenated blood enters the Left Atrium via Pulmonary Veins.',
      cameraPosition: [1.8, 2.6, 5.0],
      cameraTarget: [0.6, 1.2, 0.2],
    },
    {
      id: 'ventricular-systole',
      name: '2. Ventricular Systole (Contraction)',
      description: 'The thick muscular ventricles contract powerfully, closing the AV valves (lub) and generating peak systolic pressure.',
      cameraPosition: [-1.6, 1.4, 4.8],
      cameraTarget: [-0.4, 0.3, 0.2],
    },
    {
      id: 'systemic-ejection',
      name: '3. Aortic & Pulmonary Ejection',
      description: 'Oxygenated blood surges into systemic circulation via the Aorta arch while deoxygenated blood is pumped to the lungs.',
      cameraPosition: [0.2, 3.8, 4.6],
      cameraTarget: [0, 1.6, 0],
    },
    {
      id: 'cutaway-valves',
      name: '4. Internal Valves & Chambers',
      description: 'Cutaway view showing the Tricuspid, Mitral, Pulmonary, and Aortic valves preventing backward flow.',
      cameraPosition: [0, 1.6, 4.2],
      cameraTarget: [0, 0.5, 0],
    },
  ],
  labels: [
    {
      id: 'left-ventricle',
      name: 'Left Ventricle',
      position: [-0.75, 0.35, 0.65],
      cameraPosition: [-1.8, 1.2, 4.2],
      shortExplanation: 'Thick muscular chamber pumping oxygenated blood into the high-pressure systemic aorta.',
      detailedExplanation: 'Has 3x the myocardial wall thickness of the right ventricle, generating 120 mmHg of hydrostatic pressure to propel blood through the entire body.',
      scienceFormula: 'P_systolic ≈ 120 mmHg | Stroke Vol ≈ 70 mL',
      accentColor: '#ef4444',
      category: 'Systemic Pumping Chamber',
    },
    {
      id: 'right-ventricle',
      name: 'Right Ventricle',
      position: [0.72, 0.42, 0.68],
      cameraPosition: [1.8, 1.2, 4.2],
      shortExplanation: 'Pumps deoxygenated blood under low pressure into the pulmonary trunk towards the lungs.',
      detailedExplanation: 'Operates at approximately 25 mmHg systolic pressure to circulate blood through fragile alveolar capillary networks without pulmonary edema.',
      scienceFormula: 'P_pulmonary ≈ 25 mmHg',
      accentColor: '#3b82f6',
      category: 'Pulmonary Pumping Chamber',
    },
    {
      id: 'aorta',
      name: 'Aortic Arch',
      position: [0.15, 2.5, 0.35],
      cameraPosition: [0.3, 3.2, 3.6],
      shortExplanation: 'Main systemic artery delivering oxygen-rich blood to the brain, heart, and body.',
      detailedExplanation: 'Elastic tunica media smooths systolic pulses via the Windkessel effect. Branches into brachiocephalic, left common carotid, and left subclavian arteries.',
      scienceFormula: 'Cardiac Output Q = HR × SV ≈ 5.0 L/min',
      accentColor: '#dc2626',
      category: 'Great Systemic Vessel',
    },
    {
      id: 'pulmonary-artery',
      name: 'Pulmonary Trunk & Valve',
      position: [-0.25, 1.9, 0.85],
      cameraPosition: [-0.8, 2.4, 3.4],
      shortExplanation: 'Branches into left and right pulmonary arteries carrying deoxygenated blood to the lungs.',
      detailedExplanation: 'Exits the right ventricle through the semilunar pulmonary valve, bifurcating beneath the aortic arch into bilateral pulmonary arterial branches.',
      scienceFormula: 'Deoxygenated PO₂ ≈ 40 mmHg',
      accentColor: '#2563eb',
      category: 'Pulmonary Arterial Trunk',
    },
    {
      id: 'right-atrium',
      name: 'Right Atrium & Vena Cava',
      position: [1.35, 1.55, 0.4],
      cameraPosition: [2.5, 2.0, 3.5],
      shortExplanation: 'Receives deoxygenated venous blood returning from superior and inferior vena cava.',
      detailedExplanation: 'Contains the sinoatrial (SA) node (the heart natural pacemaker). Contracts in late diastole to top off right ventricular volume.',
      scienceFormula: 'Central Venous Pressure ≈ 2–6 mmHg',
      accentColor: '#1d4ed8',
      category: 'Venous Receiving Chamber',
    },
    {
      id: 'left-atrium',
      name: 'Left Atrium & Mitral Valve',
      position: [-1.15, 1.6, -0.35],
      cameraPosition: [-2.2, 2.0, 3.2],
      shortExplanation: 'Receives oxygen-rich blood from four pulmonary veins and funnels it through the mitral valve.',
      detailedExplanation: 'Smooth-walled chamber receiving arterialized blood from the lungs. Bicuspid (mitral) valve flaps prevent regurgitation back into the atrium during systole.',
      scienceFormula: 'Oxygenated SaO₂ ≈ 98–100%',
      accentColor: '#b91c1c',
      category: 'Arterial Receiving Chamber',
    },
    {
      id: 'septum',
      name: 'Interventricular Septum',
      position: [0.0, 0.25, 0.45],
      cameraPosition: [0, 1.2, 3.4],
      shortExplanation: 'Muscular wall separating left and right ventricles, preventing mixing of blood.',
      detailedExplanation: 'Houses the Bundle of His and Purkinje conduction fibers, transmitting the electrical depolarization wave from the AV node to cardiac apex.',
      scienceFormula: 'Conduction Velocity ≈ 2–4 m/s',
      accentColor: '#fbbf24',
      category: 'Conduction & Separation',
    },
  ],
  scientificParameters: [
    { name: 'Heart Rate', value: '72', unit: 'BPM', description: 'Resting sinoatrial nodal frequency' },
    { name: 'Stroke Volume', value: '70', unit: 'mL', description: 'Volume ejected per ventricular contraction' },
    { name: 'Cardiac Output', value: '5.04', unit: 'L/min', description: 'Total blood volume circulated per minute' },
    { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', description: 'Systemic arterial systolic over diastolic pressure' },
    { name: 'Pulmonary Pressure', value: '25/10', unit: 'mmHg', description: 'Low-resistance pulmonary circuit pressure' },
  ],
  build: (group, dynamicMeshes, particleSystems, isSoftwareGl) => {
    const heartRoot = new THREE.Group();
    heartRoot.name = 'anatomicalHeart';
    group.add(heartRoot);

    // Primary Myocardial Ventricle Group (Pulsates rhythmically)
    const ventriclesGroup = new THREE.Group();
    ventriclesGroup.name = 'ventriclesGroup';
    heartRoot.add(ventriclesGroup);

    // 1. ANATOMICAL LEFT VENTRICLE (Thick Muscular Myocardium with Cutaway Window)
    const lvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, 1.1, 0),
      new THREE.Vector3(-0.85, 0.4, 0.2),
      new THREE.Vector3(-0.55, -0.6, 0.1),
      new THREE.Vector3(-0.1, -1.2, 0.0), // Cardiac apex
    ]);
    const lvGeo = new THREE.TubeGeometry(lvCurve, 28, 0.95, 20, false);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.32,
      metalness: 0.18,
    });
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.name = 'left-ventricle';
    lvMesh.castShadow = !isSoftwareGl;
    ventriclesGroup.add(lvMesh);

    // Interior Left Ventricular Cavity (Bright red oxygenated interior visible via cutaway)
    const lvCavityGeo = new THREE.ConeGeometry(0.72, 1.7, 24);
    const lvCavityMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.25,
      side: THREE.DoubleSide,
    });
    const lvCavity = new THREE.Mesh(lvCavityGeo, lvCavityMat);
    lvCavity.rotation.z = Math.PI * 0.92;
    lvCavity.position.set(-0.45, 0.05, 0.25);
    ventriclesGroup.add(lvCavity);

    // 2. ANATOMICAL RIGHT VENTRICLE (Venous blue anterior chamber)
    const rvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, 1.0, 0.2),
      new THREE.Vector3(0.85, 0.4, 0.4),
      new THREE.Vector3(0.65, -0.4, 0.3),
      new THREE.Vector3(0.05, -1.05, 0.05),
    ]);
    const rvGeo = new THREE.TubeGeometry(rvCurve, 28, 0.78, 20, false);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.38,
      metalness: 0.2,
    });
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.name = 'right-ventricle';
    rvMesh.castShadow = !isSoftwareGl;
    ventriclesGroup.add(rvMesh);

    // 3. INTERVENTRICULAR SEPTUM (Central dividing muscular wall)
    const septumGeo = new THREE.BoxGeometry(0.32, 2.0, 1.4);
    const septumMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.45,
      metalness: 0.15,
    });
    const septum = new THREE.Mesh(septumGeo, septumMat);
    septum.name = 'septum';
    septum.position.set(-0.05, -0.05, 0.1);
    septum.rotation.z = 0.08;
    ventriclesGroup.add(septum);

    // 4. RIGHT ATRIUM & SUPERIOR/INFERIOR VENA CAVA
    const raGroup = new THREE.Group();
    raGroup.name = 'right-atrium';
    const raGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const raMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.25,
    });
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.position.set(1.15, 1.4, 0.2);
    raMesh.scale.set(1.05, 1.1, 0.95);
    raGroup.add(raMesh);

    // Superior Vena Cava (Blue inlet pipe bringing blood from upper body)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.15, 1.4, 0.2),
      new THREE.Vector3(1.25, 2.4, 0.15),
      new THREE.Vector3(1.2, 3.2, 0.1),
    ]);
    const svcMesh = new THREE.Mesh(
      new THREE.TubeGeometry(svcCurve, 20, 0.32, 16, false),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
    );
    raGroup.add(svcMesh);

    // Inferior Vena Cava (bringing blood from abdominal/lower body)
    const ivcMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.32, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 })
    );
    ivcMesh.position.set(1.1, 0.1, -0.2);
    raGroup.add(ivcMesh);
    heartRoot.add(raGroup);

    // 5. LEFT ATRIUM & PULMONARY VEINS (Oxygen-rich venous return from lungs)
    const laGroup = new THREE.Group();
    laGroup.name = 'left-atrium';
    const laGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const laMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
      metalness: 0.25,
    });
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.position.set(-0.95, 1.5, -0.3);
    laGroup.add(laMesh);

    // 4 Pulmonary Veins (Left & Right pairs)
    const pvMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
    [
      [-1.6, 1.6, -0.5],
      [-1.5, 1.2, -0.6],
      [0.6, 1.7, -0.7],
      [0.7, 1.3, -0.8],
    ].forEach((pos) => {
      const pv = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 12), pvMat);
      pv.position.set(pos[0], pos[1], pos[2]);
      pv.rotation.z = Math.PI / 4;
      laGroup.add(pv);
    });
    heartRoot.add(laGroup);

    // 6. AORTA ARCH & SYSTEMIC BRANCHES
    const aortaGroup = new THREE.Group();
    aortaGroup.name = 'aorta';
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 1.2, 0.1), // LV root
      new THREE.Vector3(-0.15, 2.3, 0.3),
      new THREE.Vector3(0.35, 2.85, 0.1),
      new THREE.Vector3(0.85, 2.45, -0.25),
      new THREE.Vector3(0.95, 1.0, -0.4), // Descending thoracic aorta
      new THREE.Vector3(0.9, -0.5, -0.45),
    ]);
    const aortaMesh = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 40, 0.44, 20, false),
      new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.25,
        metalness: 0.3,
      })
    );
    aortaMesh.castShadow = !isSoftwareGl;
    aortaGroup.add(aortaMesh);

    // 3 Head & Neck Brachiocephalic/Carotid Arteries
    const branchMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
    const branchOffsets = [
      { pos: [0.05, 2.7, 0.2], h: 1.0, rot: 0.15 },
      { pos: [0.3, 2.85, 0.05], h: 0.9, rot: 0.05 },
      { pos: [0.55, 2.75, -0.1], h: 0.85, rot: -0.1 },
    ];
    branchOffsets.forEach((b) => {
      const art = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, b.h, 12), branchMat);
      art.position.set(b.pos[0], b.pos[1] + b.h * 0.45, b.pos[2]);
      art.rotation.z = b.rot;
      aortaGroup.add(art);
    });
    heartRoot.add(aortaGroup);

    // 7. PULMONARY TRUNK & BILATERAL ARTERIES
    const paGroup = new THREE.Group();
    paGroup.name = 'pulmonary-artery';
    const paCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.25, 1.0, 0.45), // RV outflow root
      new THREE.Vector3(-0.05, 1.8, 0.65),
      new THREE.Vector3(-0.25, 2.2, 0.45), // Bifurcation
    ]);
    const paMesh = new THREE.Mesh(
      new THREE.TubeGeometry(paCurve, 24, 0.38, 18, false),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.3,
        metalness: 0.25,
      })
    );
    paGroup.add(paMesh);

    // Left and Right Pulmonary Arteries branching out under aortic arch
    const rpaMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 1.8, 14),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 })
    );
    rpaMesh.position.set(0.7, 2.15, -0.1);
    rpaMesh.rotation.z = -Math.PI / 2.3;
    paGroup.add(rpaMesh);

    const lpaMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 1.6, 14),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 })
    );
    lpaMesh.position.set(-1.1, 2.15, 0.1);
    lpaMesh.rotation.z = Math.PI / 2.2;
    paGroup.add(lpaMesh);
    heartRoot.add(paGroup);

    // 8. CORONARY BLOOD VESSELS (Branching surface vasculature)
    const coronaryCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 1.4, 0.7),
      new THREE.Vector3(-0.15, 0.6, 0.8),
      new THREE.Vector3(-0.2, -0.2, 0.6),
      new THREE.Vector3(-0.1, -0.9, 0.2),
    ]);
    const lada = new THREE.Mesh(
      new THREE.TubeGeometry(coronaryCurve1, 20, 0.06, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.2 })
    );
    ventriclesGroup.add(lada);

    // 9. ANIMATED BLOOD CIRCULATION PARTICLES
    // Blue Deoxygenated Flow Pathway (SVC/IVC -> RA -> RV -> Pulmonary Trunk)
    const bluePathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.2, 3.2, 0.1),
      new THREE.Vector3(1.2, 1.8, 0.2),
      new THREE.Vector3(1.0, 1.2, 0.2),
      new THREE.Vector3(0.5, 0.8, 0.4), // Through tricuspid
      new THREE.Vector3(0.65, 0.2, 0.4), // Right ventricle
      new THREE.Vector3(0.3, 0.8, 0.5),
      new THREE.Vector3(-0.05, 1.8, 0.65), // Pulmonary trunk
      new THREE.Vector3(-1.4, 2.2, 0.1), // To lungs
    ]);

    const blueCount = 80;
    const blueGeo = new THREE.BufferGeometry();
    const bluePos = new Float32Array(blueCount * 3);
    for (let i = 0; i < blueCount; i++) {
      const p = bluePathCurve.getPoint(i / blueCount);
      bluePos[i * 3] = p.x;
      bluePos[i * 3 + 1] = p.y;
      bluePos[i * 3 + 2] = p.z;
    }
    blueGeo.setAttribute('position', new THREE.BufferAttribute(bluePos, 3));
    const bluePoints = new THREE.Points(
      blueGeo,
      new THREE.PointsMaterial({
        color: 0x60a5fa,
        size: 0.16,
        transparent: true,
        opacity: 0.95,
      })
    );
    bluePoints.name = 'blood-deoxygenated';
    heartRoot.add(bluePoints);
    particleSystems.current.push(bluePoints);

    // Red Oxygenated Flow Pathway (Pulmonary Veins -> LA -> Mitral -> LV -> Aorta Arch -> Systemic)
    const redPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.6, 1.6, -0.5), // From lungs
      new THREE.Vector3(-0.95, 1.5, -0.3), // Left atrium
      new THREE.Vector3(-0.6, 0.9, 0.0), // Through mitral
      new THREE.Vector3(-0.55, 0.1, 0.2), // Left ventricle
      new THREE.Vector3(-0.15, -0.6, 0.1), // Apex turn
      new THREE.Vector3(-0.2, 1.2, 0.1), // Outflow through aortic valve
      new THREE.Vector3(-0.15, 2.3, 0.3),
      new THREE.Vector3(0.35, 2.85, 0.1), // Aorta arch
      new THREE.Vector3(0.9, -0.5, -0.45), // Systemic descending
    ]);

    const redCount = 95;
    const redGeo = new THREE.BufferGeometry();
    const redPos = new Float32Array(redCount * 3);
    for (let i = 0; i < redCount; i++) {
      const p = redPathCurve.getPoint(i / redCount);
      redPos[i * 3] = p.x;
      redPos[i * 3 + 1] = p.y;
      redPos[i * 3 + 2] = p.z;
    }
    redGeo.setAttribute('position', new THREE.BufferAttribute(redPos, 3));
    const redPoints = new THREE.Points(
      redGeo,
      new THREE.PointsMaterial({
        color: 0xf87171,
        size: 0.18,
        transparent: true,
        opacity: 0.95,
      })
    );
    redPoints.name = 'blood-oxygenated';
    heartRoot.add(redPoints);
    particleSystems.current.push(redPoints);

    // 10. REALISTIC 72 BPM CARDIAC CONTRACTION & ROTATION ANIMATION (Systole + Diastole)
    dynamicMeshes.current.push({
      mesh: heartRoot,
      update: (t) => {
        // Heart rate: 72 BPM => 1.2 Hz (period = 0.833 s)
        const heartPeriod = 0.833;
        const phase = (t % heartPeriod) / heartPeriod;

        // Wiggers cycle representation:
        // 0.0 - 0.15: Atrial systole
        // 0.15 - 0.45: Isovolumetric contraction & Ventricular Systole (Ejection)
        // 0.45 - 1.0: Isovolumetric relaxation & Ventricular Diastole (Filling)
        let ventricularContraction = 0;
        let atrialContraction = 0;

        if (phase < 0.15) {
          // Atrial systole: Atria contract slightly
          atrialContraction = Math.sin((phase / 0.15) * Math.PI) * 0.12;
        } else if (phase >= 0.15 && phase < 0.45) {
          // Ventricular systole: Ventricles contract forcefully, wringing motion
          const systolePhase = (phase - 0.15) / 0.3;
          ventricularContraction = Math.sin(systolePhase * Math.PI) * 0.22;
        }

        // Ventricles wring and contract (shortening along Y and squeezing X/Z)
        const vScaleX = 1.0 - ventricularContraction * 0.75;
        const vScaleY = 1.0 - ventricularContraction * 0.85;
        const vScaleZ = 1.0 - ventricularContraction * 0.7;
        ventriclesGroup.scale.set(vScaleX, vScaleY, vScaleZ);
        ventriclesGroup.rotation.y = Math.sin(t * 7.54) * 0.06; // Apex wringing torsion

        // Atria pulsate in counter-phase
        const aScale = 1.0 - atrialContraction;
        raGroup.scale.set(aScale, aScale, aScale);
        laGroup.scale.set(aScale, aScale, aScale);

        // Aorta elastance pulse (Windkessel dilation following systolic ejection)
        const aortaDilation = phase > 0.25 && phase < 0.5 ? Math.sin((phase - 0.25) * 4 * Math.PI) * 0.08 : 0;
        aortaGroup.scale.set(1.0 + aortaDilation, 1.0, 1.0 + aortaDilation);

        // Circulation Particle Wave Movement along Catheter Pathways
        const bPos = blueGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < blueCount; i++) {
          const u = ((i / blueCount) + t * 0.65) % 1.0;
          const p = bluePathCurve.getPoint(u);
          bPos[i * 3] = p.x;
          bPos[i * 3 + 1] = p.y;
          bPos[i * 3 + 2] = p.z;
        }
        blueGeo.attributes.position.needsUpdate = true;

        const rPos = redGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < redCount; i++) {
          const u = ((i / redCount) + t * 0.72) % 1.0;
          const p = redPathCurve.getPoint(u);
          rPos[i * 3] = p.x;
          rPos[i * 3 + 1] = p.y;
          rPos[i * 3 + 2] = p.z;
        }
        redGeo.attributes.position.needsUpdate = true;
      },
    });
  },
};
