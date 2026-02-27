import Phaser from 'phaser';
import type { RuntimeConfig, RuntimeEventHandler } from '../../runtime/types';

type RunnerSceneData = {
  active?: boolean;
};

type RunnerObstacleTemplate = {
  id: 'iceberg' | 'snowman' | 'airplane';
  textureKey: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  topOffset: number;
  requiresCrouch: boolean;
  score: number;
};

type RunnerObstacle = Phaser.Physics.Arcade.Image & {
  runnerData: {
    id: RunnerObstacleTemplate['id'];
    requiresCrouch: boolean;
    passed: boolean;
    score: number;
  };
};

export class RunnerScene extends Phaser.Scene {
  private readonly STORAGE_KEY_BEST_SCORE = 'pinguinRunnerBestScore';

  private runtime?: RuntimeConfig & {
    isRunnerActive?: boolean;
    addFishStock?: (amount?: number) => number;
  };

  private runnerModeChangedHandler?: RuntimeEventHandler<'runner:mode-changed'>;

  private activeRunner = false;
  private isGameOver = false;
  private score = 0;
  private bestScore = 0;
  private nextFishDropScore = 100;
  private worldTimeMs = 0;
  private backgroundScrollX = 0;
  private spawnTimerMs = 0;
  private worldSpeed = 220;

  private readonly minWorldSpeed = 220;
  private readonly maxWorldSpeed = 960;
  private readonly speedGainPerSecond = 9;
  private readonly spawnGapMinMs = 980;
  private readonly spawnGapMaxMs = 1750;

  private readonly gravity = 2350;
  private readonly fallGravityMultiplier = 1.32;
  private readonly lowJumpGravityMultiplier = 1.7;
  private readonly jumpVelocity = -860;
  private readonly maxFallSpeed = 1650;
  private readonly jumpBufferMs = 140;
  private readonly coyoteTimeMs = 110;

  private readonly penguinWidth = 68;
  private readonly penguinStandingHeight = 68;
  private readonly penguinCrouchingHeight = 52;

  private jumpQueuedMs = 0;
  private coyoteTimerMs = 0;
  private jumpHeld = false;
  private crouchHeld = false;

  private background!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.Rectangle;
  private hudText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private player!: Phaser.Physics.Arcade.Image;
  private groundBody!: Phaser.Physics.Arcade.StaticBody;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private groundDecor!: Phaser.Physics.Arcade.Group;
  private obstacleCollider?: Phaser.Physics.Arcade.Collider;

  private readonly obstacleTemplates: RunnerObstacleTemplate[] = [
    {
      id: 'iceberg',
      textureKey: 'runner-obstacle-iceberg',
      minWidth: 34,
      maxWidth: 60,
      minHeight: 30,
      maxHeight: 60,
      topOffset: 9,
      requiresCrouch: false,
      score: 5,
    },
    {
      id: 'snowman',
      textureKey: 'runner-obstacle-snowman',
      minWidth: 56,
      maxWidth: 78,
      minHeight: 64,
      maxHeight: 94,
      topOffset: 9,
      requiresCrouch: false,
      score: 5,
    },
    {
      id: 'airplane',
      textureKey: 'runner-obstacle-airplane',
      minWidth: 52,
      maxWidth: 72,
      minHeight: 18,
      maxHeight: 28,
      topOffset: -52,
      requiresCrouch: true,
      score: 7,
    },
  ];

  constructor() {
    super('framework:runner');
  }

  preload(): void {
    const pet = window.PenguinPet as { actionStates?: Record<string, string> } | undefined;
    const resolveAsset = (assetKey: string, fallbackPath: string): string => {
      const mappedPath =
        (pet?.actionStates && pet.actionStates[assetKey]) ||
        (window.PENGUIN_ASSETS && window.PENGUIN_ASSETS[assetKey]);
      if (typeof mappedPath === 'string' && mappedPath.length > 0) {
        return mappedPath;
      }
      return fallbackPath;
    };

    if (!this.textures.exists('runner-bg')) {
      this.load.image('runner-bg', resolveAsset('runnerBackgroundDarkB', 'assets/backgroung-darkB.png'));
    }
    if (!this.textures.exists('runner-penguin-running')) {
      this.load.image('runner-penguin-running', resolveAsset('running', 'assets/pinguin correndo.svg'));
    }
    if (!this.textures.exists('runner-penguin-crouching')) {
      this.load.image(
        'runner-penguin-crouching',
        resolveAsset('runningCrouched', 'assets/pinguin correndo abaixado.svg'),
      );
    }
    if (!this.textures.exists('runner-penguin-jumping')) {
      this.load.image('runner-penguin-jumping', resolveAsset('trace', 'assets/trace.svg'));
    }
    if (!this.textures.exists('runner-penguin-front')) {
      this.load.image('runner-penguin-front', resolveAsset('default', 'assets/pinguin.svg'));
    }
    if (!this.textures.exists('runner-obstacle-snowman')) {
      this.load.image('runner-obstacle-snowman', resolveAsset('snowman', 'assets/snowman.svg'));
    }
    if (!this.textures.exists('runner-obstacle-airplane')) {
      this.load.image('runner-obstacle-airplane', resolveAsset('helicopterA', 'assets/helicopterA.gif'));
    }
  }

  create(data?: RunnerSceneData): void {
    this.runtime = (window.PenguinPet?.runtime ?? window.PINGUIN_RUNTIME) as RuntimeConfig & {
      isRunnerActive?: boolean;
      addFishStock?: (amount?: number) => number;
    };

    this.bestScore = this.tryLoadBestScore();
    this.createProceduralTextures();
    this.createWorld();
    this.createInput();
    this.registerRuntimeEvents();

    this.activeRunner = Boolean(data?.active);
    this.applyRunnerMode(this.activeRunner);
    if (this.activeRunner) {
      this.resetRound();
    } else {
      this.messageText.setText('');
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unregisterRuntimeEvents();
    });
  }

  update(_: number, delta: number): void {
    const deltaMs = Math.min(40, Math.max(8, delta || 16));
    if (!this.activeRunner) return;

    if (!this.isGameOver) {
      this.updateDifficultyAndSpawns(deltaMs);
    }

    this.updatePenguin(deltaMs);
    this.updateObstacles(deltaMs);
    this.updateGroundDecor(deltaMs);
    this.updateBackground(deltaMs);
    this.renderHud();
  }

  private createWorld(): void {
    this.physics.world.gravity.y = this.gravity;

    const width = this.scale.width;
    const height = this.scale.height;

    this.background = this.add
      .tileSprite(0, 0, width, height, 'runner-bg')
      .setOrigin(0, 0)
      .setDepth(0)
      .setVisible(false);

    this.ground = this.add
      .rectangle(width / 2, this.getGroundLineY() + 12, width + 300, 24, 0xdbe9ff, 0.45)
      .setDepth(1)
      .setVisible(false);
    this.physics.add.existing(this.ground, true);
    this.groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody;

    this.player = this.physics.add
      .image(Math.round(width * 0.23), this.getGroundY(), 'runner-penguin-running')
      .setDepth(4)
      .setOrigin(0.5, 1)
      .setDisplaySize(this.penguinWidth, this.penguinStandingHeight)
      .setVisible(false);
    this.player.setCollideWorldBounds(true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setMaxVelocity(playerBody.maxVelocity.x, this.maxFallSpeed);
    this.setPlayerHitbox(false);

    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.groundDecor = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.obstacleCollider = this.physics.add.overlap(
      this.player,
      this.obstacles,
      () => {
        if (!this.activeRunner || this.isGameOver) return;
        this.endGame();
      },
      undefined,
      this,
    );

    this.physics.add.collider(this.player, this.ground);

    this.hudText = this.add
      .text(14, 14, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: { x: 8, y: 6 },
      })
      .setDepth(10)
      .setScrollFactor(0)
      .setVisible(false);

    this.hintText = this.add
      .text(width / 2, 18, 'Space/↑/W pular | ↓/S abaixar | Esc sair', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#d8e8ff',
      })
      .setOrigin(0.5, 0)
      .setDepth(10)
      .setVisible(false);

    this.messageText = this.add
      .text(width / 2, Math.max(70, height * 0.16), '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: { x: 10, y: 8 },
      })
      .setOrigin(0.5, 0)
      .setDepth(11)
      .setVisible(false);

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.ESC,
    ]);

    keyboard.on('keydown-ESC', (event: KeyboardEvent) => {
      if (!this.activeRunner) return;
      event.preventDefault();
      this.requestRunnerMode(false);
    });

    const jumpDown = (event: KeyboardEvent): void => {
      event.preventDefault();
      if (!this.activeRunner) {
        this.requestRunnerMode(true);
        return;
      }

      if (this.isGameOver) {
        this.resetRound();
        return;
      }

      this.jumpHeld = true;
      this.requestJump();
    };

    keyboard.on('keydown-SPACE', jumpDown);
    keyboard.on('keydown-UP', jumpDown);
    keyboard.on('keydown-W', jumpDown);

    const jumpUp = (): void => {
      this.jumpHeld = false;
    };
    keyboard.on('keyup-SPACE', jumpUp);
    keyboard.on('keyup-UP', jumpUp);
    keyboard.on('keyup-W', jumpUp);

    keyboard.on('keydown-DOWN', (event: KeyboardEvent) => {
      if (!this.activeRunner || this.isGameOver) return;
      event.preventDefault();
      this.crouchHeld = true;
    });
    keyboard.on('keydown-S', (event: KeyboardEvent) => {
      if (!this.activeRunner || this.isGameOver) return;
      event.preventDefault();
      this.crouchHeld = true;
    });
    keyboard.on('keyup-DOWN', () => {
      this.crouchHeld = false;
    });
    keyboard.on('keyup-S', () => {
      this.crouchHeld = false;
    });
  }

  private registerRuntimeEvents(): void {
    if (!this.runtime || typeof this.runtime.onEvent !== 'function') return;

    this.runnerModeChangedHandler = (payload) => {
      this.applyRunnerMode(Boolean(payload.active));
    };

    this.runtime.onEvent('runner:mode-changed', this.runnerModeChangedHandler);
  }

  private unregisterRuntimeEvents(): void {
    if (!this.runtime || typeof this.runtime.offEvent !== 'function') return;
    if (this.runnerModeChangedHandler) {
      this.runtime.offEvent('runner:mode-changed', this.runnerModeChangedHandler);
    }
  }

  private applyRunnerMode(enabled: boolean): void {
    this.activeRunner = enabled;
    this.background.setVisible(enabled);
    this.ground.setVisible(enabled);
    this.player.setVisible(enabled);
    this.hudText.setVisible(enabled);
    this.hintText.setVisible(enabled);
    this.messageText.setVisible(enabled);
    document.body.classList.toggle('runner-mode', enabled);

    if (enabled) {
      this.resetRound();
      return;
    }

    this.clearObstacles();
    this.clearGroundDecor();
    this.clearFishRain();
    this.messageText.setText('');
    this.isGameOver = false;
    this.jumpHeld = false;
    this.crouchHeld = false;
    this.player.setTexture('runner-penguin-running');
  }

  private requestRunnerMode(active: boolean): void {
    if (!this.runtime || typeof this.runtime.emitEvent !== 'function') return;
    this.runtime.emitEvent(active ? 'runner:start-request' : 'runner:stop-request', {
      source: 'phaser',
    });
  }

  private resetRound(): void {
    this.clearObstacles();
    this.clearGroundDecor();
    this.clearFishRain();
    this.createGroundDecor();

    this.isGameOver = false;
    this.score = 0;
    this.worldSpeed = this.minWorldSpeed;
    this.spawnTimerMs = 860;
    this.worldTimeMs = 0;
    this.backgroundScrollX = 0;
    this.nextFishDropScore = 100;
    this.jumpQueuedMs = 0;
    this.coyoteTimerMs = 0;
    this.jumpHeld = false;
    this.crouchHeld = false;

    this.centerPenguin();
    this.player.setTexture('runner-penguin-running');
    this.messageText.setText('');
    this.hintText.setText('Space/↑/W pular | ↓/S abaixar | Esc sair');
    this.renderHud();
  }

  private endGame(): void {
    this.isGameOver = true;
    this.player.setTexture('runner-penguin-front');
    const scoreInt = Math.floor(this.score);
    if (scoreInt > this.bestScore) {
      this.bestScore = scoreInt;
      this.trySaveBestScore(this.bestScore);
    }
    this.messageText.setText(
      `Fim de jogo | Pontos ${scoreInt} | Recorde ${this.bestScore} | Space para reiniciar`,
    );
    this.hintText.setText('');
  }

  private updateDifficultyAndSpawns(deltaMs: number): void {
    this.worldTimeMs += deltaMs;
    this.score += (deltaMs / 1000) * 10;

    while (this.score >= this.nextFishDropScore) {
      this.spawnScoreFishDrop();
      if (this.runtime && typeof this.runtime.addFishStock === 'function') {
        this.runtime.addFishStock(1);
      }
      this.nextFishDropScore += 100;
    }

    this.worldSpeed = Phaser.Math.Clamp(
      this.worldSpeed + this.speedGainPerSecond * (deltaMs / 1000),
      this.minWorldSpeed,
      this.maxWorldSpeed,
    );

    const level = this.difficultyLevel();
    const spawnRateFactor = Phaser.Math.Clamp(1 - level * 0.08, 0.58, 1);
    this.spawnTimerMs -= deltaMs;
    if (this.spawnTimerMs <= 0 && this.ensureSafeSpawnGap()) {
      this.spawnObstacle();
      const baseGap =
        this.spawnGapMinMs + Math.random() * (this.spawnGapMaxMs - this.spawnGapMinMs);
      this.spawnTimerMs = baseGap * spawnRateFactor;
    }
  }

  private updatePenguin(deltaMs: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    this.jumpQueuedMs = Math.max(0, this.jumpQueuedMs - deltaMs);

    if (onGround) {
      this.coyoteTimerMs = this.coyoteTimeMs;
    } else {
      this.coyoteTimerMs = Math.max(0, this.coyoteTimerMs - deltaMs);
    }

    if (this.jumpQueuedMs > 0 && (onGround || this.coyoteTimerMs > 0)) {
      body.setVelocityY(this.jumpVelocity);
      this.jumpQueuedMs = 0;
      this.coyoteTimerMs = 0;
    }

    if (body.velocity.y < 0 && !this.jumpHeld) {
      body.velocity.y += this.gravity * (this.lowJumpGravityMultiplier - 1) * (deltaMs / 1000);
    } else if (body.velocity.y > 0) {
      body.velocity.y += this.gravity * (this.fallGravityMultiplier - 1) * (deltaMs / 1000);
    }

    body.setVelocityY(Math.min(body.velocity.y, this.maxFallSpeed));

    const shouldCrouch = this.crouchHeld && (body.blocked.down || body.touching.down);
    this.setPlayerHitbox(shouldCrouch);

    if (this.isGameOver) return;
    if (body.velocity.y < -10 || body.velocity.y > 10) {
      this.player.setTexture('runner-penguin-jumping');
      return;
    }
    this.player.setTexture(shouldCrouch ? 'runner-penguin-crouching' : 'runner-penguin-running');
  }

  private updateObstacles(deltaMs: number): void {
    const dt = deltaMs / 1000;
    const playerX = this.player.x;

    for (const child of this.obstacles.getChildren()) {
      const obstacle = child as RunnerObstacle;
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.worldSpeed);

      if (!obstacle.runnerData.passed && obstacle.x + obstacle.displayWidth < playerX) {
        obstacle.runnerData.passed = true;
        this.score += obstacle.runnerData.score;
      }

      if (obstacle.x + obstacle.displayWidth < -48) {
        obstacle.destroy();
      }
    }

    // Ensure Arcade body sync when world speed changes abruptly.
    this.obstacles.children.each((entry) => {
      const obstacle = entry as RunnerObstacle;
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      if (body.velocity.x !== -this.worldSpeed) {
        body.setVelocityX(-this.worldSpeed);
      }
      return true;
    });

    if (dt <= 0) return;
  }

  private updateGroundDecor(deltaMs: number): void {
    const dt = deltaMs / 1000;
    const width = this.scale.width;
    const speed = 180;

    this.groundDecor.children.each((entry) => {
      const piece = entry as Phaser.Physics.Arcade.Image;
      piece.x -= speed * dt;
      if (piece.x + piece.displayWidth < -8) {
        piece.x = width + Phaser.Math.Between(12, 90);
      }
      return true;
    });
  }

  private updateBackground(deltaMs: number): void {
    this.backgroundScrollX += 8 * (deltaMs / 1000);
    this.background.tilePositionX = this.backgroundScrollX;
  }

  private renderHud(): void {
    this.hudText.setText(`Pontos: ${Math.floor(this.score)}   Recorde: ${this.bestScore}`);
  }

  private spawnObstacle(): void {
    const template = this.chooseObstacleTemplate();
    const width = Math.round(template.minWidth + Math.random() * (template.maxWidth - template.minWidth));
    const height = Math.round(
      template.minHeight + Math.random() * (template.maxHeight - template.minHeight),
    );

    const x = this.scale.width + 48;
    const y = this.getGroundLineY() - height + template.topOffset;

    const obstacle = this.physics.add
      .image(x, y, template.textureKey)
      .setOrigin(0, 0)
      .setDepth(5)
      .setDisplaySize(width, height) as RunnerObstacle;

    const obstacleBody = obstacle.body as Phaser.Physics.Arcade.Body;
    obstacleBody.setAllowGravity(false);
    obstacleBody.setImmovable(true);
    obstacleBody.setVelocityX(-this.worldSpeed);
    obstacle.runnerData = {
      id: template.id,
      requiresCrouch: template.requiresCrouch,
      passed: false,
      score: template.score,
    };

    const insetX = Math.round(width * (template.requiresCrouch ? 0.18 : 0.12));
    const insetY = Math.round(height * (template.requiresCrouch ? 0.14 : 0.1));
    obstacleBody.setSize(Math.max(8, width - insetX * 2), Math.max(8, height - insetY * 2), false);
    obstacleBody.setOffset(insetX, insetY);

    this.obstacles.add(obstacle);
  }

  private chooseObstacleTemplate(): RunnerObstacleTemplate {
    const level = this.difficultyLevel();
    const roll = Math.random();

    if (level >= 1.5 && roll < 0.2) return this.obstacleTemplates[2];
    if (level >= 1.5 && roll < 0.4) return this.obstacleTemplates[1];
    if (level < 1.5 && roll < 0.4) return this.obstacleTemplates[1];
    return this.obstacleTemplates[0];
  }

  private ensureSafeSpawnGap(): boolean {
    let lastX = -1;
    let lastWidth = 0;
    let lastRequiresCrouch = false;
    this.obstacles.children.each((entry) => {
      const obstacle = entry as RunnerObstacle;
      if (obstacle.x > lastX) {
        lastX = obstacle.x;
        lastWidth = obstacle.displayWidth;
        lastRequiresCrouch = obstacle.runnerData.requiresCrouch;
      }
      return true;
    });
    if (lastX < 0) return true;

    const minimumGapPx =
      220 + Math.min(190, this.difficultyLevel() * 24) + (lastRequiresCrouch ? 42 : 0);
    return lastX + lastWidth < this.scale.width - minimumGapPx;
  }

  private difficultyLevel(): number {
    const byScore = this.score / 250;
    const byTime = this.worldTimeMs / 16000;
    return Phaser.Math.Clamp(1 + Math.min(byScore, byTime), 1, 7);
  }

  private spawnScoreFishDrop(): void {
    const x = Math.round(this.scale.width * (0.12 + Math.random() * 0.76));
    const yStart = -24;
    const yEnd = this.getGroundLineY() - 20;
    const fish = this.add.text(x, yStart, '🐟', { fontSize: '24px' }).setDepth(9).setOrigin(0.5, 0.5);
    this.tweens.add({
      targets: fish,
      y: yEnd,
      angle: { from: -12, to: 10 },
      alpha: { from: 0.95, to: 0 },
      duration: 980,
      ease: 'Sine.easeIn',
      onComplete: () => fish.destroy(),
    });
  }

  private clearFishRain(): void {
    this.children.list
      .filter((child) => child.type === 'Text' && (child as Phaser.GameObjects.Text).text === '🐟')
      .forEach((child) => child.destroy());
  }

  private createGroundDecor(): void {
    this.clearGroundDecor();
    const baseline = this.getGroundLineY();
    const width = this.scale.width;
    const count = Phaser.Math.Clamp(Math.round(width / 90), 8, 28);

    for (let i = 0; i < count; i += 1) {
      const w = 26 + Math.round(Math.random() * 62);
      const h = 4 + Math.round(Math.random() * 6);
      const x = Math.round((i / count) * width + Math.random() * 40);
      const y = baseline + 8 + Math.random() * 16;

      const piece = this.physics.add
        .image(x, y, 'runner-ground-piece')
        .setOrigin(0, 0)
        .setDisplaySize(w, h)
        .setAlpha(0.28)
        .setTint(0xe8f5ff)
        .setDepth(2);
      const pieceBody = piece.body as Phaser.Physics.Arcade.Body;
      pieceBody.setAllowGravity(false);
      pieceBody.setImmovable(true);
      this.groundDecor.add(piece);
    }
  }

  private clearGroundDecor(): void {
    this.groundDecor.clear(true, true);
  }

  private clearObstacles(): void {
    this.obstacles.clear(true, true);
  }

  private requestJump(): void {
    this.jumpQueuedMs = this.jumpBufferMs;
  }

  private centerPenguin(): void {
    this.player.x = Math.round(this.scale.width * 0.23);
    this.player.y = this.getGroundY();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  private setPlayerHitbox(isCrouching: boolean): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (isCrouching) {
      this.player.setDisplaySize(this.penguinWidth, this.penguinCrouchingHeight);
      body.setSize(40, 32, false);
      body.setOffset(14, 18);
      return;
    }
    this.player.setDisplaySize(this.penguinWidth, this.penguinStandingHeight);
    body.setSize(44, 48, false);
    body.setOffset(12, 14);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    this.background.setSize(width, height);
    this.ground.setPosition(width / 2, this.getGroundLineY() + 12);
    this.ground.setSize(width + 300, 24);
    this.groundBody.updateFromGameObject();
    this.hintText.setPosition(width / 2, 18);
    this.messageText.setPosition(width / 2, Math.max(70, height * 0.16));

    if (!this.activeRunner) return;
    this.centerPenguin();
    this.createGroundDecor();

    this.obstacles.children.each((entry) => {
      const obstacle = entry as RunnerObstacle;
      const template = this.obstacleTemplates.find((item) => item.id === obstacle.runnerData.id);
      const topOffset = template ? template.topOffset : 0;
      obstacle.y = this.getGroundLineY() - obstacle.displayHeight + topOffset;
      return true;
    });
  }

  private getPlayfieldHeight(): number {
    return Math.floor(this.scale.height * 0.78);
  }

  private getGroundY(): number {
    return Math.max(0, this.getPlayfieldHeight() - this.penguinStandingHeight + 8);
  }

  private getGroundLineY(): number {
    return this.getGroundY() + this.penguinStandingHeight;
  }

  private createProceduralTextures(): void {
    if (!this.textures.exists('runner-obstacle-iceberg')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x9cd4ef, 1);
      graphics.fillRoundedRect(0, 0, 64, 64, 10);
      graphics.generateTexture('runner-obstacle-iceberg', 64, 64);
      graphics.destroy();
    }

    if (!this.textures.exists('runner-ground-piece')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRoundedRect(0, 0, 64, 16, 8);
      graphics.generateTexture('runner-ground-piece', 64, 16);
      graphics.destroy();
    }
  }

  private tryLoadBestScore(): number {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_BEST_SCORE);
      const value = Number(raw);
      return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    } catch {
      return 0;
    }
  }

  private trySaveBestScore(value: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_BEST_SCORE, String(Math.floor(value)));
    } catch {
      // Ignore storage failures.
    }
  }
}
