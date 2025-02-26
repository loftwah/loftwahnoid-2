import { Scene, Physics, GameObjects, Input } from 'phaser';
import { MusicPlayer } from '../components/MusicPlayer';
import { Brick, BrickType } from '../components/Brick';
import { PowerUp, PowerUpType } from '../components/PowerUp';
import { LevelGenerator } from '../components/LevelGenerator';

interface GameState {
    level: number;
    score: number;
    lives: number;
    isPaused: boolean;
    isGameOver: boolean;
    isLevelComplete: boolean;
    ballLaunched: boolean;
    activePowerUps: Map<PowerUpType, number>; // Power-up type -> timeout ID
    bricksLeft: number;
}

export class Game extends Scene
{
    // Game state
    private state!: GameState;
    
    // Game objects
    private background!: GameObjects.Image;
    private paddle!: Physics.Arcade.Image;
    private ball!: Physics.Arcade.Image;
    private miniBalls: Physics.Arcade.Image[] = [];
    private bricks: Brick[] = [];
    private powerUps: PowerUp[] = [];
    private projectiles: Physics.Arcade.Image[] = [];
    
    // Game settings
    private paddleSpeed: number = 500;
    private initialBallSpeed: number = 300;
    private currentBallSpeed: number = 300;
    private paddleSizesWidth: number[] = [60, 80, 100, 120, 140]; // 5 sizes
    private currentPaddleSizeStage: number = 2; // Start at middle size (index 2)
    
    // UI elements
    private scoreText!: GameObjects.Text;
    private livesText!: GameObjects.Text;
    private pauseText!: GameObjects.Text;
    private musicDisplay!: GameObjects.Container;
    
    // Input handling
    private cursors!: Input.Keyboard.CursorKeys;
    private keyP!: Input.Keyboard.Key;
    private keyM!: Input.Keyboard.Key;
    private keyN!: Input.Keyboard.Key;
    
    // Music player
    private musicPlayer!: MusicPlayer;
    
    // Physics groups
    private brickGroup!: Physics.Arcade.StaticGroup;
    private powerUpGroup!: Physics.Arcade.Group;
    private projectileGroup!: Physics.Arcade.Group;
    
    // Level generator
    private levelGenerator!: LevelGenerator;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // Initialize game state
        this.state = {
            level: 1,
            score: 0,
            lives: 3,
            isPaused: false,
            isGameOver: false,
            isLevelComplete: false,
            ballLaunched: false,
            activePowerUps: new Map<PowerUpType, number>(),
            bricksLeft: 0
        };
        
        // Set up physics world
        this.physics.world.setBounds(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height);
        
        // Set up background
        this.setupBackground();
        
        // Create game objects
        this.createGameObjects();
        
        // Set up UI
        this.createUI();
        
        // Set up collisions
        this.setupCollisions();
        
        // Set up music player
        this.setupMusicPlayer();
        
        // Set up input
        this.setupInput();
        
        // Generate the first level
        this.generateLevel();
        
        // Play the level start sound
        try {
            this.sound.play('start');
        } catch (error) {
            console.error('Failed to play start sound:', error);
        }
    }

    update(time: number, delta: number) {
        if (this.state.isPaused || this.state.isGameOver) {
            return;
        }
        
        this.handleInput(time);
        
        if (!this.state.ballLaunched) {
            // Keep ball attached to paddle
            this.ball.x = this.paddle.x;
        }
        
        // Update all power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.update();
        });
        
        // Check if all bricks are cleared
        if (this.state.bricksLeft === 0 && !this.state.isLevelComplete) {
            this.onLevelComplete();
        }
        
        // Check if ball is out of bounds
        if (this.ball.y > this.sys.game.canvas.height + 20) {
            this.onBallLost();
        }
        
        // Update mini balls
        this.miniBalls.forEach(miniBall => {
            if (miniBall.y > this.sys.game.canvas.height + 20) {
                miniBall.destroy();
                const index = this.miniBalls.indexOf(miniBall);
                if (index > -1) {
                    this.miniBalls.splice(index, 1);
                }
            }
        });
        
        // Update projectiles
        this.projectiles.forEach(projectile => {
            if (projectile.y < -20) {
                projectile.destroy();
                const index = this.projectiles.indexOf(projectile);
                if (index > -1) {
                    this.projectiles.splice(index, 1);
                }
            }
        });
    }

    private setupBackground() {
        // Try to load the saved background or default to background1
        let bgIndex = localStorage.getItem('loftwahnoid_background');
        
        // Handle 'random' option
        if (bgIndex === 'random' || bgIndex === '6') {
            bgIndex = String(Math.floor(Math.random() * 5) + 1);
        }
        
        try {
            const backgroundKey = `background${bgIndex || '1'}`;
            this.background = this.add.image(512, 384, backgroundKey);
            this.background.setDisplaySize(1024, 768);
            this.background.setAlpha(0.7); // Make it slightly faded to improve visibility
        } catch (error) {
            console.error('Failed to load background:', error);
            // Use black background as fallback
            this.cameras.main.setBackgroundColor('#000000');
            this.background = this.add.image(512, 384, 'background');
            this.background.setAlpha(0.3);
        }
    }

    private createGameObjects() {
        // Create paddle
        try {
            this.paddle = this.physics.add.image(512, 700, 'paddle');
            this.paddle.setCollideWorldBounds(true);
            this.paddle.setImmovable(true);
            this.paddle.setSize(this.paddleSizesWidth[this.currentPaddleSizeStage], 24);
        } catch (error) {
            console.error('Failed to create paddle:', error);
            // Create fallback paddle
            this.paddle = this.physics.add.image(512, 700, '');
            this.paddle.setDisplaySize(this.paddleSizesWidth[this.currentPaddleSizeStage], 20);
            this.paddle.setCollideWorldBounds(true);
            this.paddle.setImmovable(true);
            
            // Add a visual rectangle for the paddle
            const paddleGraphic = this.add.rectangle(
                512, 700, 
                this.paddleSizesWidth[this.currentPaddleSizeStage], 20, 
                0x3399ff
            );
            paddleGraphic.setStrokeStyle(2, 0xffffff);
            
            // Store the graphic reference
            this.paddle.setData('fallbackGraphic', paddleGraphic);
        }
        
        // Create ball
        try {
            this.ball = this.physics.add.image(512, 680, 'ball');
            this.ball.setCollideWorldBounds(true);
            this.ball.setBounce(1);
            this.ball.setCircle(8);
        } catch (error) {
            console.error('Failed to create ball:', error);
            // Create fallback ball
            this.ball = this.physics.add.image(512, 680, '');
            this.ball.setDisplaySize(16, 16);
            this.ball.setCollideWorldBounds(true);
            this.ball.setBounce(1);
            this.ball.setCircle(8);
            
            // Add a visual circle for the ball
            const ballGraphic = this.add.circle(512, 680, 8, 0xffffff);
            
            // Store the graphic reference
            this.ball.setData('fallbackGraphic', ballGraphic);
        }
        
        // Create physics groups
        this.brickGroup = this.physics.add.staticGroup();
        this.powerUpGroup = this.physics.add.group();
        this.projectileGroup = this.physics.add.group();
    }

    private createUI() {
        // Create score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });
        
        // Create lives text
        this.livesText = this.add.text(20, 50, 'Lives: 3', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });
        
        // Create pause text (initially hidden)
        this.pauseText = this.add.text(512, 384, 'PAUSED', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.pauseText.setVisible(false);
        
        // Create the mini music display for in-game
        this.createMusicDisplay();
    }

    private createMusicDisplay() {
        this.musicDisplay = this.add.container(900, 30);
        
        // Background
        const musicBg = this.add.rectangle(0, 0, 200, 50, 0x000000, 0.5);
        musicBg.setStrokeStyle(1, 0xffffff);
        
        // Track info
        const trackText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        this.musicDisplay.add([musicBg, trackText]);
    }

    private setupMusicPlayer() {
        // Get music player from previous scene
        const prevScene = this.scene.get('MainMenu');
        
        // Initialize music player
        if (prevScene.data && prevScene.data.has('musicPlayer')) {
            const prevMusicPlayer = prevScene.data.get('musicPlayer') as MusicPlayer;
            // Transfer to new scene
            this.musicPlayer = prevMusicPlayer.transferToScene(this);
        } else {
            // Create new music player if none exists
            this.musicPlayer = new MusicPlayer(this);
        }
        
        // Update music display
        this.updateMusicDisplay();
    }

    private updateMusicDisplay() {
        if (this.musicPlayer && this.musicDisplay) {
            const trackText = this.musicDisplay.getAt(1) as GameObjects.Text;
            if (trackText) {
                trackText.setText(this.musicPlayer.getCurrentTrackName());
            }
        }
    }

    private setupInput() {
        // Set up keyboard input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keyP = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.P);
        this.keyM = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.M);
        this.keyN = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.N);
        
        // Set up keyboard events
        this.input.keyboard!.on('keydown-P', this.togglePause, this);
        this.input.keyboard!.on('keydown-M', () => {
            this.musicPlayer.playPause();
            this.updateMusicDisplay();
        });
        this.input.keyboard!.on('keydown-N', () => {
            this.musicPlayer.playNext();
            this.updateMusicDisplay();
        });
        
        // Set up space key for ball launch
        this.input.keyboard!.on('keydown-SPACE', this.launchBall, this);
        
        // Set up mouse input for paddle movement
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (!this.state.isPaused && pointer.isDown) {
                this.paddle.x = pointer.x;
            }
        });
        
        // Set up mouse click for ball launch
        this.input.on('pointerdown', this.launchBall, this);
    }

    private setupCollisions() {
        // Ball and paddle collision
        this.physics.add.collider(this.ball, this.paddle, this.handleBallPaddleCollision, undefined, this);
        
        // Mini balls and paddle collision
        this.physics.add.collider(this.miniBalls, this.paddle, this.handleBallPaddleCollision, undefined, this);
        
        // Ball and bricks collision
        this.physics.add.collider(this.ball, this.brickGroup, this.handleBallBrickCollision, undefined, this);
        
        // Mini balls and bricks collision
        this.physics.add.collider(this.miniBalls, this.brickGroup, this.handleBallBrickCollision, undefined, this);
        
        // Paddle and power-ups collision
        this.physics.add.overlap(this.paddle, this.powerUpGroup, this.handlePowerUpCollection, undefined, this);
        
        // Projectiles and bricks collision
        this.physics.add.collider(this.projectileGroup, this.brickGroup, this.handleProjectileBrickCollision, undefined, this);
    }

    private handleInput(time: number) {
        if (this.state.isPaused) return;
        
        // Handle paddle movement with arrow keys
        if (this.cursors.left.isDown) {
            this.paddle.setVelocityX(-this.paddleSpeed);
        } else if (this.cursors.right.isDown) {
            this.paddle.setVelocityX(this.paddleSpeed);
        } else {
            this.paddle.setVelocityX(0);
        }
        
        // Update paddle's fallback graphic if it exists
        const paddleGraphic = this.paddle.getData('fallbackGraphic') as GameObjects.Rectangle;
        if (paddleGraphic) {
            paddleGraphic.x = this.paddle.x;
            paddleGraphic.y = this.paddle.y;
        }
        
        // Update ball's fallback graphic if it exists
        const ballGraphic = this.ball.getData('fallbackGraphic') as GameObjects.Arc;
        if (ballGraphic) {
            ballGraphic.x = this.ball.x;
            ballGraphic.y = this.ball.y;
        }
        
        // Handle shooting paddle power-up
        if (this.state.activePowerUps.has(PowerUpType.ShootingPaddle)) {
            // Shoot every second
            if (time % 1000 < 20) {
                this.shootProjectile();
            }
        }
    }

    private launchBall() {
        if (this.state.isPaused || this.state.ballLaunched) return;
        
        // Set initial ball velocity
        const angle = Phaser.Math.Between(-30, 30);
        const vx = this.currentBallSpeed * Math.sin(Phaser.Math.DegToRad(angle));
        const vy = -this.currentBallSpeed * Math.cos(Phaser.Math.DegToRad(angle));
        
        this.ball.setVelocity(vx, vy);
        this.state.ballLaunched = true;
        
        // Play sound
        try {
            this.sound.play('ping');
        } catch (error) {
            console.error('Failed to play ping sound:', error);
        }
    }

    private handleBallPaddleCollision(ball: Physics.Arcade.Image, paddle: Physics.Arcade.Image) {
        // Calculate rebound angle based on where ball hits the paddle
        let diff = ball.x - paddle.x;
        let normalizedDiff = diff / (paddle.displayWidth / 2);
        let angle = normalizedDiff * 60; // -60 to 60 degrees
        
        // Convert angle to velocity
        let speed = Math.sqrt(Math.pow(ball.body.velocity.x, 2) + Math.pow(ball.body.velocity.y, 2));
        let vx = speed * Math.sin(Phaser.Math.DegToRad(angle));
        let vy = -speed * Math.cos(Phaser.Math.DegToRad(angle));
        
        // Set new velocity
        ball.setVelocity(vx, vy);
        
        // Play sound
        try {
            this.sound.play('ping');
        } catch (error) {
            console.error('Failed to play ping sound:', error);
        }
    }

    private handleBallBrickCollision(ball: Physics.Arcade.Image, brickObj: Physics.Arcade.Sprite) {
        // Cast to our Brick class
        const brick = brickObj as unknown as Brick;
        
        // Handle hit
        const pointsGained = brick.hit();
        
        // Add points if brick was destroyed
        if (pointsGained > 0) {
            this.addScore(pointsGained);
            this.state.bricksLeft--;
        }
    }

    private handleProjectileBrickCollision(projectile: Physics.Arcade.Image, brickObj: Physics.Arcade.Sprite) {
        // Cast to our Brick class
        const brick = brickObj as unknown as Brick;
        
        // Don't destroy indestructible bricks
        if (brick.isIndestructible()) {
            projectile.destroy();
            return;
        }
        
        // Handle hit
        const pointsGained = brick.hit();
        
        // Add points if brick was destroyed
        if (pointsGained > 0) {
            this.addScore(pointsGained);
            this.state.bricksLeft--;
        }
        
        // Destroy the projectile
        projectile.destroy();
        
        // Remove from array
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }

    private handlePowerUpCollection(paddle: Physics.Arcade.Image, powerUpObj: Physics.Arcade.Sprite) {
        // Cast to our PowerUp class
        const powerUp = powerUpObj as unknown as PowerUp;
        
        // Get the power-up type
        const powerUpType = powerUp.handleCollection();
        
        // Apply the power-up effect
        this.applyPowerUp(powerUpType);
    }

    private applyPowerUp(type: PowerUpType) {
        // Clear existing timeout for this power-up type if it exists
        if (this.state.activePowerUps.has(type)) {
            clearTimeout(this.state.activePowerUps.get(type));
        }
        
        // Apply the power-up effect
        switch (type) {
            case PowerUpType.ExtraLife:
                this.state.lives++;
                this.updateLivesText();
                break;
                
            case PowerUpType.ShootingPaddle:
                // Effect is handled in update method
                break;
                
            case PowerUpType.SlowBall:
                this.currentBallSpeed = this.initialBallSpeed * 0.7;
                this.adjustBallSpeed(this.currentBallSpeed);
                break;
                
            case PowerUpType.LargerPaddle:
                this.resizePaddle(1); // Grow
                break;
                
            case PowerUpType.MiniBall:
                this.createMiniBalls();
                break;
                
            case PowerUpType.FastBall:
                this.currentBallSpeed = this.initialBallSpeed * 1.3;
                this.adjustBallSpeed(this.currentBallSpeed);
                break;
                
            case PowerUpType.SmallerPaddle:
                this.resizePaddle(-1); // Shrink
                break;
        }
        
        // Set timeout to remove power-up after duration (except ExtraLife which is permanent)
        if (type !== PowerUpType.ExtraLife) {
            const timeoutId = setTimeout(() => {
                this.removePowerUp(type);
            }, 20000); // 20 seconds duration
            
            this.state.activePowerUps.set(type, timeoutId as unknown as number);
        }
    }

    private removePowerUp(type: PowerUpType) {
        // Remove power-up effect
        switch (type) {
            case PowerUpType.ShootingPaddle:
                // Just stop shooting, handled in update
                break;
                
            case PowerUpType.SlowBall:
            case PowerUpType.FastBall:
                // Reset ball speed
                this.currentBallSpeed = this.initialBallSpeed;
                this.adjustBallSpeed(this.currentBallSpeed);
                break;
                
            case PowerUpType.LargerPaddle:
            case PowerUpType.SmallerPaddle:
                // Reset paddle size to middle stage
                this.currentPaddleSizeStage = 2;
                this.updatePaddleSize();
                break;
        }
        
        // Remove from active power-ups
        this.state.activePowerUps.delete(type);
    }

    private adjustBallSpeed(speed: number) {
        // Keep the direction but adjust the speed
        if (this.state.ballLaunched && this.ball.body.velocity.x !== 0 && this.ball.body.velocity.y !== 0) {
            const currentVelocity = new Phaser.Math.Vector2(this.ball.body.velocity.x, this.ball.body.velocity.y);
            const direction = currentVelocity.normalize();
            
            this.ball.setVelocity(
                direction.x * speed,
                direction.y * speed
            );
        }
        
        // Also adjust mini balls if any
        this.miniBalls.forEach(miniBall => {
            if (miniBall.body.velocity.x !== 0 && miniBall.body.velocity.y !== 0) {
                const currentVelocity = new Phaser.Math.Vector2(miniBall.body.velocity.x, miniBall.body.velocity.y);
                const direction = currentVelocity.normalize();
                
                miniBall.setVelocity(
                    direction.x * speed,
                    direction.y * speed
                );
            }
        });
    }

    private resizePaddle(direction: number) {
        // Adjust paddle size stage
        this.currentPaddleSizeStage = Phaser.Math.Clamp(
            this.currentPaddleSizeStage + direction,
            0,
            this.paddleSizesWidth.length - 1
        );
        
        this.updatePaddleSize();
    }

    private updatePaddleSize() {
        // Set the new size
        const newWidth = this.paddleSizesWidth[this.currentPaddleSizeStage];
        
        // Update collision body
        const body = this.paddle.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setSize(newWidth, body.height);
        }
        
        // Update visual size
        this.paddle.setDisplaySize(newWidth, this.paddle.displayHeight);
        
        // Update fallback graphic if it exists
        const paddleGraphic = this.paddle.getData('fallbackGraphic') as GameObjects.Rectangle;
        if (paddleGraphic) {
            paddleGraphic.width = newWidth;
        }
    }

    private createMiniBalls() {
        // Create 2 mini balls
        for (let i = 0; i < 2; i++) {
            try {
                const miniBall = this.physics.add.image(this.ball.x, this.ball.y, 'ball');
                miniBall.setCollideWorldBounds(true);
                miniBall.setBounce(1);
                miniBall.setCircle(6);
                miniBall.setScale(0.8);
                
                // Set random velocity
                const angle = Phaser.Math.Between(0, 360);
                const vx = this.currentBallSpeed * Math.cos(Phaser.Math.DegToRad(angle));
                const vy = this.currentBallSpeed * Math.sin(Phaser.Math.DegToRad(angle));
                miniBall.setVelocity(vx, vy);
                
                this.miniBalls.push(miniBall);
            } catch (error) {
                console.error('Failed to create mini ball:', error);
            }
        }
    }

    private shootProjectile() {
        try {
            // Create a projectile
            const projectile = this.physics.add.image(this.paddle.x, this.paddle.y - 20, '');
            projectile.setDisplaySize(6, 20);
            projectile.setTint(0x00ffff);
            
            // Set velocity
            projectile.setVelocityY(-400);
            
            // Add to projectile group
            this.projectileGroup.add(projectile);
            this.projectiles.push(projectile);
            
            // Play sound
            try {
                this.sound.play('pew');
            } catch (error) {
                console.error('Failed to play pew sound:', error);
            }
        } catch (error) {
            console.error('Failed to create projectile:', error);
        }
    }

    private generateLevel() {
        // Clear existing bricks
        this.bricks.forEach(brick => brick.destroy());
        this.bricks = [];
        
        // Create level generator if not exists
        if (!this.levelGenerator) {
            const levelConfig = LevelGenerator.getDefaultConfig(
                this.state.level,
                this.sys.game.canvas.width,
                this.sys.game.canvas.height
            );
            
            this.levelGenerator = new LevelGenerator(this, levelConfig);
        } else {
            // Update level config
            this.levelGenerator.config.level = this.state.level;
        }
        
        // Generate new level
        this.bricks = this.levelGenerator.generate();
        
        // Add bricks to the group
        this.bricks.forEach(brick => {
            this.brickGroup.add(brick);
            
            // Skip indestructible bricks in count
            if (!brick.isIndestructible()) {
                this.state.bricksLeft++;
            }
        });
    }

    private onLevelComplete() {
        this.state.isLevelComplete = true;
        
        // Increase level
        this.state.level++;
        
        // Reset ball
        this.resetBall();
        
        // Clear power-ups
        this.clearAllPowerUps();
        
        // Generate new level
        this.generateLevel();
        
        // Reset state
        this.state.isLevelComplete = false;
    }

    private onBallLost() {
        // Lose a life
        this.state.lives--;
        this.updateLivesText();
        
        // Play sound
        try {
            this.sound.play('beep');
        } catch (error) {
            console.error('Failed to play beep sound:', error);
        }
        
        // Check for game over
        if (this.state.lives <= 0) {
            this.gameOver();
        } else {
            // Reset the ball
            this.resetBall();
        }
    }

    private resetBall() {
        // Reset ball position
        this.ball.setPosition(this.paddle.x, this.paddle.y - 20);
        this.ball.setVelocity(0, 0);
        this.state.ballLaunched = false;
        
        // Clear mini balls
        this.miniBalls.forEach(miniBall => miniBall.destroy());
        this.miniBalls = [];
    }

    private clearAllPowerUps() {
        // Clear timeouts
        this.state.activePowerUps.forEach((timeoutId, type) => {
            clearTimeout(timeoutId);
        });
        
        // Clear map
        this.state.activePowerUps.clear();
        
        // Reset paddle size
        this.currentPaddleSizeStage = 2;
        this.updatePaddleSize();
        
        // Reset ball speed
        this.currentBallSpeed = this.initialBallSpeed;
    }

    private gameOver() {
        this.state.isGameOver = true;
        
        // Save high score
        const currentHighScore = parseInt(localStorage.getItem('loftwahnoid_highscore') || '0');
        if (this.state.score > currentHighScore) {
            localStorage.setItem('loftwahnoid_highscore', String(this.state.score));
        }
        
        // Play game over sound
        try {
            this.sound.play('gameover');
        } catch (error) {
            console.error('Failed to play gameover sound:', error);
        }
        
        // Store the score to be displayed in the GameOver scene
        this.data.set('finalScore', this.state.score);
        this.data.set('highScore', Math.max(currentHighScore, this.state.score));
        
        // Go to game over scene
        this.scene.start('GameOver');
    }

    private togglePause() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            // Pause the game
            this.pauseText.setVisible(true);
            this.physics.pause();
        } else {
            // Resume the game
            this.pauseText.setVisible(false);
            this.physics.resume();
        }
    }

    private addScore(points: number) {
        this.state.score += points;
        this.scoreText.setText(`Score: ${this.state.score}`);
    }

    private updateLivesText() {
        this.livesText.setText(`Lives: ${this.state.lives}`);
    }
}