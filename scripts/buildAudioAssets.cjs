const https = require('https');
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio');
fs.mkdirSync(AUDIO_DIR, { recursive: true });

function fetchTts(text, lang = 'en') {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=' + encodeURIComponent(lang) + '&client=tw-ob';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function fetchFullTts(text, lang = 'en') {
  const clean = text.replace(/[*#_`]/g, '').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const buffers = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length > 130) {
      const words = trimmed.split(' ');
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).length > 120) {
          buffers.push(await fetchTts(cur.trim(), lang));
          cur = w;
        } else {
          cur = cur ? cur + ' ' + w : w;
        }
      }
      if (cur.trim()) buffers.push(await fetchTts(cur.trim(), lang));
    } else {
      buffers.push(await fetchTts(trimmed, lang));
    }
  }
  return Buffer.concat(buffers);
}

const AUDIO_MANIFEST = [
  {
    key: 'sound-test',
    text: 'Welcome to SmartClass AI! Educator audio and real-time lip sync are working perfectly for your lesson.'
  },
  {
    key: 'water-cycle-intro',
    text: "Hello, scientists! Welcome to SmartClass AI. Today, we are exploring the Earth's Water Cycle. Notice how the radiant energy from the Sun heats our lake, causing water molecules to evaporate into vapor, condense into clouds, and return as life-giving rain."
  },
  {
    key: 'water-cycle-overview',
    text: 'The Earth hydrological cycle is a continuous system powered by solar thermal radiation.'
  },
  {
    key: 'water-cycle-evaporation',
    text: 'Solar radiation transfers kinetic thermal energy into surface water, causing it to evaporate as water vapour.'
  },
  {
    key: 'water-cycle-condensation',
    text: 'As warm, humid air rises and cools to its dew point, water vapor condenses into clouds around microscopic aerosols.'
  },
  {
    key: 'water-cycle-precipitation',
    text: 'Condensed droplets grow until gravity overcomes updrafts, falling back to Earth as rain and snow.'
  },
  {
    key: 'water-cycle-collection',
    text: 'Precipitated water collects in rivers, lakes, oceans, and replenishes underground aquifers.'
  },
  {
    key: 'human-heart-intro',
    text: 'Welcome to Cardiology Lab! Here we examine the human heart, a muscular organ that beats over one hundred thousand times each day.'
  },
  {
    key: 'human-heart-overview',
    text: 'The human heart acts as a dual-action muscular pump circulating oxygenated and deoxygenated blood.'
  },
  {
    key: 'human-heart-atria',
    text: 'Deoxygenated blood enters the right atrium via the superior and inferior vena cava.'
  },
  {
    key: 'human-heart-ventricles',
    text: 'The strong muscular left ventricle contracts, pumping blood under high pressure through the aorta.'
  },
  {
    key: 'human-heart-circulation',
    text: 'Blood flows through pulmonary arteries into the lungs for gas exchange, picking up fresh oxygen.'
  },
  {
    key: 'solar-system-intro',
    text: 'Welcome to the Solar System exploration! Let us travel across our celestial neighborhood from the blazing Sun to the outer planets.'
  },
  {
    key: 'solar-system-overview',
    text: 'Our solar system consists of the central Sun and eight gravitationally bound planets in elliptical orbits.'
  },
  {
    key: 'solar-system-inner',
    text: 'Mercury, Venus, Earth, and Mars orbit closest to the Sun with solid silicates and metallic cores.'
  },
  {
    key: 'solar-system-gas-giants',
    text: 'Jupiter and Saturn contain massive hydrogen and helium atmospheres with extensive ring and moon systems.'
  },
  {
    key: 'plant-cell-intro',
    text: 'Welcome to Cellular Biology! Plant cells are eukaryotic structures equipped with rigid cellulose walls and chloroplasts.'
  },
  {
    key: 'plant-cell-overview',
    text: 'Plant cells have specialized rigid cell walls, chloroplasts for photosynthesis, and a large central vacuole.'
  },
  {
    key: 'plant-cell-chloroplast',
    text: 'Chloroplasts contain chlorophyll pigments that capture sunlight to convert carbon dioxide and water into glucose and oxygen.'
  },
  {
    key: 'plant-cell-nucleus',
    text: 'The nucleus houses chromatin and genomic DNA, regulating cellular protein synthesis and division.'
  },
  {
    key: 'volcano-intro',
    text: 'Welcome to Geology! Volcanoes are powerful geological vents where magma, gases, and ash break through the crust.'
  },
  {
    key: 'volcano-overview',
    text: 'Volcanoes are geological vents where molten rock, volcanic gases, and pyroclastic debris erupt to the surface.'
  },
  {
    key: 'volcano-chamber',
    text: 'Buoyant liquid magma accumulates beneath the crust under immense lithostatic pressure.'
  },
  {
    key: 'volcano-eruption',
    text: 'Gas expansion propels magma through the central vent, generating lava flows and ash plumes.'
  },
  {
    key: 'electric-circuit-intro',
    text: 'Welcome to Electric Circuitry! An electric circuit allows electrons to flow continuously through a closed loop.'
  },
  {
    key: 'electric-circuit-overview',
    text: 'An electric circuit is a closed loop of conductive material allowing continuous flow of electric charge.'
  },
  {
    key: 'electric-circuit-power',
    text: 'Chemical reactions in the battery produce a potential difference or voltage driving electron flow.'
  },
  {
    key: 'electric-circuit-load',
    text: 'Electrons collide with tungsten atoms in the filament, generating intense heat and visible photon emissions.'
  }
];

async function run() {
  console.log(`Starting speech audio generation for ${AUDIO_MANIFEST.length} items...`);
  for (const item of AUDIO_MANIFEST) {
    const filename = `${item.key}.mp3`;
    const targetPath = path.join(AUDIO_DIR, filename);
    if (fs.existsSync(targetPath)) {
      console.log(`✓ Exists: ${filename}`);
      continue;
    }
    try {
      const buf = await fetchFullTts(item.text, 'en');
      fs.writeFileSync(targetPath, buf);
      console.log(`✓ Created: ${filename} (${buf.length} bytes)`);
    } catch (e) {
      console.error(`✗ Error generating ${filename}:`, e.message);
    }
  }
  console.log('All speech audio assets successfully processed!');
}

run();
