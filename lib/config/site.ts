export const AREAS = [
  {
    code: "tokyo",
    name: "東京",
    isEnabled: true,
  },
] as const;

export const CATEGORIES = [
  {
    code: "souzoku-houki",
    name: "相続放棄",
    isEnabled: true,
  },
] as const;

export function isValidArea(area: string) {
  return AREAS.some((item) => item.code === area && item.isEnabled);
}

export function isValidCategory(category: string) {
  return CATEGORIES.some((item) => item.code === category && item.isEnabled);
}

export function getAreaName(area: string) {
  return AREAS.find((item) => item.code === area)?.name ?? area;
}

export function getCategoryName(category: string) {
  return CATEGORIES.find((item) => item.code === category)?.name ?? category;
}