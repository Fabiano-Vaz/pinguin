import Phaser from 'phaser';
import type { RuntimeConfig, RuntimeEventApi, RuntimeEventHandler } from '../../runtime/types';

type ConnectedRuntime = RuntimeConfig &
  RuntimeEventApi & {
    isSnowing?: boolean;
    isRaining?: boolean;
  };

export class UIScene extends Phaser.Scene {
  private runtime?: ConnectedRuntime;

  private snowManager?: Phaser.GameObjects.Particles.ParticleEmitter;
  private rainManager?: Phaser.GameObjects.Particles.ParticleEmitter;
  private speechLabel?: Phaser.GameObjects.Text;
  private speechTimeout?: Phaser.Time.TimerEvent;
  private weatherTick?: Phaser.Time.TimerEvent;
  private weatherCooldown?: Phaser.Time.TimerEvent;
  private rainStormTick?: Phaser.Time.TimerEvent;
  private weatherType: 'snow' | 'rain' | null = null;

  private onSpeechShow?: RuntimeEventHandler<'ui:speech:show'>;
  private onClickEffect?: RuntimeEventHandler<'effects:click'>;
  private onSnowBurst?: RuntimeEventHandler<'effects:snow:burst'>;
  private onFlash?: RuntimeEventHandler<'effects:lightning:flash'>;
  private onBolt?: RuntimeEventHandler<'effects:lightning:bolt'>;
  private onWind?: RuntimeEventHandler<'effects:wind:gust'>;
  private onStartSnow?: RuntimeEventHandler<'effects:weather:start-snow'>;
  private onStartRain?: RuntimeEventHandler<'effects:weather:start-rain'>;
  private boundWindowKeydown?: (event: KeyboardEvent) => void;
  private onDebugSnowKey?: () => void;
  private onDebugRainKey?: () => void;
  private static readonly WEATHER_VIEWPORT = {
    minXPercent: -0.03,
    maxXPercent: 1.03,
    minYPercent: -0.04,
    maxYPercent: 0.01,
  } as const;

  constructor() {
    super('framework:ui');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
    this.runtime = (window.PINGUIN_RUNTIME ?? window.PenguinPet?.runtime ?? {}) as ConnectedRuntime;
    this.createParticleTexture();
    this.createEmitters();
    this.refreshEmitAreas();
    this.bindRuntimeEvents();
    this.bindDebugShortcuts();
    this.startSnowCycle();
    this.time.delayedCall(0, () => this.scene.bringToTop('framework:ui'));
    this.scale.on(Phaser.Scale.Events.RESIZE, this.refreshEmitAreas, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unbindRuntimeEvents();
      this.unbindDebugShortcuts();
      this.weatherTick?.destroy();
      this.weatherCooldown?.destroy();
      this.rainStormTick?.destroy();
      this.speechTimeout?.destroy();
      this.scale.off(Phaser.Scale.Events.RESIZE, this.refreshEmitAreas, this);
    });
  }

  private bindDebugShortcuts(): void {
    this.onDebugSnowKey = () => this.startSnowCycle();
    this.onDebugRainKey = () => this.startRainCycle();
    this.input.keyboard?.on('keydown-N', this.onDebugSnowKey);
    this.input.keyboard?.on('keydown-C', this.onDebugRainKey);

    // Fallback for contexts where Phaser keyboard focus is inconsistent (e.g., extension webview).
    this.boundWindowKeydown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === 'n') this.startSnowCycle();
      if (key === 'c') this.startRainCycle();
    };
    window.addEventListener('keydown', this.boundWindowKeydown);
  }

  private unbindDebugShortcuts(): void {
    if (this.onDebugSnowKey) this.input.keyboard?.off('keydown-N', this.onDebugSnowKey);
    if (this.onDebugRainKey) this.input.keyboard?.off('keydown-C', this.onDebugRainKey);
    this.onDebugSnowKey = undefined;
    this.onDebugRainKey = undefined;
    if (this.boundWindowKeydown) {
      window.removeEventListener('keydown', this.boundWindowKeydown);
      this.boundWindowKeydown = undefined;
    }
  }

  private createParticleTexture(): void {
    if (this.textures.exists('ui-dot')) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('ui-dot', 8, 8);
    g.destroy();
  }

  private createEmitters(): void {
    const weatherViewport = this.getWeatherViewportBounds();

    this.snowManager = this.add.particles(0, 0, 'ui-dot', {
      x: { min: weatherViewport.minX, max: weatherViewport.maxX },
      y: { min: weatherViewport.minY, max: weatherViewport.maxY },
      speedY: { min: 55, max: 120 },
      speedX: { min: -8, max: 8 },
      scale: { start: 0.6, end: 0.2 },
      lifespan: this.getSnowLifespan(),
      quantity: 0,
      blendMode: 'ADD',
      alpha: { start: 0.9, end: 0.35 },
      emitting: false,
    });
    this.snowManager.setDepth(995);

    this.rainManager = this.add.particles(0, 0, 'ui-dot', {
      x: { min: weatherViewport.minX, max: weatherViewport.maxX },
      y: { min: weatherViewport.minY, max: weatherViewport.maxY },
      speedY: { min: 650, max: 980 },
      speedX: { min: -90, max: -40 },
      scaleX: { start: 0.15, end: 0.1 },
      scaleY: { start: 1.1, end: 0.25 },
      tint: 0x8fc8ff,
      lifespan: this.getRainLifespan(),
      quantity: 0,
      alpha: { start: 0.65, end: 0.18 },
      emitting: false,
    });
    this.rainManager.setDepth(995);
  }

  private refreshEmitAreas(): void {
    const weatherViewport = this.getWeatherViewportBounds();
    this.snowManager?.updateConfig({
      x: { min: weatherViewport.minX, max: weatherViewport.maxX },
      y: { min: weatherViewport.minY, max: weatherViewport.maxY },
      lifespan: this.getSnowLifespan(),
    });
    this.rainManager?.updateConfig({
      x: { min: weatherViewport.minX, max: weatherViewport.maxX },
      y: { min: weatherViewport.minY, max: weatherViewport.maxY },
      lifespan: this.getRainLifespan(),
    });
  }

  private getWeatherViewportBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    const width = Math.max(1, this.scale.width);
    const height = Math.max(1, this.scale.height);
    const viewport = UIScene.WEATHER_VIEWPORT;

    return {
      minX: Math.round(width * viewport.minXPercent),
      maxX: Math.round(width * viewport.maxXPercent),
      minY: Math.round(height * viewport.minYPercent),
      maxY: Math.round(height * viewport.maxYPercent),
    };
  }

  private getSnowLifespan(): number {
    // Enough lifetime for flakes to cross the full viewport on small and large canvases.
    return Math.max(7000, Math.round(this.scale.height * 10.5));
  }

  private getRainLifespan(): number {
    // Rain falls faster than snow; keep proportional to viewport height.
    return Math.max(1200, Math.round(this.scale.height * 1.8));
  }

  private bindRuntimeEvents(): void {
    if (!this.runtime || typeof this.runtime.onEvent !== 'function') return;

    this.onSpeechShow = (payload) => this.showSpeech(payload.text, payload.x, payload.y, payload.durationMs);
    this.onClickEffect = (payload) => this.emitClickEffect(payload.x, payload.y);
    this.onSnowBurst = (payload) => this.emitSnowBurst(payload.x, payload.y, payload.count);
    this.onFlash = () => this.createLightningFlash();
    this.onBolt = (payload) => this.createLightningBolt(payload.x);
    this.onWind = (payload) => this.createWindGust(payload.direction);
    this.onStartSnow = () => this.startSnowCycle();
    this.onStartRain = () => this.startRainCycle();

    this.runtime.onEvent('ui:speech:show', this.onSpeechShow);
    this.runtime.onEvent('effects:click', this.onClickEffect);
    this.runtime.onEvent('effects:snow:burst', this.onSnowBurst);
    this.runtime.onEvent('effects:lightning:flash', this.onFlash);
    this.runtime.onEvent('effects:lightning:bolt', this.onBolt);
    this.runtime.onEvent('effects:wind:gust', this.onWind);
    this.runtime.onEvent('effects:weather:start-snow', this.onStartSnow);
    this.runtime.onEvent('effects:weather:start-rain', this.onStartRain);
  }

  private unbindRuntimeEvents(): void {
    if (!this.runtime || typeof this.runtime.offEvent !== 'function') return;
    if (this.onSpeechShow) this.runtime.offEvent('ui:speech:show', this.onSpeechShow);
    if (this.onClickEffect) this.runtime.offEvent('effects:click', this.onClickEffect);
    if (this.onSnowBurst) this.runtime.offEvent('effects:snow:burst', this.onSnowBurst);
    if (this.onFlash) this.runtime.offEvent('effects:lightning:flash', this.onFlash);
    if (this.onBolt) this.runtime.offEvent('effects:lightning:bolt', this.onBolt);
    if (this.onWind) this.runtime.offEvent('effects:wind:gust', this.onWind);
    if (this.onStartSnow) this.runtime.offEvent('effects:weather:start-snow', this.onStartSnow);
    if (this.onStartRain) this.runtime.offEvent('effects:weather:start-rain', this.onStartRain);
  }

  private showSpeech(text: string, x: number, y: number, durationMs = 2400): void {
    if (!text) return;
    this.speechLabel?.destroy();
    this.speechTimeout?.destroy();

    this.speechLabel = this.add
      .text(x, y - 16, text, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#21303f',
        backgroundColor: '#ffffff',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5, 1)
      .setDepth(999);

    this.speechTimeout = this.time.delayedCall(durationMs, () => {
      this.speechLabel?.destroy();
      this.speechLabel = undefined;
    });
  }

  private emitClickEffect(x: number, y: number): void {
    this.add.circle(x, y, 8, 0xffffff, 0.7).setDepth(998);
    this.tweens.add({
      targets: this.children.list[this.children.list.length - 1],
      scaleX: 2.4,
      scaleY: 2.4,
      alpha: 0,
      duration: 360,
      onComplete: (tw) => {
        const target = tw.targets[0] as Phaser.GameObjects.GameObject;
        target.destroy();
      },
    });
    this.emitSnowBurst(x, y, 12);
  }

  private emitSnowBurst(x: number, y: number, count = 12): void {
    this.snowManager?.explode(Math.max(1, Math.round(count)), x, y);
  }

  private createLightningFlash(): void {
    const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0.45);
    flash.setOrigin(0, 0).setDepth(997);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 220,
      onComplete: () => flash.destroy(),
    });
  }

  private createLightningBolt(x: number): void {
    const g = this.add.graphics().setDepth(998);
    g.lineStyle(3, 0xfff176, 0.95);
    g.strokePoints(
      [
        new Phaser.Geom.Point(x, 0),
        new Phaser.Geom.Point(x + 22, this.scale.height * 0.4),
        new Phaser.Geom.Point(x - 8, this.scale.height * 0.66),
        new Phaser.Geom.Point(x + 26, this.scale.height * 0.92),
      ],
      false,
      true,
    );
    this.time.delayedCall(340, () => g.destroy());
  }

  private createWindGust(direction: 1 | -1): void {
    const streakCount = Phaser.Math.Between(5, 8);
    const startX = direction > 0 ? -180 : this.scale.width + 180;
    const endX = direction > 0 ? this.scale.width + 180 : -180;
    const tilt = direction > 0 ? -7 : 7;

    for (let i = 0; i < streakCount; i += 1) {
      const y = Phaser.Math.Between(Math.round(this.scale.height * 0.24), Math.round(this.scale.height * 0.82));
      const width = Phaser.Math.Between(90, 220);
      const height = Phaser.Math.Between(2, 5);
      const streak = this.add
        .rectangle(startX, y, width, height, 0xc8e6ff, Phaser.Math.FloatBetween(0.3, 0.65))
        .setDepth(996)
        .setAngle(tilt + Phaser.Math.FloatBetween(-2, 2));

      this.tweens.add({
        targets: streak,
        x: endX,
        y: y + Phaser.Math.Between(-22, 22),
        alpha: 0,
        duration: Phaser.Math.Between(680, 1100),
        delay: i * 70 + Phaser.Math.Between(0, 60),
        ease: 'Cubic.easeOut',
        onComplete: () => streak.destroy(),
      });
    }
  }

  private startSnowCycle(): void {
    this.stopWeatherCycle();
    this.weatherType = 'snow';
    this.runtimeState(true, false);
    this.toggleUmbrella(false);

    const constants = window.PenguinPet?.constants;
    const spawnDelay = Math.max(80, Math.round((constants?.SNOW_SPAWN_INTERVAL_MS ?? 400) * 0.45));
    const activeMs = constants?.SNOW_ACTIVE_DURATION_MS ?? 15000;
    const cooldownMs = constants?.SNOW_COOLDOWN_DURATION_MS ?? 1800000;

    this.snowManager?.start();
    this.snowManager?.setFrequency(spawnDelay);
    this.snowManager?.setQuantity(2);
    this.rainManager?.stop();

    this.weatherTick = this.time.delayedCall(activeMs, () => {
      this.snowManager?.stop();
      this.runtimeState(false, false);
      this.weatherCooldown = this.time.delayedCall(cooldownMs, () => this.startSnowCycle());
    });
  }

  private startRainCycle(): void {
    this.stopWeatherCycle();
    this.weatherType = 'rain';
    this.runtimeState(false, true);

    const constants = window.PenguinPet?.constants;
    const spawnDelay = constants?.RAIN_SPAWN_INTERVAL_MS ?? 60;
    const activeMs = constants?.RAIN_ACTIVE_DURATION_MS ?? 40000;
    const cooldownMs = constants?.RAIN_COOLDOWN_DURATION_MS ?? 600000;

    this.rainManager?.start();
    this.rainManager?.setFrequency(spawnDelay);
    this.rainManager?.setQuantity(2);
    this.snowManager?.stop();
    this.toggleUmbrella(true);
    this.startRainStormLoop();

    this.weatherTick = this.time.delayedCall(activeMs, () => {
      this.rainManager?.stop();
      this.toggleUmbrella(false);
      this.runtimeState(false, false);
      this.weatherCooldown = this.time.delayedCall(cooldownMs, () => this.startRainCycle());
    });
  }

  private stopWeatherCycle(): void {
    const wasRaining = this.weatherType === 'rain';
    this.weatherTick?.destroy();
    this.weatherCooldown?.destroy();
    this.rainStormTick?.destroy();
    this.weatherTick = undefined;
    this.weatherCooldown = undefined;
    this.rainStormTick = undefined;
    if (wasRaining) {
      this.toggleUmbrella(false);
    }
  }

  private startRainStormLoop(): void {
    this.rainStormTick?.destroy();
    this.rainStormTick = this.time.delayedCall(Phaser.Math.Between(2500, 7000), () => {
      if (this.weatherType !== 'rain') return;
      this.createLightningFlash();
      if (Math.random() < 0.45) {
        this.createLightningBolt(Phaser.Math.Between(20, Math.max(20, this.scale.width - 20)));
      }
      this.startRainStormLoop();
    });
  }

  private toggleUmbrella(open: boolean): void {
    const penguin = window.PenguinPet?.penguin as
      | { showUmbrella?: () => void; hideUmbrella?: () => void }
      | undefined;
    if (open) {
      penguin?.showUmbrella?.();
    } else {
      penguin?.hideUmbrella?.();
    }
  }

  private runtimeState(snowing: boolean, raining: boolean): void {
    if (!this.runtime) return;
    this.runtime.isSnowing = snowing;
    this.runtime.isRaining = raining;
    if (typeof this.runtime.emitEvent === 'function') {
      this.runtime.emitEvent('effects:weather:state', {
        snowing,
        raining,
        source: 'phaser',
      });
    }
  }
}
