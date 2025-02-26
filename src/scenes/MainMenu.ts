import { Scene, GameObjects } from 'phaser';
import { MusicPlayer } from '../components/MusicPlayer';

export class MainMenu extends Scene
{
    private background!: GameObjects.Image;
    private logo!: GameObjects.Image;
    private title!: GameObjects.Text;
    private musicPlayer!: MusicPlayer;
    
    // Menu elements
    private menuContainer!: GameObjects.Container;
    private musicContainer!: GameObjects.Container;
    private startButton!: GameObjects.Text;
    private controlsButton!: GameObjects.Text;
    private backgroundsButton!: GameObjects.Text;
    private exitButton!: GameObjects.Text;
    private selectedButton: GameObjects.Text | null = null;
    private selectedButtonIndex: number = 0;
    
    // Music panel elements
    private playPauseButton!: GameObjects.Text;
    private prevButton!: GameObjects.Text;
    private nextButton!: GameObjects.Text;
    private loopButton!: GameObjects.Text;
    private trackNameText!: GameObjects.Text;
    private trackListTexts: GameObjects.Text[] = [];
    
    // Background selection grid elements
    private bgSelectionActive: boolean = false;
    private bgContainer!: GameObjects.Container;
    private bgThumbnails: GameObjects.Image[] = [];
    private bgSelectionText!: GameObjects.Text;
    private bgBackButton!: GameObjects.Text;
    private selectedBgIndex: number = 0;
    
    // Controls screen elements
    private controlsActive: boolean = false;
    private controlsContainer!: GameObjects.Container;
    private controlsText!: GameObjects.Text;
    private controlsBackButton!: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        console.log('MainMenu create() method started');
        
        // Get saved background preference
        const bgIndex = localStorage.getItem('loftwahnoid_background');
        this.selectedBgIndex = bgIndex ? parseInt(bgIndex) : 1;
        console.log('Selected background index:', this.selectedBgIndex);
        
        // Set up background
        try {
            console.log(`Attempting to load background${this.selectedBgIndex}`);
            this.background = this.add.image(512, 384, `background${this.selectedBgIndex}`);
            this.background.setDisplaySize(1024, 768);
            console.log('Background loaded successfully');
        } catch (error) {
            console.error('Failed to load background:', error);
            // Use black background as fallback
            this.cameras.main.setBackgroundColor('#000000');
            this.background = this.add.image(512, 384, 'background');
            this.background.setAlpha(0.5);
        }

        // Add logo
        try {
            console.log('Attempting to load logo');
            this.logo = this.add.image(512, 150, 'logo');
            this.logo.setScale(0.8);
            console.log('Logo loaded successfully');
        } catch (error) {
            console.error('Failed to load logo:', error);
            // Create a text logo as fallback
            this.logo = this.add.image(512, 150, 'background').setAlpha(0);
            this.title = this.add.text(512, 150, 'LOFTWAHNOID', {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
        }
        
        // Create the main container for the menu (left panel)
        this.menuContainer = this.add.container(256, 384);
        
        // Create menu items
        this.startButton = this.createMenuButton(0, -100, 'Start Game');
        this.controlsButton = this.createMenuButton(0, -25, 'Controls');
        this.backgroundsButton = this.createMenuButton(0, 50, 'Backgrounds');
        this.exitButton = this.createMenuButton(0, 125, 'Exit');
        
        // Add buttons to the menu container
        this.menuContainer.add([
            this.startButton,
            this.controlsButton,
            this.backgroundsButton,
            this.exitButton
        ]);
        
        console.log('Main menu buttons created');
        
        // Create the music player container (right panel)
        this.musicContainer = this.add.container(768, 384);
        
        // Create music player panel background
        const musicBg = this.add.rectangle(0, 0, 400, 500, 0x000000, 0.6);
        musicBg.setStrokeStyle(2, 0xffffff);
        
        // Create music player title
        const musicTitle = this.add.text(0, -220, 'Music Player', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        console.log('Initializing music player...');
        // Initialize the music player
        this.musicPlayer = new MusicPlayer(this);
        console.log('Music player initialized');
        
        // Create track info display
        this.trackNameText = this.add.text(0, -180, this.musicPlayer.getCurrentTrackName(), {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create playback controls
        this.playPauseButton = this.add.text(0, -140, this.musicPlayer.isCurrentlyPlaying() ? '❚❚ Pause' : '▶ Play', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.prevButton = this.add.text(-80, -140, '⏮ Prev', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.nextButton = this.add.text(80, -140, 'Next ⏭', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.loopButton = this.add.text(0, -100, this.musicPlayer.isCurrentlyLooping() ? '🔁 Loop: ON' : '🔁 Loop: OFF', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Create track list title
        const trackListTitle = this.add.text(0, -60, 'Playlist:', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create track list
        const tracks = this.musicPlayer.getTrackList();
        const currentTrackIndex = this.musicPlayer.getCurrentTrackIndex();
        
        for (let i = 0; i < tracks.length; i++) {
            const trackText = this.add.text(0, -20 + (i * 30), tracks[i].name, {
                fontFamily: 'Arial',
                fontSize: 16,
                color: i === currentTrackIndex ? '#ffff00' : '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            // Add click handler to select track
            trackText.on('pointerdown', () => {
                // Update track index and reinitialize
                this.musicPlayer.playNext(); // Hack to force track change
                this.updateMusicPlayerUI();
            });
            
            this.trackListTexts.push(trackText);
        }
        
        // Add all elements to the music container
        this.musicContainer.add([
            musicBg,
            musicTitle,
            this.trackNameText,
            this.playPauseButton,
            this.prevButton,
            this.nextButton,
            this.loopButton,
            trackListTitle,
            ...this.trackListTexts
        ]);
        
        // Create backgrounds selection container (initially hidden)
        this.createBackgroundsSelectionUI();
        
        // Create controls screen container (initially hidden)
        this.createControlsScreenUI();
        
        // Set up event handlers for buttons
        this.setupButtonHandlers();
        
        // Set up keyboard navigation
        this.setupKeyboardControls();
        
        // Set initial selection
        this.selectMenuButton(0);
    }
    
    private createMenuButton(x: number, y: number, text: string): GameObjects.Text {
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            if (this.selectedButton !== button) {
                button.setColor('#ffff00');
            }
        });
        
        button.on('pointerout', () => {
            if (this.selectedButton !== button) {
                button.setColor('#ffffff');
            }
        });
        
        return button;
    }
    
    private selectMenuButton(index: number) {
        // Reset previous selection
        if (this.selectedButton) {
            this.selectedButton.setColor('#ffffff');
        }
        
        // Ensure index is valid
        this.selectedButtonIndex = Phaser.Math.Clamp(index, 0, 3);
        
        // Get the new selected button
        const buttons = [this.startButton, this.controlsButton, this.backgroundsButton, this.exitButton];
        this.selectedButton = buttons[this.selectedButtonIndex];
        
        // Highlight the selected button
        if (this.selectedButton) {
            this.selectedButton.setColor('#ffff00');
        }
    }
    
    private createBackgroundsSelectionUI() {
        this.bgContainer = this.add.container(512, 384);
        this.bgContainer.setVisible(false);
        
        // Background for the selection screen
        const bgSelectionBg = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
        bgSelectionBg.setStrokeStyle(2, 0xffffff);
        
        // Title
        this.bgSelectionText = this.add.text(0, -250, 'Select Background', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create the grid layout for background thumbnails
        // Requirements specify 3x2 or 2x3 grid (section 2.1)
        this.bgThumbnails = [];
        
        // Define grid layout
        const gridWidth = 3;
        const gridHeight = 2;
        const thumbWidth = 160;
        const thumbHeight = 120;
        const padding = 20;
        const startX = -(thumbWidth + padding) * (gridWidth - 1) / 2;
        const startY = -80;
        
        // Add background options (5 from images + black + random)
        for (let i = 0; i < gridWidth * gridHeight; i++) {
            let x = startX + (i % gridWidth) * (thumbWidth + padding);
            let y = startY + Math.floor(i / gridWidth) * (thumbHeight + padding);
            
            let bgKey;
            let label;
            
            if (i < 5) {
                // Regular background options (1-5)
                bgKey = `background${i+1}`;
                label = `BG ${i+1}`;
            } else if (i === 5) {
                // Black background option as required
                bgKey = 'black_bg';
                label = 'Black';
                
                // Create black background texture if it doesn't exist
                if (!this.textures.exists('black_bg')) {
                    const blackBgGraphics = this.make.graphics({});
                    blackBgGraphics.fillStyle(0x000000);
                    blackBgGraphics.fillRect(0, 0, 1, 1);
                    blackBgGraphics.generateTexture('black_bg', 1, 1);
                }
            } else if (i === 6) {
                // Random background option as required
                bgKey = 'random_bg';
                label = 'Random';
                
                // Create random background texture if it doesn't exist
                if (!this.textures.exists('random_bg')) {
                    const randomBgGraphics = this.make.graphics({});
                    randomBgGraphics.fillStyle(0x555555);
                    randomBgGraphics.fillRect(0, 0, 160, 120);
                    randomBgGraphics.lineStyle(2, 0xffffff);
                    randomBgGraphics.strokeRect(0, 0, 160, 120);
                    randomBgGraphics.fillStyle(0xffffff);
                    randomBgGraphics.fillText('?', 80, 60, '48px Arial');
                    randomBgGraphics.generateTexture('random_bg', 160, 120);
                }
            }
            
            // Create thumbnail container
            const thumbContainer = this.add.container(x, y);
            
            // Create thumbnail image
            let thumb;
            try {
                thumb = this.add.image(0, 0, bgKey);
                thumb.setDisplaySize(thumbWidth, thumbHeight);
            } catch (error) {
                console.error(`Failed to create thumbnail for ${bgKey}:`, error);
                // Fallback to a colored rectangle
                const thumbGraphic = this.add.rectangle(0, 0, thumbWidth, thumbHeight, i === 5 ? 0x000000 : 0x333333);
                thumbGraphic.setStrokeStyle(2, 0xffffff);
                thumb = thumbGraphic;
            }
            
            // Create border for selection highlighting
            const border = this.add.rectangle(0, 0, thumbWidth + 6, thumbHeight + 6, 0xffff00, 0);
            border.setStrokeStyle(3, 0xffff00);
            
            // Create label
            const thumbLabel = this.add.text(0, thumbHeight/2 + 15, label, {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            }).setOrigin(0.5);
            
            // Add all elements to container
            thumbContainer.add([border, thumb, thumbLabel]);
            
            // Make interactive
            thumbContainer.setInteractive(new Phaser.Geom.Rectangle(-thumbWidth/2, -thumbHeight/2, thumbWidth, thumbHeight), 
                Phaser.Geom.Rectangle.Contains);
                
            // Store the background value
            let bgValue = i < 5 ? (i + 1).toString() : (i === 5 ? '0' : 'random');
            thumbContainer.setData('bgValue', bgValue);
            thumbContainer.setData('border', border);
            
            // Handle clicks
            thumbContainer.on('pointerdown', () => {
                this.selectBackground(bgValue);
                
                // Update visuals
                this.bgThumbnails.forEach(t => {
                    const b = t.getData('border');
                    b.setStrokeStyle(3, 0xffff00, t === thumbContainer ? 1 : 0);
                });
            });
            
            // Add hover effect
            thumbContainer.on('pointerover', () => {
                if (this.selectedBgIndex !== bgValue) {
                    const b = thumbContainer.getData('border');
                    b.setStrokeStyle(3, 0xffffff, 0.5);
                }
            });
            
            thumbContainer.on('pointerout', () => {
                if (this.selectedBgIndex !== bgValue) {
                    const b = thumbContainer.getData('border');
                    b.setStrokeStyle(3, 0xffff00, 0);
                }
            });
            
            this.bgThumbnails.push(thumbContainer);
        }
        
        // Back button
        this.bgBackButton = this.add.text(0, 250, 'Back', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.bgBackButton.on('pointerdown', () => {
            this.toggleBackgroundSelection(false);
        });
        
        // Add everything to container
        this.bgContainer.add([bgSelectionBg, this.bgSelectionText, ...this.bgThumbnails, this.bgBackButton]);
        
        // Highlight the currently selected background
        this.updateBackgroundSelection();
    }
    
    private selectBackground(bgIndex: string) {
        console.log(`Selecting background: ${bgIndex}`);
        this.selectedBgIndex = bgIndex;
        
        // Save to localStorage
        localStorage.setItem('loftwahnoid_background', bgIndex);
        
        // Update the main menu background if needed
        this.updateMenuBackground();
    }
    
    private updateBackgroundSelection() {
        if (this.bgThumbnails) {
            for (const thumb of this.bgThumbnails) {
                const bgValue = thumb.getData('bgValue');
                const border = thumb.getData('border');
                
                if (bgValue === this.selectedBgIndex) {
                    border.setStrokeStyle(3, 0xffff00, 1);
                } else {
                    border.setStrokeStyle(3, 0xffff00, 0);
                }
            }
        }
    }
    
    private updateMenuBackground() {
        // Get the actual background to display based on selected value
        let bgToShow: string;
        
        if (this.selectedBgIndex === 'random') {
            // Random between 1-5
            const randomBg = Math.floor(Math.random() * 5) + 1;
            bgToShow = `background${randomBg}`;
        } else if (this.selectedBgIndex === '0') {
            // Black background
            bgToShow = 'black_bg';
        } else {
            // Numbered background
            bgToShow = `background${this.selectedBgIndex}`;
        }
        
        // Update the background image
        try {
            if (this.background) {
                this.background.setTexture(bgToShow);
                this.background.setDisplaySize(1024, 768);
            } else {
                this.background = this.add.image(512, 384, bgToShow);
                this.background.setDisplaySize(1024, 768);
            }
        } catch (error) {
            console.error('Failed to update background:', error);
            // Use fallback
            this.cameras.main.setBackgroundColor('#000000');
            if (this.background) {
                this.background.setVisible(false);
            }
        }
    }
    
    private createControlsScreenUI() {
        this.controlsContainer = this.add.container(512, 384);
        this.controlsContainer.setVisible(false);
        
        // Background for the controls screen
        const controlsBg = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
        controlsBg.setStrokeStyle(2, 0xffffff);
        
        // Add title
        const controlsTitle = this.add.text(0, -250, 'Controls', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add control instructions
        this.controlsText = this.add.text(0, -50, 
            'Keyboard Controls:\n\n' +
            '- Left/Right Arrow keys: Move paddle\n' +
            '- Space: Launch ball\n' +
            '- P: Pause game\n' +
            '- M: Mute/Unmute music\n' +
            '- N: Next track\n' +
            '- L: Toggle music loop\n' +
            '- Enter: Select menu option\n' +
            '- Arrow Up/Down: Navigate menu', 
            {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        
        // Add back button
        this.controlsBackButton = this.add.text(0, 200, 'Back', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.controlsBackButton.on('pointerdown', () => {
            this.toggleControlsScreen(false);
        });
        
        this.controlsContainer.add([controlsBg, controlsTitle, this.controlsText, this.controlsBackButton]);
    }
    
    private toggleBackgroundSelection(visible: boolean) {
        console.log('Toggling background selection UI, visible:', visible);
        this.bgSelectionActive = visible;
        this.bgContainer.setVisible(visible);
        this.menuContainer.setVisible(!visible);
        this.musicContainer.setVisible(!visible);
    }
    
    private toggleControlsScreen(visible: boolean) {
        console.log('Toggling controls screen, visible:', visible);
        this.controlsActive = visible;
        this.controlsContainer.setVisible(visible);
        this.menuContainer.setVisible(!visible);
        this.musicContainer.setVisible(!visible);
    }
    
    private setupButtonHandlers() {
        console.log('Setting up button handlers');
        
        // Main menu button handlers
        this.startButton.on('pointerdown', () => {
            console.log('Start Game button clicked');
            this.startGame();
        });
        
        this.controlsButton.on('pointerdown', () => {
            console.log('Controls button clicked');
            this.toggleControlsScreen(true);
        });
        
        this.backgroundsButton.on('pointerdown', () => {
            console.log('Backgrounds button clicked');
            this.toggleBackgroundSelection(true);
        });
        
        this.exitButton.on('pointerdown', () => {
            console.log('Exit button clicked');
            // In a web context, this might redirect or close tab
            // For now, let's just go back to the menu
            this.scene.restart();
        });
        
        // Music player button handlers
        this.playPauseButton.on('pointerdown', () => {
            this.musicPlayer.playPause();
            this.updateMusicPlayerUI();
        });
        
        this.prevButton.on('pointerdown', () => {
            this.musicPlayer.playPrevious();
            this.updateMusicPlayerUI();
        });
        
        this.nextButton.on('pointerdown', () => {
            this.musicPlayer.playNext();
            this.updateMusicPlayerUI();
        });
        
        this.loopButton.on('pointerdown', () => {
            this.musicPlayer.toggleLoop();
            this.updateMusicPlayerUI();
        });
    }
    
    private setupKeyboardControls() {
        console.log('Setting up keyboard controls');
        
        // Add keyboard navigation - check if keyboard exists first
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
                console.log(`Key pressed: ${event.code}, current menu state: bgSelection=${this.bgSelectionActive}, controls=${this.controlsActive}`);
                
                // Handle navigation in the main menu
                if (!this.bgSelectionActive && !this.controlsActive) {
                    // Main menu navigation
                    if (event.code === 'ArrowUp') {
                        console.log('ArrowUp in main menu');
                        this.selectedButtonIndex = Math.max(0, this.selectedButtonIndex - 1);
                        this.selectMenuButton(this.selectedButtonIndex);
                    } else if (event.code === 'ArrowDown') {
                        console.log('ArrowDown in main menu');
                        this.selectedButtonIndex = Math.min(3, this.selectedButtonIndex + 1);
                        this.selectMenuButton(this.selectedButtonIndex);
                    } else if (event.code === 'Enter' || event.code === 'Space') {
                        console.log('Enter/Space in main menu');
                        if (this.selectedButton) {
                            // Trigger the button action
                            if (this.selectedButton === this.startButton) {
                                console.log('Start button activated via keyboard');
                                this.startGame();
                            } else if (this.selectedButton === this.controlsButton) {
                                console.log('Controls button activated via keyboard');
                                this.toggleControlsScreen(true);
                            } else if (this.selectedButton === this.backgroundsButton) {
                                console.log('Backgrounds button activated via keyboard');
                                this.toggleBackgroundSelection(true);
                            } else if (this.selectedButton === this.exitButton) {
                                console.log('Exit button activated via keyboard');
                                this.scene.restart();
                            }
                        }
                    }
                    
                    // Handle left/right for music controls when in main menu
                    if (event.code === 'ArrowLeft') {
                        console.log('ArrowLeft in main menu - previous track');
                        this.musicPlayer.playPrevious();
                        this.updateMusicPlayerUI();
                    } else if (event.code === 'ArrowRight') {
                        console.log('ArrowRight in main menu - next track');
                        this.musicPlayer.playNext();
                        this.updateMusicPlayerUI();
                    } else if (event.code === 'KeyP') {
                        console.log('P key in main menu - play/pause');
                        this.musicPlayer.playPause();
                        this.updateMusicPlayerUI();
                    } else if (event.code === 'KeyL') {
                        console.log('L key in main menu - toggle loop');
                        this.musicPlayer.toggleLoop();
                        this.updateMusicPlayerUI();
                    }
                } else if (this.bgSelectionActive) {
                    // Background selection navigation
                    if (event.code === 'Escape') {
                        console.log('Escape in background selection - returning to main menu');
                        this.toggleBackgroundSelection(false);
                        this.applySelectedBackground(); // Apply when exiting
                    } else if (event.code === 'ArrowUp') {
                        console.log('ArrowUp in background selection');
                        // Move up in the grid (if in second row)
                        if (this.selectedBgIndex > 3) {
                            this.selectBackground(this.selectedBgIndex - 3);
                        }
                    } else if (event.code === 'ArrowDown') {
                        console.log('ArrowDown in background selection');
                        // Move down in the grid (if in first row)
                        if (this.selectedBgIndex < 4) {
                            this.selectBackground(this.selectedBgIndex + 3);
                        }
                    } else if (event.code === 'ArrowLeft') {
                        console.log('ArrowLeft in background selection');
                        // Move left in the grid (if not leftmost)
                        if (this.selectedBgIndex % 3 !== 1) {
                            this.selectBackground(this.selectedBgIndex - 1);
                        }
                    } else if (event.code === 'ArrowRight') {
                        console.log('ArrowRight in background selection');
                        // Move right in the grid (if not rightmost)
                        if (this.selectedBgIndex % 3 !== 0) {
                            this.selectBackground(this.selectedBgIndex + 1);
                        }
                    } else if (event.code === 'Enter' || event.code === 'Space') {
                        console.log('Enter/Space in background selection - applying selection');
                        this.applySelectedBackground();
                    }
                } else if (this.controlsActive) {
                    // Controls screen navigation (just need to exit)
                    if (event.code === 'Escape' || event.code === 'Enter' || event.code === 'Space') {
                        console.log('Escape/Enter/Space in controls screen - returning to main menu');
                        this.toggleControlsScreen(false);
                    }
                }
            });
        }
    }
    
    private updateMusicPlayerUI() {
        console.log('Updating music player UI');
        
        // Update track name
        this.trackNameText.setText(this.musicPlayer.getCurrentTrackName());
        
        // Update play/pause button
        this.playPauseButton.setText(this.musicPlayer.isCurrentlyPlaying() ? '❚❚ Pause' : '▶ Play');
        
        // Update loop button
        this.loopButton.setText(this.musicPlayer.isCurrentlyLooping() ? '🔁 Loop: ON' : '🔁 Loop: OFF');
        
        // Update track list (highlight current track)
        const currentTrackIndex = this.musicPlayer.getCurrentTrackIndex();
        this.trackListTexts.forEach((text, index) => {
            text.setColor(index === currentTrackIndex ? '#ffff00' : '#ffffff');
        });
    }
    
    private startGame() {
        // Transfer music player state to the game scene
        const gameScene = this.scene.get('Game');
        if (gameScene) {
            // We'll handle the music player transfer in the Game scene
        }
        
        // Start the game scene
        this.scene.start('Game');
    }
}
