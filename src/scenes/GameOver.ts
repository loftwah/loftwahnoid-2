import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;
    finalScore: number = 0;
    highScore: number = 0;

    constructor()
    {
        super('GameOver');
    }

    init(data: any)
    {
        // Get the scores from the passed data
        this.finalScore = data.finalScore || 0;
        this.highScore = data.highScore || 0;
    }

    create()
    {
        const gameWidth = this.sys.game.canvas.width;
        const gameHeight = this.sys.game.canvas.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff0000);

        // Try to add background image, with fallback to color
        try {
            this.background = this.add.image(centerX, centerY, 'background');
            this.background.setAlpha(0.5);
        } catch (error) {
            console.error('Failed to load background:', error);
        }

        // Loftwahnoid branding
        this.add.text(centerX, centerY - 100, 'Loftwahnoid', {
            fontFamily: 'Arial Black', 
            fontSize: '48px', 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Game over text
        this.gameover_text = this.add.text(centerX, centerY, 'Game Over', {
            fontFamily: 'Arial Black', 
            fontSize: '64px', 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        // Display final score
        this.add.text(centerX, centerY + 80, `Final Score: ${this.finalScore}`, {
            fontFamily: 'Arial', 
            fontSize: '32px', 
            color: '#ffffff'
        }).setOrigin(0.5);

        // Display high score
        this.add.text(centerX, centerY + 130, `High Score: ${this.highScore}`, {
            fontFamily: 'Arial', 
            fontSize: '32px', 
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create buttons
        const restartButton = this.add.text(centerX - 100, centerY + 200, 'Restart', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#ff4500',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const menuButton = this.add.text(centerX + 100, centerY + 200, 'Main Menu', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#4169e1',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        // Add button handlers
        restartButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
