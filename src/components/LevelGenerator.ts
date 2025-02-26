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
        // Clear any existing bricks
        this.bricks = [];
        
        // Calculate brick positions based on config
        const { columns, rows, brickWidth, brickHeight, padding, offsetTop, offsetLeft } = this.config;
        
        // Calculate difficulty factors based on level
        const difficulty = Math.min(this.config.level / 10, 1); // Cap at 1 (max difficulty)
        
        // Calculate brick densities based on difficulty
        const brickDensity = 0.6 + (difficulty * 0.3); // 60% to 90% density as difficulty increases
        const toughBrickChance = Math.min(0.1 + (difficulty * 0.3), 0.4); // 10% to 40% chance for tough bricks
        const indestructibleBrickChance = Math.min(0.05 + (difficulty * 0.15), 0.2); // 5% to 20% chance for indestructible
        
        // Track available spaces for valid path
        const grid: (boolean | undefined)[][] = [];
        for (let row = 0; row < rows; row++) {
            grid[row] = [];
            for (let col = 0; col < columns; col++) {
                grid[row][col] = undefined; // undefined = not yet decided
            }
        }
        
        // Ensure at least one valid path through the level
        this.createValidPath(grid, columns, rows);
        
        // Fill the rest of the grid based on density
        this.fillRemainingGrid(grid, columns, rows, brickDensity, toughBrickChance, indestructibleBrickChance);
        
        // Create actual brick objects based on the grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                if (grid[row][col] === true) { // true = has brick
                    // Calculate position
                    const x = offsetLeft + (col * (brickWidth + padding)) + (brickWidth / 2);
                    const y = offsetTop + (row * (brickHeight + padding)) + (brickHeight / 2);
                    
                    // Determine brick type based on chances
                    let brickType: BrickType;
                    const typeRoll = Math.random();
                    
                    if (typeRoll < indestructibleBrickChance) {
                        brickType = BrickType.Indestructible;
                    } else if (typeRoll < indestructibleBrickChance + toughBrickChance) {
                        brickType = BrickType.Tough;
                    } else {
                        brickType = BrickType.Standard;
                    }
                    
                    // Create the brick
                    const brick = new Brick({
                        scene: this.scene,
                        x,
                        y,
                        type: brickType,
                        width: brickWidth,
                        height: brickHeight
                    });
                    
                    this.bricks.push(brick);
                }
            }
        }
        
        return this.bricks;
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