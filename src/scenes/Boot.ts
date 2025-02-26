import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        // Create a simple background for the preloader
        // We'll use a solid color as a fallback in case the image doesn't load
        this.cameras.main.setBackgroundColor('#000000');
        
        // Try to load a background image for the preloader
        // This should be quick to load as it will be shown during the preloader
        this.load.image('background', 'images/background1.png');
        
        // Add a simple fallback if the image doesn't load
        this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
            if (fileObj.key === 'background') {
                // Just use the black background we already set
                console.log('Background image failed to load, using fallback.');
            }
        });
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
