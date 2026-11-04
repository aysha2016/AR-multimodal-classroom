/**
 * Pre-recorded high-fidelity MP3 speech audio mapping for zero-latency, 100% reliable
 * educator narration across all platforms (static GitHub Pages, mobile, Safari, and Cloud Run).
 */

export interface PreRecordedAudioItem {
  key: string;
  url: string;
  textSnippet: string;
}

export const PRE_RECORDED_AUDIO: Record<string, string> = {
  // Sound check
  'welcome to smartclass ai': './assets/audio/sound-test.mp3',
  'sound-test': './assets/audio/sound-test.mp3',

  // Water Cycle
  'water-cycle-intro': './assets/audio/water-cycle-intro.mp3',
  'water cycle': './assets/audio/water-cycle-intro.mp3',
  'the earth hydrological cycle is a continuous system': './assets/audio/water-cycle-overview.mp3',
  'water-cycle-overview': './assets/audio/water-cycle-overview.mp3',
  'solar radiation transfers kinetic thermal energy into surface water': './assets/audio/water-cycle-evaporation.mp3',
  'water-cycle-evaporation': './assets/audio/water-cycle-evaporation.mp3',
  'as warm, humid air rises and cools to its dew point': './assets/audio/water-cycle-condensation.mp3',
  'water-cycle-condensation': './assets/audio/water-cycle-condensation.mp3',
  'condensed droplets grow until gravity overcomes updrafts': './assets/audio/water-cycle-precipitation.mp3',
  'water-cycle-precipitation': './assets/audio/water-cycle-precipitation.mp3',
  'precipitated water collects in rivers': './assets/audio/water-cycle-collection.mp3',
  'water-cycle-collection': './assets/audio/water-cycle-collection.mp3',

  // Human Heart
  'human-heart-intro': './assets/audio/human-heart-intro.mp3',
  'welcome to cardiology lab': './assets/audio/human-heart-intro.mp3',
  'the human heart acts as a dual-action muscular pump': './assets/audio/human-heart-overview.mp3',
  'human-heart-overview': './assets/audio/human-heart-overview.mp3',
  'deoxygenated blood enters the right atrium': './assets/audio/human-heart-atria.mp3',
  'human-heart-atria': './assets/audio/human-heart-atria.mp3',
  'the strong muscular left ventricle contracts': './assets/audio/human-heart-ventricles.mp3',
  'human-heart-ventricles': './assets/audio/human-heart-ventricles.mp3',
  'blood flows through pulmonary arteries into the lungs': './assets/audio/human-heart-circulation.mp3',
  'human-heart-circulation': './assets/audio/human-heart-circulation.mp3',

  // Solar System
  'solar-system-intro': './assets/audio/solar-system-intro.mp3',
  'welcome to the solar system': './assets/audio/solar-system-intro.mp3',
  'our solar system consists of the central sun': './assets/audio/solar-system-overview.mp3',
  'solar-system-overview': './assets/audio/solar-system-overview.mp3',
  'mercury, venus, earth, and mars orbit closest to the sun': './assets/audio/solar-system-inner.mp3',
  'solar-system-inner': './assets/audio/solar-system-inner.mp3',
  'jupiter and saturn contain massive hydrogen': './assets/audio/solar-system-gas-giants.mp3',
  'solar-system-gas-giants': './assets/audio/solar-system-gas-giants.mp3',

  // Plant Cell
  'plant-cell-intro': './assets/audio/plant-cell-intro.mp3',
  'welcome to cellular biology': './assets/audio/plant-cell-intro.mp3',
  'plant cells have specialized rigid cell walls': './assets/audio/plant-cell-overview.mp3',
  'plant-cell-overview': './assets/audio/plant-cell-overview.mp3',
  'chloroplasts contain chlorophyll pigments': './assets/audio/plant-cell-chloroplast.mp3',
  'plant-cell-chloroplast': './assets/audio/plant-cell-chloroplast.mp3',
  'the nucleus houses chromatin and genomic dna': './assets/audio/plant-cell-nucleus.mp3',
  'plant-cell-nucleus': './assets/audio/plant-cell-nucleus.mp3',

  // Volcano
  'volcano-intro': './assets/audio/volcano-intro.mp3',
  'welcome to geology': './assets/audio/volcano-intro.mp3',
  'volcanoes are geological vents': './assets/audio/volcano-overview.mp3',
  'volcano-overview': './assets/audio/volcano-overview.mp3',
  'buoyant liquid magma accumulates beneath the crust': './assets/audio/volcano-chamber.mp3',
  'volcano-chamber': './assets/audio/volcano-chamber.mp3',
  'gas expansion propels magma through the central vent': './assets/audio/volcano-eruption.mp3',
  'volcano-eruption': './assets/audio/volcano-eruption.mp3',

  // Electric Circuit
  'electric-circuit-intro': './assets/audio/electric-circuit-intro.mp3',
  'welcome to electric circuitry': './assets/audio/electric-circuit-intro.mp3',
  'an electric circuit is a closed loop': './assets/audio/electric-circuit-overview.mp3',
  'electric-circuit-overview': './assets/audio/electric-circuit-overview.mp3',
  'chemical reactions in the battery produce a potential difference': './assets/audio/electric-circuit-power.mp3',
  'electric-circuit-power': './assets/audio/electric-circuit-power.mp3',
  'electrons collide with tungsten atoms in the filament': './assets/audio/electric-circuit-load.mp3',
  'electric-circuit-load': './assets/audio/electric-circuit-load.mp3',
};

/**
 * Finds matching pre-rendered MP3 audio file URL for any text or chapter ID.
 */
export function findPreRecordedAudioUrl(textOrKey: string): string | null {
  if (!textOrKey) return null;
  const clean = textOrKey.toLowerCase().trim();

  // 1. Direct key match
  if (PRE_RECORDED_AUDIO[clean]) {
    return PRE_RECORDED_AUDIO[clean];
  }

  // 2. Fuzzy text snippet match
  for (const [key, url] of Object.entries(PRE_RECORDED_AUDIO)) {
    if (clean.includes(key) || key.includes(clean.slice(0, 35))) {
      return url;
    }
  }

  return null;
}
