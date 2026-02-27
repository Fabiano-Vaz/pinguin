export const LayerIds = {
  Background: 'background',
  Environment: 'environment',
  Actor: 'actor',
  Overlay: 'overlay',
} as const;

export type LayerId = (typeof LayerIds)[keyof typeof LayerIds];
