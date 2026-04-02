import GUI from 'lil-gui';

export interface LightingToggles {
  depthDarkening: boolean;
  waterSurface: boolean;
  godRays: boolean;
  fogGradient: boolean;
}

export interface ControlCallbacks {
  onDepthDarkening: (on: boolean) => void;
  onWaterSurface: (on: boolean) => void;
  onGodRays: (on: boolean) => void;
  onFogGradient: (on: boolean) => void;
}

export function createControls(callbacks: ControlCallbacks): LightingToggles {
  const params: LightingToggles = {
    depthDarkening: true,
    waterSurface: true,
    godRays: true,
    fogGradient: false,
  };

  const gui = new GUI({ title: 'Lighting Effects' });
  gui.domElement.style.display = 'none';

  gui.add(params, 'depthDarkening').name('Depth Darkening').onChange(callbacks.onDepthDarkening);
  gui.add(params, 'waterSurface').name('Water Surface').onChange(callbacks.onWaterSurface);
  gui.add(params, 'godRays').name('God Rays').onChange(callbacks.onGodRays);
  gui.add(params, 'fogGradient').name('Fog Gradient').onChange(callbacks.onFogGradient);

  return params;
}
