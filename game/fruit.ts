export type FruitType = "cherry" | "strawberry" | "orange" | "apple" | "melon" | "galaxian" | "bell" | "key";

export const FRUITS: Record<FruitType, { points: number; label: string; emoji: string }> = {
  cherry: { points: 100, label: "CHERRY", emoji: "🍒" },
  strawberry: { points: 300, label: "STRAWBERRY", emoji: "🍓" },
  orange: { points: 500, label: "ORANGE", emoji: "🍊" },
  apple: { points: 700, label: "APPLE", emoji: "🍎" },
  melon: { points: 1000, label: "MELON", emoji: "🍈" },
  galaxian: { points: 2000, label: "GALAXIAN", emoji: "🚀" },
  bell: { points: 3000, label: "BELL", emoji: "🔔" },
  key: { points: 5000, label: "KEY", emoji: "🗝️" },
};

/** Fruit used on a given level (classic arcade progression). Endless: level 13+ is always the key. */
export function fruitForLevel(level: number): FruitType {
  if (level <= 1) return "cherry";
  if (level === 2) return "strawberry";
  if (level <= 4) return "orange";
  if (level <= 6) return "apple";
  if (level <= 8) return "melon";
  if (level <= 10) return "galaxian";
  if (level <= 12) return "bell";
  return "key";
}

export interface FruitState { type: FruitType; x: number; y: number; msLeft: number; points: number }
