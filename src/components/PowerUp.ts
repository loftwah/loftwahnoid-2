import { Scene, GameObjects, Physics } from 'phaser';

export enum PowerUpType {
    ExtraLife = 'extraLife',
    ShootingPaddle = 'shootingPaddle',
    SlowBall = 'slowBall',
    LargerPaddle = 'largerPaddle',
    MiniBall = 'miniBall',
    FastBall = 'fastBall',
    SmallerPaddle = 'smallerPaddle'
}

interface PowerUpConfig {
    scene: Scene;
    x: number;
    y: number;
    type: PowerUpType;
}

export class PowerUp extends Physics.Arcade.Sprite {
    private powerUpType: PowerUpType;
    private isBeneficial: boolean;
    private icon!: GameObjects.GameObject;
    private fallSpeed: number = 150;
    
    constructor(config: PowerUpConfig) {
        super(config.scene, config.x, config.y, '');
        
        this.powerUpType = config.type;
        
        // Determine if this power-up is beneficial or detrimental
        this.isBeneficial = [
            PowerUpType.ExtraLife,
            PowerUpType.ShootingPaddle,
            PowerUpType.SlowBall,
            PowerUpType.LargerPaddle,
            PowerUpType.MiniBall
        ].includes(this.powerUpType);
        
        // Add to scene
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        
        // Set up the visual appearance
        this.setupVisuals();
        
        // Set up physics
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setVelocity(0, this.fallSpeed);
            body.setSize(40, 40);
        }
    }
    
    private setupVisuals(): void {
        // Create the base shape
        const baseColor = this.isBeneficial ? 0x00ff00 : 0xff0000;
        const baseShape = this.scene.add.rectangle(0, 0, 40, 40, baseColor, 0.7);
        baseShape.setStrokeStyle(2, 0xffffff);
        
        // Try to load the appropriate icon
        let iconKey = '';
        let fallbackIcon = '';
        
        switch (this.powerUpType) {
            case PowerUpType.ExtraLife:
                iconKey = 'powerup_life';
                fallbackIcon = '❤️';
                break;
            case PowerUpType.ShootingPaddle:
                iconKey = 'powerup_shoot';
                fallbackIcon = '🔫';
                break;
            case PowerUpType.SlowBall:
                iconKey = '';
                fallbackIcon = '🐢';
                break;
            case PowerUpType.LargerPaddle:
                iconKey = '';
                fallbackIcon = '📏';
                break;
            case PowerUpType.MiniBall:
                iconKey = '';
                fallbackIcon = '➕';
                break;
            case PowerUpType.FastBall:
                iconKey = '';
                fallbackIcon = '⚡';
                break;
            case PowerUpType.SmallerPaddle:
                iconKey = '';
                fallbackIcon = '📉';
                break;
        }
        
        // Try to use an image for the icon, fall back to text
        try {
            if (iconKey && this.scene.textures.exists(iconKey)) {
                this.icon = this.scene.add.sprite(0, 0, iconKey).setScale(0.5);
            } else {
                throw new Error('Icon texture not available');
            }
        } catch (error) {
            // Use text fallback
            this.icon = this.scene.add.text(0, 0, fallbackIcon, { 
                fontSize: '28px' 
            }).setOrigin(0.5);
        }
        
        // Create the container for this power-up
        const container = this.scene.add.container(this.x, this.y, [baseShape, this.icon]);
        
        // Add animation to make it pulse
        this.scene.tweens.add({
            targets: container,
            scale: { from: 0.9, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Connect the container to this sprite
        this.setData('container', container);
    }
    
    update(): void {
        // Update the container position to match the sprite
        const container = this.getData('container') as Phaser.GameObjects.Container;
        if (container) {
            container.setPosition(this.x, this.y);
        }
        
        // Check if power-up is out of bounds (below the screen)
        if (this.y > this.scene.sys.game.canvas.height + 50) {
            this.destroy();
        }
    }
    
    handleCollection(): PowerUpType {
        // Play sound
        try {
            this.scene.sound.play('chime');
        } catch (error) {
            console.error('Failed to play chime sound:', error);
        }
        
        // Destroy the power-up
        this.destroy();
        
        // Return the type for handling by the game scene
        return this.powerUpType;
    }
    
    destroy(): void {
        // Destroy the container
        const container = this.getData('container') as Phaser.GameObjects.Container;
        if (container) {
            container.destroy();
        }
        
        // Call the parent destroy method
        super.destroy();
    }
    
    static getRandomType(): PowerUpType {
        const types = Object.values(PowerUpType);
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }
} 