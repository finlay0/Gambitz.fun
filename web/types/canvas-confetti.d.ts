declare module 'canvas-confetti' {
  export interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  export type ConfettiCallback = (options?: ConfettiOptions) => void;
  
  interface ConfettiFunction {
    (options?: ConfettiOptions): Promise<void>;
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean, useWorker?: boolean }) => ConfettiCallback;
    reset: () => void;
  }

  const confetti: ConfettiFunction;
  export default confetti;
} 