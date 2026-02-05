import type { Temperament } from "@/types";

export interface TemperamentPreset {
  id: string;
  name: string;
  description: string;
  values: Temperament;
}

export const TEMPERAMENT_PRESETS: TemperamentPreset[] = [
  {
    id: "melancholic",
    name: "Melancholic",
    description: "Thoughtful and reserved, with a reflective, cautious disposition",
    values: {
      valence: 25,
      energy: 30,
      warmth: 55,
      dominance: 30,
      stability: 35,
      autonomy: 45,
    },
  },
  {
    id: "joyful",
    name: "Joyful",
    description: "Upbeat and warm, radiating positivity and enthusiasm",
    values: {
      valence: 85,
      energy: 80,
      warmth: 80,
      dominance: 55,
      stability: 75,
      autonomy: 60,
    },
  },
  {
    id: "angry",
    name: "Angry",
    description: "Intense and forceful, with strong opinions and high drive",
    values: {
      valence: 30,
      energy: 85,
      warmth: 25,
      dominance: 90,
      stability: 20,
      autonomy: 75,
    },
  },
  {
    id: "haughty",
    name: "Haughty",
    description: "Confident and self-assured, with an air of authority and independence",
    values: {
      valence: 45,
      energy: 50,
      warmth: 20,
      dominance: 85,
      stability: 80,
      autonomy: 85,
    },
  },
];
