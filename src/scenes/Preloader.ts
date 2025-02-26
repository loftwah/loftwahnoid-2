import { Scene } from 'phaser';

export class Preloader extends Scene
{
    // Track which assets failed to load
    private failedImages: Set<string> = new Set();
    private failedAudio: Set<string> = new Set();

    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);
        });

        // Add error handling for failed asset loads
        this.load.on('loaderror', (fileObj: any) => {
            console.warn(`Failed to load: ${fileObj.key} (${fileObj.type})`);
            
            // Track failed assets by type
            if (fileObj.type === 'image') {
                this.failedImages.add(fileObj.key);
            } else if (fileObj.type === 'audio') {
                this.failedAudio.add(fileObj.key);
            }
        });
    }

    preload ()
    {
        // Set the base path for loading assets
        this.load.setPath('');

        // Add debugging information
        console.log('Starting to load assets...');
        
        // Load background images (these are actual PNG files)
        for (let i = 1; i <= 5; i++) {
            console.log(`Loading background${i} from images/background${i}.png`);
            this.load.image(`background${i}`, `images/background${i}.png`);
        }

        try {
            // Load game objects with debug info - these are SVGs with PNG extensions
            console.log('Loading ball from images/ball.png');
            this.load.image('ball', 'images/ball.png');
            console.log('Loading paddle from images/paddle.png');
            this.load.image('paddle', 'images/paddle.png');
            
            // Load brick types with debug info
            console.log('Loading brick1 from images/brick1.png');
            this.load.image('brick1', 'images/brick1.png');
            console.log('Loading brick2 from images/brick2.png');
            this.load.image('brick2', 'images/brick2.png');
            console.log('Loading brick3 from images/brick3.png');
            this.load.image('brick3', 'images/brick3.png');
            
            // Load all power-up images - per requirements document section 2.5
            console.log('Loading power-up icons...');
            this.load.image('powerup_life', 'images/powerup_life.png');
            this.load.image('powerup_shoot', 'images/powerup_shoot.png');
            this.load.image('powerup_slow', 'images/powerup_slow.png');
            this.load.image('powerup_large', 'images/powerup_large.png');
            this.load.image('powerup_multiball', 'images/powerup_multiball.png');
            this.load.image('powerup_fast', 'images/powerup_fast.png');
            this.load.image('powerup_small', 'images/powerup_small.png');
            
            // Load logo with debug info
            console.log('Loading logo from images/logo.png');
            this.load.image('logo', 'images/logo.png');
        } catch (error) {
            console.error('Error loading images:', error);
            // We'll handle this in the createFallbackAssets method
        }
        
        try {
            // Load music tracks with debug info
            console.log('Loading music tracks...');
            this.load.audio('break_the_grid', 'music/Break the Grid.mp3');
            this.load.audio('gridlock_ruin', 'music/Gridlock Ruin.mp3');
            this.load.audio('neon_collapse', 'music/Neon Collapse.mp3');
            this.load.audio('paddle_pulse', 'music/Paddle Pulse.mp3');
            this.load.audio('shatter_circuit', 'music/Shatter Circuit.mp3');
        } catch (error) {
            console.error('Error loading music tracks:', error);
            // We'll handle this in the createFallbackAssets method
        }
        
        try {
            // Load sound effects
            console.log('Loading sound effects...');
            this.load.audio('beep', 'sounds/beep.wav');
            this.load.audio('chime', 'sounds/chime.wav');
            this.load.audio('crunch', 'sounds/crunch.wav');
            this.load.audio('gameover', 'sounds/gameover.wav');
            this.load.audio('pew', 'sounds/pew.wav');
            this.load.audio('ping', 'sounds/ping.wav');
            this.load.audio('start', 'sounds/start.wav');
        } catch (error) {
            console.error('Error loading sound effects:', error);
            // Mark all sound effects as failed - we'll handle silent operation
            this.addAllSoundEffectsToFailedList();
        }
    }

    create ()
    {
        console.log('Preloader create() method started');
        console.log('Failed images:', Array.from(this.failedImages));
        console.log('Failed audio:', Array.from(this.failedAudio));

        // Create fallback assets for any failed loads
        this.createFallbackAssets();
        
        // Initialize game data in local storage if not already present
        this.initializeLocalStorage();

        console.log('Moving to MainMenu scene');
        // Move to the MainMenu
        this.scene.start('MainMenu');
    }

    // Initialize all required local storage settings as specified in requirements
    private initializeLocalStorage() {
        // Background selection (section 2.1 of requirements)
        // Valid values: "1"-"5" for specific backgrounds, "0" for black, "random" for random
        if (!localStorage.getItem('loftwahnoid_background')) {
            localStorage.setItem('loftwahnoid_background', '1');
            console.log('Set default background to 1');
        } else {
            console.log('Current background setting:', localStorage.getItem('loftwahnoid_background'));
        }
        
        // High score tracking (section 2.4 of requirements)
        if (!localStorage.getItem('loftwahnoid_highscore')) {
            localStorage.setItem('loftwahnoid_highscore', '0');
            console.log('Set default high score to 0');
        } else {
            console.log('Current high score:', localStorage.getItem('loftwahnoid_highscore'));
        }
        
        // Music track selection (section 2.2 of requirements)
        if (!localStorage.getItem('loftwahnoid_music_track')) {
            localStorage.setItem('loftwahnoid_music_track', '0');
            console.log('Set default music track to 0');
        } else {
            console.log('Current music track setting:', localStorage.getItem('loftwahnoid_music_track'));
        }
        
        // Music playing state - must NOT auto-play (section 5.4 of requirements)
        if (!localStorage.getItem('loftwahnoid_music_playing')) {
            localStorage.setItem('loftwahnoid_music_playing', 'false');
            console.log('Set default music playing to false');
        } else {
            console.log('Current music playing setting:', localStorage.getItem('loftwahnoid_music_playing'));
        }
        
        // Music loop state (section 2.2.1 of requirements)
        if (!localStorage.getItem('loftwahnoid_music_loop')) {
            localStorage.setItem('loftwahnoid_music_loop', 'true');
            console.log('Set default music loop to true');
        } else {
            console.log('Current music loop setting:', localStorage.getItem('loftwahnoid_music_loop'));
        }
    }

    // Add all sound effects to failed list for silent fallback
    private addAllSoundEffectsToFailedList() {
        const soundEffects = ['beep', 'chime', 'crunch', 'gameover', 'pew', 'ping', 'start'];
        for (const sound of soundEffects) {
            this.failedAudio.add(sound);
        }
        console.log('All sound effects marked as failed, will use silent operation');
    }

    // Create fallback assets for any that failed to load
    private createFallbackAssets() {
        // Generate fallback images
        if (this.failedImages.size > 0) {
            console.log(`Creating fallback images for: ${Array.from(this.failedImages).join(', ')}`);
            
            // Create a graphics object for drawing fallbacks
            const graphics = this.make.graphics({});
            
            // Ball fallback (simple circle with gradient as per requirements)
            if (this.failedImages.has('ball')) {
                graphics.clear();
                graphics.fillStyle(0xffffff);
                graphics.fillCircle(10, 10, 10);
                graphics.generateTexture('ball', 20, 20);
                console.log('Created fallback ball texture');
            }
            
            // Paddle fallback (rounded rectangle with gradient as per requirements)
            if (this.failedImages.has('paddle')) {
                graphics.clear();
                graphics.fillStyle(0x3366ff);
                graphics.fillRoundedRect(0, 0, 100, 20, 5);
                graphics.lineStyle(2, 0x99ccff);
                graphics.strokeRoundedRect(0, 0, 100, 20, 5);
                graphics.generateTexture('paddle', 100, 20);
                console.log('Created fallback paddle texture');
            }
            
            // Brick fallbacks (colored rectangles with borders as per requirements)
            const brickColors = [0x999999, 0xff6666, 0x666666]; // Standard, tough, indestructible
            
            for (let i = 1; i <= 3; i++) {
                if (this.failedImages.has(`brick${i}`)) {
                    graphics.clear();
                    graphics.fillStyle(brickColors[i-1]);
                    graphics.fillRect(1, 1, 50, 20);
                    graphics.lineStyle(2, 0xffffff);
                    graphics.strokeRect(1, 1, 50, 20);
                    graphics.generateTexture(`brick${i}`, 52, 22);
                    console.log(`Created fallback brick${i} texture`);
                }
            }
            
            // Power-up fallbacks based on requirements section 2.5
            this.createPowerupFallbacks(graphics);
            
            // Logo fallback
            if (this.failedImages.has('logo')) {
                graphics.clear();
                graphics.fillStyle(0x000000);
                graphics.fillRect(0, 0, 512, 256);
                graphics.fillStyle(0xffffff);
                // Create stylized text as a bitmap
                const textStyle = {
                    fontFamily: 'Arial Black',
                    fontSize: '60px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    align: 'center'
                };
                const textImage = this.make.text({ 
                    x: 256, 
                    y: 128, 
                    text: 'LOFTWAHNOID', 
                    style: textStyle,
                    add: false
                }).setOrigin(0.5);
                
                graphics.fillRect(50, 80, 412, 96);
                graphics.generateTexture('logo', 512, 256);
                console.log('Created fallback logo texture');
            }
            
            // Background fallbacks (solid color gradients as per requirements)
            this.createBackgroundFallbacks(graphics);
        }
        
        // For failed audio, we don't need to create actual fallbacks
        // The game will handle missing audio by not playing sounds
        if (this.failedAudio.size > 0) {
            console.log(`Missing audio assets: ${Array.from(this.failedAudio).join(', ')}`);
            console.log('The game will operate silently for these sounds');
        }
    }

    // Create fallbacks for all power-up types from requirements doc
    private createPowerupFallbacks(graphics: Phaser.GameObjects.Graphics) {
        // Extra Life (Heart icon)
        if (this.failedImages.has('powerup_life')) {
            graphics.clear();
            graphics.fillStyle(0xff0000);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0xffffff);
            // Draw heart shape
            graphics.fillRect(10, 8, 10, 10);
            graphics.fillCircle(8, 10, 5);
            graphics.fillCircle(22, 10, 5);
            graphics.generateTexture('powerup_life', 30, 30);
            console.log('Created fallback powerup_life texture');
        }
        
        // Shooting Paddle (Gun/bullet icon)
        if (this.failedImages.has('powerup_shoot')) {
            graphics.clear();
            graphics.fillStyle(0xffcc00);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0x000000);
            // Draw bullet shape
            graphics.fillTriangle(10, 20, 20, 5, 30, 20);
            graphics.generateTexture('powerup_shoot', 30, 30);
            console.log('Created fallback powerup_shoot texture');
        }
        
        // Slow Ball (Turtle icon)
        if (this.failedImages.has('powerup_slow')) {
            graphics.clear();
            graphics.fillStyle(0x00cc00);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0x005500);
            // Simple turtle shell shape
            graphics.fillCircle(15, 15, 10);
            graphics.fillStyle(0x00aa00);
            graphics.fillCircle(15, 15, 7);
            graphics.generateTexture('powerup_slow', 30, 30);
            console.log('Created fallback powerup_slow texture');
        }
        
        // Larger Paddle (Outward arrow icon)
        if (this.failedImages.has('powerup_large')) {
            graphics.clear();
            graphics.fillStyle(0x0066ff);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0xffffff);
            // Draw outward arrows
            graphics.fillTriangle(5, 15, 12, 8, 12, 22);
            graphics.fillTriangle(25, 15, 18, 8, 18, 22);
            graphics.generateTexture('powerup_large', 30, 30);
            console.log('Created fallback powerup_large texture');
        }
        
        // Mini Ball (Multi-ball icon)
        if (this.failedImages.has('powerup_multiball')) {
            graphics.clear();
            graphics.fillStyle(0xcc66ff);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0xffffff);
            // Draw multiple small circles
            graphics.fillCircle(10, 10, 5);
            graphics.fillCircle(20, 10, 5);
            graphics.fillCircle(15, 20, 5);
            graphics.generateTexture('powerup_multiball', 30, 30);
            console.log('Created fallback powerup_multiball texture');
        }
        
        // Fast Ball (Lightning icon)
        if (this.failedImages.has('powerup_fast')) {
            graphics.clear();
            graphics.fillStyle(0xff3300);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0xffff00);
            // Draw lightning bolt
            graphics.fillTriangle(10, 8, 15, 15, 20, 8);
            graphics.fillTriangle(15, 15, 10, 22, 20, 22);
            graphics.generateTexture('powerup_fast', 30, 30);
            console.log('Created fallback powerup_fast texture');
        }
        
        // Smaller Paddle (Inward arrow icon)
        if (this.failedImages.has('powerup_small')) {
            graphics.clear();
            graphics.fillStyle(0xff6600);
            graphics.fillCircle(15, 15, 15);
            graphics.fillStyle(0xffffff);
            // Draw inward arrows
            graphics.fillTriangle(12, 15, 5, 8, 5, 22);
            graphics.fillTriangle(18, 15, 25, 8, 25, 22);
            graphics.generateTexture('powerup_small', 30, 30);
            console.log('Created fallback powerup_small texture');
        }
    }

    // Create gradient backgrounds as fallbacks as specified in requirements
    private createBackgroundFallbacks(graphics: Phaser.GameObjects.Graphics) {
        // Create black background for option 0
        graphics.clear();
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, 1024, 768);
        graphics.generateTexture('black_bg', 1024, 768);
        console.log('Created black background texture');
        
        // Create random background indicator
        graphics.clear();
        graphics.fillStyle(0x555555);
        graphics.fillRect(0, 0, 160, 120);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, 160, 120);
        graphics.fillStyle(0xffffff);
        // Draw a '?' symbol in the center
        graphics.fillRect(75, 50, 10, 15);
        graphics.fillCircle(80, 40, 10);
        graphics.generateTexture('random_bg', 160, 120);
        console.log('Created random background indicator texture');
        
        // Create the numbered background fallbacks with improved colors
        for (let i = 1; i <= 5; i++) {
            if (this.failedImages.has(`background${i}`)) {
                graphics.clear();
                
                // Create more subtle gradients that won't be confused with game objects
                // Use darker, more desaturated colors
                const colors = [
                    [0x000022, 0x000066], // Dark blue gradient
                    [0x002211, 0x004433], // Dark teal gradient (less brick-like)
                    [0x220022, 0x440044], // Dark purple gradient
                    [0x221100, 0x442200], // Dark amber gradient
                    [0x111122, 0x222244]  // Dark slate gradient
                ];
                
                const [colorFrom, colorTo] = colors[i-1];
                
                // Add a subtle pattern to make backgrounds more distinct
                graphics.fillGradientStyle(colorFrom, colorFrom, colorTo, colorTo, 1);
                graphics.fillRect(0, 0, 1024, 768);
                
                // Add a subtle grid pattern to make it clear this is a background
                graphics.lineStyle(1, 0xffffff, 0.1);
                for (let x = 0; x < 1024; x += 64) {
                    graphics.moveTo(x, 0);
                    graphics.lineTo(x, 768);
                }
                for (let y = 0; y < 768; y += 64) {
                    graphics.moveTo(0, y);
                    graphics.lineTo(1024, y);
                }
                
                graphics.generateTexture(`background${i}`, 1024, 768);
                console.log(`Created fallback background${i} texture with grid pattern`);
            }
        }
    }

    // Add this function to your Preloader scene
    private handleLoadError() {
        // Create a warning sign
        const warningText = this.add.text(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height / 2 - 50,
            'Some assets failed to load.\nThe game will continue with fallback assets.',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffff00',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add a continue button
        const continueButton = this.add.text(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height / 2 + 50,
            'Continue',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#4169e1',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();
        
        // Hide the texts after a short time and continue
        continueButton.on('pointerdown', () => {
            warningText.setVisible(false);
            continueButton.setVisible(false);
            this.scene.start('MainMenu');
        });
        
        // Or automatically continue after 3 seconds
        this.time.delayedCall(3000, () => {
            warningText.setVisible(false);
            continueButton.setVisible(false);
            this.scene.start('MainMenu');
        });
    }
}
