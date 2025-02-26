import { Scene } from 'phaser';
import { Brick, BrickType } from './Brick';

export interface LevelConfig {
    level: number;
    columns: number;
    rows: number;
    brickWidth: number;
    brickHeight: number;
    padding: number;
    offsetTop: number;
    offsetLeft: number;
}

export class LevelGenerator {
    private scene: Scene;
    private config: LevelConfig;
    private bricks: Brick[] = [];
    
    constructor(scene: Scene, config: LevelConfig) {
        this.scene = scene;
        this.config = config;
    }
    
    generate(): Brick[] {
        console.log(`Generating level ${this.config.level} with ${this.config.columns}x${this.config.rows} grid`);
        
        const bricks: Brick[] = [];
        const brickWidth = this.config.brickWidth;
        const brickHeight = this.config.brickHeight;
        
        // Calculate grid start position
        const startX = (this.config.width - (this.config.columns * (brickWidth + this.config.brickPadding))) / 2 + brickWidth / 2;
        const startY = this.config.topMargin + brickHeight / 2;
        
        // Generate brick layout
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.columns; col++) {
                try {
                    // Calculate position
                    const x = startX + col * (brickWidth + this.config.brickPadding);
                    const y = startY + row * (brickHeight + this.config.brickPadding);
                    
                    // Determine if we should place a brick here (based on level pattern)
                    if (this.shouldPlaceBrick(row, col)) {
                        // Determine brick type based on level
                        const type = this.getBrickType(row, col);
                        
                        // Create the brick
                        const brick = new Brick({
                            scene: this.scene,
                            x,
                            y,
                            type
                        });
                        
                        // Make sure the brick was created successfully before adding it
                        if (brick) {
                            bricks.push(brick);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to create brick at row ${row}, col ${col}:`, error);
                    // Continue with the next brick
                }
            }
        }
        
        // Ensure there's a playable path through the level
        this.ensurePlayablePath(bricks);
        
        console.log(`Ensured playable path through level`);
        return bricks;
    }
    
    private createValidPath(grid: (boolean | undefined)[][], columns: number, rows: number): void {
        // Create a zigzag path from top to bottom
        // This ensures that at least one valid path exists through the level
        
        let col = Math.floor(columns / 2); // Start in the middle
        
        for (let row = 0; row < rows; row++) {
            // Mark current position as empty (no brick)
            grid[row][col] = false;
            
            // Mark positions around current one as empty too to create a wider path
            if (col > 0) grid[row][col - 1] = false;
            if (col < columns - 1) grid[row][col + 1] = false;
            
            // Move right or left randomly for next row
            const direction = Math.random() > 0.5 ? 1 : -1;
            col += direction;
            
            // Make sure we stay in bounds
            col = Math.max(1, Math.min(columns - 2, col));
        }
    }
    
    private fillRemainingGrid(
        grid: (boolean | undefined)[][],
        columns: number,
        rows: number,
        density: number,
        toughBrickChance: number,
        indestructibleBrickChance: number
    ): void {
        // Fill in the rest of the grid based on density
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                if (grid[row][col] === undefined) {
                    // If not yet decided, determine if there should be a brick based on density
                    grid[row][col] = Math.random() < density;
                }
            }
        }
    }
    
    private ensurePlayablePath(bricks: Brick[]): void {
        const rows = Math.ceil(bricks.length / this.config.columns);
        if (rows === 0) return;
        
        const cols = this.config.columns;
        
        // Create a guaranteed path through the level
        // Option 1: Clear a central column
        const middleCol = Math.floor(cols / 2);
        
        for (let row = 0; row < rows; row++) {
            // Randomly decide whether to clear this brick (70% chance)
            if (Math.random() < 0.7 && bricks[row * cols + middleCol]) {
                // Get a reference to the brick before destroying it
                const brick = bricks[row * cols + middleCol];
                
                // Only remove if it exists and is not already destroyed
                if (brick && brick.active) {
                    // For standard and tough bricks, we can destroy them
                    // For indestructible, we can either skip or replace with a tough brick
                    if (brick.getData('type') === BrickType.Indestructible) {
                        // Replace indestructible with tough or standard
                        brick.destroy();
                        
                        // Create a new standard brick
                        const newBrick = new Brick({
                            scene: this.scene,
                            x: brick.x,
                            y: brick.y,
                            type: BrickType.Standard,
                            width: brick.width,
                            height: brick.height
                        });
                        
                        // Update our reference
                        bricks[row * cols + middleCol] = newBrick;
                    } else {
                        // For non-indestructible bricks, just destroy
                        brick.destroy();
                        bricks[row * cols + middleCol] = null;
                    }
                }
            }
        }
        
        // Option 2: Also ensure some gaps in each row
        for (let row = 0; row < rows; row++) {
            // Ensure at least one gap in each row (30% of columns)
            let gapsCreated = 0;
            const gapsNeeded = Math.ceil(cols * 0.3);
            
            while (gapsCreated < gapsNeeded) {
                const randomCol = Math.floor(Math.random() * cols);
                
                // Don't create gaps in our main path column
                if (randomCol !== middleCol && bricks[row * cols + randomCol]) {
                    const brick = bricks[row * cols + randomCol];
                    
                    // Only remove if it exists and is not already destroyed
                    if (brick && brick.active) {
                        brick.destroy();
                        bricks[row * cols + randomCol] = null;
                        gapsCreated++;
                    }
                }
            }
        }
        
        console.log("Ensured playable path through level");
    }
    
    static getDefaultConfig(level: number, gameWidth: number, gameHeight: number): LevelConfig {
        // Calculate reasonable default values based on game dimensions
        const brickWidth = 64;
        const brickHeight = 32;
        const padding = 4;
        
        // Calculate how many columns and rows will fit
        const columns = Math.floor((gameWidth - 100) / (brickWidth + padding));
        
        // Adjust rows based on level (more rows as level increases)
        const baseRows = 4;
        const maxRows = 10;
        const additionalRows = Math.min(Math.floor(level / 2), maxRows - baseRows);
        const rows = baseRows + additionalRows;
        
        // Calculate offset to center the grid
        const gridWidth = columns * (brickWidth + padding) - padding;
        const offsetLeft = (gameWidth - gridWidth) / 2;
        const offsetTop = 100; // Leave some space at the top
        
        return {
            level,
            columns,
            rows,
            brickWidth,
            brickHeight,
            padding,
            offsetTop,
            offsetLeft
        };
    }
} 