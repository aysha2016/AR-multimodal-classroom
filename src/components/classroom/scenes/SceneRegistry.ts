import { SceneModule, SceneStage, WaterCycleScene } from './WaterCycleScene';
export type { SceneModule, SceneStage };
import { HumanHeartScene } from './HumanHeartScene';
import { SolarSystemScene } from './SolarSystemScene';
import { PlantCellScene } from './PlantCellScene';
import { VolcanoScene } from './VolcanoScene';
import { ElectricCircuitScene } from './ElectricCircuitScene';

export const SCENE_MODULES: Record<string, SceneModule> = {
  'water-cycle': WaterCycleScene,
  'human-heart': HumanHeartScene,
  'heart': HumanHeartScene,
  'solar-system': SolarSystemScene,
  'plant-cell': PlantCellScene,
  'volcano': VolcanoScene,
  'electric-circuit': ElectricCircuitScene,
  'circuit': ElectricCircuitScene,
};

export function getSceneModule(id: string): SceneModule {
  if (SCENE_MODULES[id]) {
    return SCENE_MODULES[id];
  }
  // Try matching by lesson id or sceneType
  const key = Object.keys(SCENE_MODULES).find(
    (k) => id.toLowerCase().includes(k) || k.includes(id.toLowerCase())
  );
  if (key && SCENE_MODULES[key]) {
    return SCENE_MODULES[key];
  }
  return WaterCycleScene;
}
