import { Scene, Physics, GameObjects } from 'phaser';
import { PowerUp, PowerUpType } from './PowerUp';

export enum BrickType {
    Standard = 'standard',
    Tough = 'tough',
    Indestructible = 'indestructible'
}

interface BrickConfig {
    scene: Scene;
    x: number;
    y: number;
    type: BrickType;
    width?: number;
    height?: number;
}

export class Brick extends Physics.Arcade.Sprite {
    private brickType: BrickType;
    private maxHealth: number;
    private currentHealth: number;
    private scoreValue: number;
    private powerUpChance: number = 0.3; // 30% chance to drop a power-up
    
    constructor(config: BrickConfig) {
        super(config.scene, config.x, config.y, getBrickTextureKey(config.type));
        
        this.brickType = config.type;
        
        // Set up health based on type
        switch (this.brickType) {
            case BrickType.Standard:
                this.maxHealth = 1;
                this.scoreValue = 10;
                break;
            case BrickType.Tough:
                this.maxHealth = 3;
                this.scoreValue = 20;
                break;
            case BrickType.Indestructible:
                this.maxHealth = Number.POSITIVE_INFINITY;
                this.scoreValue = 0;
                break;
            default:
                this.maxHealth = 1;
                this.scoreValue = 10;
        }
        
        this.currentHealth = this.maxHealth;
        
        // Add to scene
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        
        // Set up physics
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setImmovable(true);
            
            // Set custom size if provided
            if (config.width && config.height) {
                body.setSize(config.width, config.height);
            }
        }
        
        // Apply visual based on texture
        this.setupVisuals();
    }
    
    private setupVisuals(): void {
        try {
            // Set brick texture based on type
            const textureKey = getBrickTextureKey(this.brickType);
            
            if (this.scene.textures.exists(textureKey)) {
                this.setTexture(textureKey);
            } else {
                throw new Error(`Texture ${textureKey} not found`);
            }
        } catch (error) {
            console.error('Failed to set brick texture:', error);
            
            // Create fallback visuals based on type
            let fillColor: number;
            
            switch (this.brickType) {
                case BrickType.Standard:
                    fillColor = 0xcccccc;
                    break;
                case BrickType.Tough:
                    fillColor = 0xff0000;
                    break;
                case BrickType.Indestructible:
                    fillColor = 0x444444;
                    break;
                default:
                    fillColor = 0xcccccc;
            }
            
            // Replace sprite with a rectangle graphic
            const width = this.displayWidth || 64;
            const height = this.displayHeight || 32;
            
            // Create a graphic to represent the brick
            const graphics = this.scene.add.rectangle(this.x, this.y, width, height, fillColor);
            graphics.setStrokeStyle(2, 0xffffff);
            
            // Save reference to the graphic
            this.setData('fallbackGraphic', graphics);
        }
    }
    
    hit(): number {
        // Indestructible bricks don't take damage
        if (this.brickType === BrickType.Indestructible) {
            try {
                this.scene.sound.play('ping');
            } catch (error) {
                console.error('Failed to play ping sound:', error);
            }
            return 0;
        }
        
        // Reduce health
        this.currentHealth--;
        
        if (this.currentHealth <= 0) {
            // Brick destroyed
            try {
                this.scene.sound.play('crunch');
            } catch (error) {
                console.error('Failed to play crunch sound:', error);
            }
            
            // Check for power-up drop
            this.tryDropPowerUp();
            
            // Destroy the brick
            this.destroy();
            
            return this.scoreValue;
        } else {
            // Brick damaged but not destroyed
            try {
                this.scene.sound.play('ping');
            } catch (error) {
                console.error('Failed to play ping sound:', error);
            }
            
            // Update appearance for multi-hit bricks
            this.updateDamageAppearance();
            
            return 0;
        }
    }
    
    private updateDamageAppearance(): void {
        // Visual feedback for damage on tough bricks
        if (this.brickType === BrickType.Tough) {
            const damageTint = interpolateColor(0xff0000, 0x880000, this.currentHealth / this.maxHealth);
            this.setTint(damageTint);
            
            // Add crack animation or effect
            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0.6, to: 1 },
                duration: 200,
                ease: 'Power2'
            });
        }
    }
    
    private tryDropPowerUp(): void {
        // Check if we should drop a power-up
        if (Math.random() < this.powerUpChance) {
            // Create a power-up at the brick's position
            new PowerUp({
                scene: this.scene,
                x: this.x,
                y: this.y,
                type: PowerUp.getRandomType()
            });
        }
    }
    
    destroy(): void {
        // Clean up any fallback graphics
        const fallbackGraphic = this.getData('fallbackGraphic') as GameObjects.Rectangle;
        if (fallbackGraphic) {
            fallbackGraphic.destroy();
        }
        
        // Call parent destroy
        super.destroy();
    }
    
    isIndestructible(): boolean {
        return this.brickType === BrickType.Indestructible;
    }
}

// Helper function to get the correct texture key for each brick type
function getBrickTextureKey(brickType: BrickType): string {
    switch (brickType) {
        case BrickType.Standard:
            return 'brick1';
        case BrickType.Tough:
            return 'brick2';
        case BrickType.Indestructible:
            return 'brick3';
        default:
            return 'brick1';
    }
}

// Helper function to interpolate between two colors
function interpolateColor(startColor: number, endColor: number, factor: number): number {
    const startRed = (startColor >> 16) & 0xFF;
    const startGreen = (startColor >> 8) & 0xFF;
    const startBlue = startColor & 0xFF;
    
    const endRed = (endColor >> 16) & 0xFF;
    const endGreen = (endColor >> 8) & 0xFF;
    const endBlue = endColor & 0xFF;
    
    const resultRed = Math.round(startRed + factor * (endRed - startRed));
    const resultGreen = Math.round(startGreen + factor * (endGreen - startGreen));
    const resultBlue = Math.round(startBlue + factor * (endBlue - startBlue));
    
    return (resultRed << 16) | (resultGreen << 8) | resultBlue;
} 