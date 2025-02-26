import { Scene } from 'phaser';

export class MusicPlayer {
    private scene: Scene;
    private tracks: {key: string, name: string}[];
    private currentTrackIndex: number;
    private music: Phaser.Sound.BaseSound | null;
    private isPlaying: boolean;
    private isLooping: boolean;
    private unavailableTracks: Set<string> = new Set();

    constructor(scene: Scene) {
        this.scene = scene;
        this.music = null;
        this.isPlaying = false;
        this.isLooping = true;
        this.currentTrackIndex = 0;
        
        console.log('MusicPlayer: Initializing...');
        
        // Define the available tracks
        this.tracks = [
            { key: 'break_the_grid', name: 'Break the Grid' },
            { key: 'gridlock_ruin', name: 'Gridlock Ruin' },
            { key: 'neon_collapse', name: 'Neon Collapse' },
            { key: 'paddle_pulse', name: 'Paddle Pulse' },
            { key: 'shatter_circuit', name: 'Shatter Circuit' }
        ];
        
        // Load saved track index from local storage
        const savedTrack = localStorage.getItem('loftwahnoid_music_track');
        if (savedTrack !== null) {
            this.currentTrackIndex = parseInt(savedTrack);
            console.log(`MusicPlayer: Loaded saved track index: ${this.currentTrackIndex}`);
        }
        
        // Check if music was playing in a previous session
        const wasPlaying = localStorage.getItem('loftwahnoid_music_playing');
        this.isPlaying = wasPlaying === 'true';
        console.log(`MusicPlayer: Music should be playing: ${this.isPlaying}`);
        
        // Initialize the current track
        this.initCurrentTrack();
    }
    
    private initCurrentTrack(): void {
        console.log('MusicPlayer: Initializing current track');
        
        // Stop current music if any
        if (this.music) {
            console.log('MusicPlayer: Stopping previous track');
            this.music.stop();
            this.music = null;
        }
        
        // Handle track index safely (in case saved value is invalid)
        if (this.currentTrackIndex >= this.tracks.length) {
            console.log(`MusicPlayer: Invalid track index (${this.currentTrackIndex}), resetting to 0`);
            this.currentTrackIndex = 0;
        }
        
        // Get the current track
        const track = this.tracks[this.currentTrackIndex];
        console.log(`MusicPlayer: Selected track: ${track.name} (${track.key})`);
        
        // Check if this track is already known to be unavailable
        if (this.unavailableTracks.has(track.key)) {
            console.log(`MusicPlayer: Track ${track.name} is unavailable, not attempting to load`);
            return;
        }
        
        try {
            console.log(`MusicPlayer: Attempting to add sound: ${track.key}`);
            // Try to load and play the track
            this.music = this.scene.sound.add(track.key, {
                loop: this.isLooping,
                volume: 0.7
            });
            
            console.log('MusicPlayer: Sound added successfully');
            
            // Set up completion handler for non-looping tracks
            if (!this.isLooping) {
                console.log('MusicPlayer: Setting up completion handler (non-looping mode)');
                this.music.once('complete', () => {
                    console.log('MusicPlayer: Track completed, playing next');
                    this.playNext();
                });
            }
            
            // Start playing if needed
            if (this.isPlaying) {
                console.log('MusicPlayer: Starting playback');
                this.music.play();
            } else {
                console.log('MusicPlayer: Track loaded but not playing (autoplay disabled)');
            }
        } catch (error) {
            console.error(`MusicPlayer: Failed to load music track ${track.name}:`, error);
            this.unavailableTracks.add(track.key);
            this.music = null;
        }
        
        // Save current track to local storage
        localStorage.setItem('loftwahnoid_music_track', String(this.currentTrackIndex));
        console.log(`MusicPlayer: Saved current track index (${this.currentTrackIndex}) to localStorage`);
    }
    
    public getCurrentTrackName(): string {
        // Safely get the track name
        try {
            const track = this.tracks[this.currentTrackIndex];
            if (this.unavailableTracks.has(track.key)) {
                return `${track.name} (unavailable)`;
            }
            return track.name;
        } catch (error) {
            return 'Track unavailable';
        }
    }
    
    public isCurrentTrackAvailable(): boolean {
        try {
            const track = this.tracks[this.currentTrackIndex];
            return !this.unavailableTracks.has(track.key);
        } catch (error) {
            return false;
        }
    }
    
    public isTrackAvailable(key: string): boolean {
        return !this.unavailableTracks.has(key);
    }
    
    public playPause(): void {
        console.log('MusicPlayer: playPause() called');
        
        if (!this.music) {
            console.log('MusicPlayer: No active track, initializing current track');
            this.initCurrentTrack();
            if (!this.music) {
                console.log('MusicPlayer: Failed to initialize track, trying next');
                // If the track is unavailable, try the next one
                if (this.allTracksUnavailable()) {
                    console.log('MusicPlayer: All music tracks are unavailable');
                    return;
                }
                this.playNext();
                return;
            }
        }
        
        if (this.isPlaying) {
            console.log('MusicPlayer: Pausing playback');
            this.music.pause();
            this.isPlaying = false;
        } else {
            console.log('MusicPlayer: Resuming playback');
            this.music.resume();
            this.isPlaying = true;
        }
        
        // Save state to local storage
        localStorage.setItem('loftwahnoid_music_playing', String(this.isPlaying));
        console.log(`MusicPlayer: Saved playing state (${this.isPlaying}) to localStorage`);
    }
    
    public playNext(): void {
        const startIndex = this.currentTrackIndex;
        do {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            
            // If we've checked all tracks and none are available, give up
            if (this.currentTrackIndex === startIndex) {
                if (this.allTracksUnavailable()) {
                    console.log('All music tracks are unavailable');
                    return;
                }
                break;
            }
        } while (this.unavailableTracks.has(this.tracks[this.currentTrackIndex].key));
        
        this.initCurrentTrack();
    }
    
    public playPrevious(): void {
        const startIndex = this.currentTrackIndex;
        do {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
            
            // If we've checked all tracks and none are available, give up
            if (this.currentTrackIndex === startIndex) {
                if (this.allTracksUnavailable()) {
                    console.log('All music tracks are unavailable');
                    return;
                }
                break;
            }
        } while (this.unavailableTracks.has(this.tracks[this.currentTrackIndex].key));
        
        this.initCurrentTrack();
    }
    
    private allTracksUnavailable(): boolean {
        return this.unavailableTracks.size >= this.tracks.length;
    }
    
    public toggleLoop(): void {
        this.isLooping = !this.isLooping;
        if (this.music) {
            // Simply reinitialize the track with the new loop setting
            // We'll lose the current position, but that's acceptable for loop toggling
            this.initCurrentTrack();
        }
    }
    
    public isCurrentlyPlaying(): boolean {
        return this.isPlaying;
    }
    
    public isCurrentlyLooping(): boolean {
        return this.isLooping;
    }
    
    public getTrackList(): {key: string, name: string}[] {
        return this.tracks;
    }
    
    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }
    
    // Method to call when the scene is being transitioned
    public transferToScene(newScene: Scene): MusicPlayer {
        // Create new music player for the new scene
        const newPlayer = new MusicPlayer(newScene);
        
        // Stop current music to prevent multiple tracks playing
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
        
        return newPlayer;
    }
} 