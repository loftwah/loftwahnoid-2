# Loftwahnoid: Requirements Document

## 1. Overview

_Loftwahnoid_ is a brick-breaking game inspired by Arkanoid/DX Ball, playable on desktop and mobile devices. The game features:

- Menu-driven navigation with customization options
- Ball-and-paddle gameplay with keyboard/mouse/touch controls
- Various brick types and power-ups
- Infinite procedurally generated levels with balanced difficulty scaling
- Consistent _Loftwahnoid_ branding throughout
- Background customization options
- Integrated music player system

---

## 2. Functional Requirements

### 2.1 Main Menu

| Requirement          | Description                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Initial Screen       | Game starts with a main menu before gameplay                                                                                   |
| Layout               | Two-panel layout: Main menu options on left side (60-70% of screen width), Music player on right side (30-40% of screen width) |
| Title                | Displays "Loftwahnoid" prominently at top center in large, bold typography                                                     |
| Menu Options         | Presents clearly visible buttons for "Start Game," "Controls," "Backgrounds," and "Exit"                                       |
| Selection Feedback   | Currently selected menu option must be highlighted with distinct color/animation/size                                          |
| Navigation           | Keyboard (Tab/Arrow keys + Enter), Mouse (click), and Touch (tap) must all work for menu navigation                            |
| Background Selection | Sub-menu under "Backgrounds" with the following features:                                                                      |
|                      | - Grid layout displaying 3x2 or 2x3 thumbnails for easy visual selection                                                       |
|                      | - Each thumbnail shows miniature preview of the actual background                                                              |
|                      | - Currently selected background is highlighted with border/glow effect                                                         |
|                      | - Mandatory black background option clearly labeled                                                                            |
|                      | - Random background option clearly labeled                                                                                     |
|                      | - "Back" button to return to main menu                                                                                         |
|                      | - Persistent selection across play sessions using local storage                                                                |
| Music Player         | Dedicated panel with music controls always visible (see Section 2.2)                                                           |

### 2.2 Music Player

#### 2.2.1 Main Menu Music Player

| Requirement       | Description                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Location          | Dedicated panel on right side of main menu screen                                                                                |
| Visual Design     | Clearly defined section with contrasting background or border                                                                    |
| Playback Controls | Large, clearly labeled buttons for: Play/Pause (single toggle button), Previous Track, Next Track                                |
| Track Information | Current track name displayed in readable font                                                                                    |
|                   | Track progress displayed (current time / total time)                                                                             |
|                   | Optional: simple progress bar                                                                                                    |
| Playlist Display  | List of available tracks with currently playing track highlighted                                                                |
| Loop Control      | Visible toggle button to enable/disable playlist looping                                                                         |
| Default State     | No music plays until user explicitly clicks Play button                                                                          |
| Available Tracks  | Five tracks available: "Break the Grid.mp3", "Gridlock Ruin.mp3", "Neon Collapse.mp3", "Paddle Pulse.mp3", "Shatter Circuit.mp3" |
| Interaction       | Both mouse/touch and keyboard controls must work for music player                                                                |
|                   | Tab key must be able to focus music controls                                                                                     |

#### 2.2.2 In-Game Music Controls

| Requirement        | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Location           | Minimal display in top-right or bottom-right corner of gameplay screen                     |
| Minimalist Display | Shows current track name and simple icon indicating playback status                        |
| Keyboard Shortcuts | Must provide keyboard shortcuts for music control during gameplay                          |
|                    | Space bar is reserved for ball launch and cannot be used for music                         |
|                    | Must use other keys (e.g., M for mute, N/P for next/previous)                              |
|                    | Keyboard shortcuts must be documented in Controls screen                                   |
| Mobile Controls    | For mobile, provide a small music button that expands to show minimal controls when tapped |
|                    | Expanded controls must automatically minimize after a few seconds of inactivity            |
| Pause Behavior     | Music should continue playing when game is paused                                          |
| Volume Control     | Optional: Provide volume adjustment in both menu and in-game                               |

### 2.3 Controls Setup Screen

| Requirement         | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Access              | Accessible from main menu via "Controls" button                  |
| Layout              | Clear, readable list of all controls for both desktop and mobile |
| Sections            | Separate sections for Gameplay Controls and Music Controls       |
| Visual Design       | Use icons alongside text descriptions for clarity                |
| Back Button         | Clearly visible button to return to main menu                    |
| Keyboard Navigation | Must support keyboard navigation (Tab + Enter)                   |

### 2.4 Core Gameplay

| Requirement      | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| **Game Start**   |                                                               |
| Pre-launch State | Ball begins attached to center of paddle                      |
|                  | Game is paused until first launch                             |
| Visual Indicator | Subtle animation or indicator showing ball is ready to launch |
| Launch Action    | Desktop: Space key launches ball                              |
|                  | Mouse: Left-click launches ball                               |
|                  | Mobile: Tap screen launches ball                              |
|                  | Game begins immediately after launch                          |

| Requirement          | Description                                        |
| -------------------- | -------------------------------------------------- |
| **Control Schemes**  |                                                    |
| Desktop Keyboard     | Left/Right Arrow keys: Move paddle left/right      |
|                      | Space: Launch ball (first time only)               |
|                      | P: Pause game                                      |
|                      | Music controls: As defined in Section 2.2.2        |
| Desktop Mouse        | Mouse movement: Controls paddle position           |
|                      | Left-click: Launch ball (first time only)          |
|                      | Click on pause icon: Pause game                    |
| Mobile Touch         | Drag finger left/right: Move paddle                |
|                      | Tap: Launch ball (first time only)                 |
|                      | Tap pause icon: Pause game                         |
|                      | Tap music icon: Expand music controls              |

| Requirement          | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| **Paddle Properties**|                                                                             |
| Visual Design        | Must visually match paddle.png if available                                 |
|                      | Fallback to rectangular shape with gradient if image unavailable            |
| Initial State        | Starts at size stage 3 (medium)                                             |
| Size Range           | Can grow to stage 5 (maximum) or shrink to stage 1 (minimum) via power-ups  |
|                      | Each size stage increases/decreases width by approximately 20%              |
| Movement Constraints | Cannot move beyond screen boundaries                                        |
|                      | Paddle movement speed must be responsive but not too sensitive              |
|                      | Consistent movement speed across different devices                          |

| Requirement       | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| **Ball Behavior** |                                                                         |
| Visual Design     | Must visually match ball.png if available                               |
|                   | Fallback to circular shape if image unavailable                         |
| Collision Physics | Bounces off paddle, bricks, top wall, and side walls                    |
|                   | Angle of reflection from paddle depends on where ball hits paddle        |
|                   | Center hit: vertical reflection; edge hit: angled reflection            |
| Initial Speed     | Moderate speed allowing new players to react comfortably                |
| Speed Progression | Gradually increases speed at fixed intervals (e.g., every 30 seconds)   |
|                   | Each speed increase limited to 5-10% maximum                            |
| Speed Cap         | Maximum speed capped at a playable level                                |
|                   | Players should always have reasonable reaction time                     |
| Failure Condition | Ball passing below paddle results in life loss                          |
|                   | Brief animation/sound when ball is lost                                 |
|                   | Paddle+ball reset to center position after life loss                    |

| Requirement     | Description                                     |
| --------------- | ----------------------------------------------- |
| **Lives System**|                                                 |
| Starting Lives  | Player begins with 3 lives                      |
| Life Gain       | Additional lives obtainable via power-ups       |
| Life Loss       | Occurs when ball passes below paddle            |
| Display         | Hearts or numeric "Lives: X" in top-left corner |
|                 | Visual effect when gaining/losing a life        |

| Requirement       | Description                                        |
| ----------------- | -------------------------------------------------- |
| **Scoring System**|                                                    |
| Point Values      | Standard brick: 10 points                          |
|                   | Tough brick: 20 points (full destruction)          |
|                   | Special/power-up bricks: 25+ points                |
| Display           | Current score shown prominently in top-right corner|
|                   | Brief animation when points are added              |
| Score Persistence | High score saved between sessions                  |

### 2.4 Brick Types

| Brick Type     | Properties                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Standard       | Breaks in single hit; basic coloration (e.g., gray)                     |
| Tough          | Requires 2-3 hits; distinct color (e.g., red); visual damage indicators |
| Indestructible | Cannot be broken; visually distinct (e.g., silver/black)                |
| Distribution   | Mixed randomly within level layouts                                     |

### 2.5 Power-Ups

| Characteristic | Specification                                     |
| -------------- | ------------------------------------------------- |
| Trigger        | Drops randomly from destroyed bricks              |
| Activation     | Collected by paddle contact                       |
| Duration       | 15-30 seconds unless otherwise specified          |
| Visual Design  | Each power-up has unique, recognizable appearance |

| Beneficial Power-Ups | Effect                                                | Visual Indicator   |
| -------------------- | ----------------------------------------------------- | ------------------ |
| Extra Life           | Adds one life to player's count                       | Heart icon         |
| Shooting Paddle      | Paddle fires projectiles upward to break bricks       | Gun/bullet icon    |
| Slow Ball            | Reduces ball speed by 20-30%                          | Turtle icon        |
| Larger Paddle        | Increases paddle size by one stage (maximum: stage 5) | Outward arrow icon |
| Mini Ball            | Splits ball into 2-3 smaller balls temporarily        | Multi-ball icon    |

| Detrimental Power-Ups | Effect                                                | Visual Indicator  |
| --------------------- | ----------------------------------------------------- | ----------------- |
| Fast Ball             | Increases ball speed by 20-30%                        | Lightning icon    |
| Smaller Paddle        | Decreases paddle size by one stage (minimum: stage 1) | Inward arrow icon |

### 2.6 Level Design

| Requirement            | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| Generation             | Infinite, procedurally generated levels                                          |
| Difficulty Progression | Begins with sparse standard bricks, gradually increases density and complexity   |
| Brick Distribution     | Progressive inclusion of tough and indestructible bricks as difficulty increases |
| Difficulty Cap         | Maximum difficulty plateaus at a reasonable, playable level                      |
|                        | (e.g., approximately 50% screen coverage with balanced brick type mix)           |
| Layout Validation      | All generated levels guarantee at least one viable ball path                     |

### 2.7 User Interface (HUD)

| Element       | Position             | Display Format                  |
| ------------- | -------------------- | ------------------------------- |
| Lives Counter | Top-left corner      | Hearts or "Lives: X"            |
| Score Display | Top-right corner     | "Score: XXXX"                   |
| Branding      | Unobtrusive location | _Loftwahnoid_ logo or watermark |

### 2.8 Game Over

| Requirement | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| Trigger     | Occurs when player loses all lives                                 |
| Content     | Shows "Game Over" message, final score, and _Loftwahnoid_ branding |
| Options     | Presents "Restart" and "Back to Menu" buttons                      |

---

## 3. Non-Functional Requirements

| Requirement                  | Description                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Cross-Platform Compatibility | Fully playable on both desktop and mobile with optimized controls                       |
| Branding Consistency         | _Loftwahnoid_ branding present throughout: menu, HUD, backgrounds, Game Over screen     |
| Visual Clarity               | Clear visual distinction between brick types and power-ups through color/iconography    |
| Control Responsiveness       | Intuitive, fluid controls across all supported input methods                            |
| Asset Fallbacks              | **CRITICAL REQUIREMENT:** Graceful handling of missing assets with appropriate defaults |
|                              | - Missing backgrounds: fallback to solid color or default pattern                       |
|                              | - Missing audio/music: silent operation without errors or gameplay interruption         |
|                              | - Missing sound effects: continue gameplay without sounds                               |
|                              | - Missing images/textures: use simple geometric shapes or default visuals               |
|                              | The game MUST continue to function properly even if ANY asset is missing                |

---

## 4. Asset Structure and Usage Guidelines

### 4.1 Image Assets

```
images/
  background1.png  # Background option 1
  background2.png  # Background option 2
  background3.png  # Background option 3
  background4.png  # Background option 4
  background5.png  # Background option 5
  ball.png         # Player ball
  brick1.png       # Standard brick
  brick2.png       # Tough brick
  brick3.png       # Indestructible brick
  paddle.png       # Player paddle
```

| Asset Type  | Usage Requirements                              | Fallback Implementation              |
| ----------- | ----------------------------------------------- | ------------------------------------ |
| Backgrounds | Used as full-screen backgrounds                 | Solid color gradients                |
|             | Should be shown as thumbnails in selection grid |                                      |
|             | Must support stretching to fit screen           |                                      |
| ball.png    | Main player-controlled ball                     | Simple circle with gradient          |
|             | Must support animation/rotation during movement |                                      |
| brick1.png  | Standard one-hit bricks                         | Colored rectangle with border        |
| brick2.png  | Tough multi-hit bricks                          | Color-changing rectangle with cracks |
| brick3.png  | Indestructible bricks                           | Dark/metallic rectangle              |
| paddle.png  | Player-controlled paddle                        | Rounded rectangle with gradient      |
|             | Must visually scale between 5 different sizes   |                                      |

**Critical Requirement:** The game MUST handle missing image files gracefully by using the specified fallback implementations.

### 4.2 Music Assets

```
music/
  Break the Grid.mp3
  Gridlock Ruin.mp3
  Neon Collapse.mp3
  Paddle Pulse.mp3
  Shatter Circuit.mp3
```

| Asset Type   | Usage Requirements                          | Fallback Implementation |
| ------------ | ------------------------------------------- | ----------------------- |
| Music Tracks | Background music during menu and gameplay   | Silent operation        |
|              | Must support play, pause, track selection   |                         |
|              | Must display track name and playback status |                         |
|              | Should loop by default                      |                         |

**Critical Requirement:** If a music file is missing or cannot be loaded, the player should display an appropriate message (e.g., "Track unavailable") without crashing or disrupting gameplay.

### 4.3 Sound Effect Assets

```
sounds/
  ao-laser.wav    # Used for shooting power-up
  bang.wav        # Used for brick breaking (alternative)
  bassdrum.wav    # Used for menu selection
  boing.wav       # Used for ball bouncing
  byeball.wav     # Used for life lost
  effect.wav      # Used for power-up collection
  effect2.wav     # Used for special event
  fanfare.wav     # Used for level completion
  glass.wav       # Used for brick breaking
  gunfire.wav     # Used for shooting power-up (alternative)
  humm.wav        # Used for ambient sound
  orchblas.wav    # Used for special event
  orchestr.wav    # Used for game over sequence
  padexplo.wav    # Used for paddle explosion effect
  peow!.wav       # Used for shooting power-up (alternative)
  ricochet.wav    # Used for ball bouncing off walls
  saucer.wav      # Used for UFO power-up
  sweepdow.wav    # Used for power-down effect
  swordswi.wav    # Used for special power-up
  tank.wav        # Used for tank power-up
  thudclap.wav    # Used for heavy impact
  voltage.wav     # Used for electric power-up
  whine.wav       # Used for special effect
  wowpulse.wav    # Used for level start
  xploshor.wav    # Used for large explosion
  xplosht1.wav    # Used for small explosion
```

| Sound Effect  | Usage Context                             | Fallback Implementation |
| ------------- | ----------------------------------------- | ----------------------- |
| boing.wav     | Played when ball bounces off paddle       | Silent operation        |
| ricochet.wav  | Played when ball bounces off walls        | Silent operation        |
| glass.wav     | Played when standard brick is destroyed   | Silent operation        |
| bang.wav      | Played when tough brick is destroyed      | Silent operation        |
| byeball.wav   | Played when player loses a life           | Silent operation        |
| effect.wav    | Played when player collects a power-up    | Silent operation        |
| orchestr.wav  | Played at game over screen                | Silent operation        |
| ao-laser.wav  | Played when shooting power-up fires       | Silent operation        |
| wowpulse.wav  | Played when a level begins                | Silent operation        |
| fanfare.wav   | Played when level is completed             | Silent operation        |
| xploshor.wav  | Played for large explosion effects          | Silent operation        |
| sweepdow.wav  | Played for negative power-ups                | Silent operation        |
| padexplo.wav  | Played when paddle is hit by enemy            | Silent operation        |

**Critical Requirement:** The game MUST function normally without sound effects if files are missing.

### 4.4 Required Additional Assets to Create

| Asset            | Requirements                            | Usage                                       |
| ---------------- | --------------------------------------- | ------------------------------------------- |
| Logo/Title Image | "Loftwahnoid" title graphic (512x256)   | Displayed in main menu and game over screen |
|                  | Bold, stylized design                   |                                             |
|                  | Must include transparent background     |                                             |
| Power-up Icons   | Unique icon for each power-up type      | Displayed when power-ups appear in game     |
|                  | Clear silhouettes for quick recognition |                                             |
|                  | Color-coded for good/bad distinction    |                                             |

### 4.4 Logo Requirements

- Large _Loftwahnoid_ title graphic (512x256 pixels)
- Bold, stylized design suitable for menu and Game Over screens

---

## 5. Implementation Constraints

### 5.1 Technical Requirements

| Requirement       | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| Cross-Platform    | Must function on both desktop and mobile devices                 |
| Responsive Design | Layout must adapt to different screen sizes and orientations     |
|                   | All UI elements must remain accessible regardless of screen size |
| Performance       | Must maintain 60 FPS on modern browsers/devices                  |
|                   | No noticeable lag in paddle movement response                    |

### 5.2 Asset Handling

| Requirement            | Description                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Asset Independence** | Game functionality MUST NOT depend on the presence of any specific asset file |
|                        | Game must start and run correctly even if ALL asset files are missing         |
| **Error Handling**     | Must catch and handle all asset loading errors gracefully                     |
|                        | No console errors should appear when assets fail to load                      |
|                        | No game crashes or freezes due to missing assets                              |
| **Fallback Visuals**   | For missing images:                                                           |
|                        | - Backgrounds: Solid color backgrounds (black, blue, etc.)                    |
|                        | - Ball: Simple circle with gradient                                           |
|                        | - Paddle: Rectangle with gradient                                             |
|                        | - Bricks: Colored rectangles with borders                                     |
|                        | - Power-ups: Geometric shapes with distinctive colors                         |
| **Audio Fallbacks**    | For missing audio files:                                                      |
|                        | - Silent operation without errors                                             |
|                        | - Disabled or visually altered music controls for unavailable tracks          |
|                        | - UI indicators that sound is unavailable (rather than muted)                 |
| **User Feedback**      | Clear messaging when assets fail to load                                      |
|                        | "Track unavailable" message for missing music files                           |
|                        | Optional setting to hide missing backgrounds from selection menu              |

### 5.3 User Interface Requirements

| Requirement        | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| Menu Consistency   | All menus must follow consistent visual style and interaction patterns              |
| Selection Feedback | All selectable elements must provide clear visual feedback on hover/focus/selection |
| Navigation Flow    | Clear navigation paths between all screens                                          |
|                    | "Back" options available in all sub-menus                                           |
| Keyboard Access    | All menu functions must be accessible via keyboard                                  |
|                    | Tab order must be logical and follow visual layout                                  |
| Focus Indicators   | Keyboard focus must be clearly visible at all times                                 |

### 5.4 Music System Requirements

| Requirement      | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| Menu Integration | Music player must be accessible from main menu                   |
|                  | Controls must be clearly visible and labeled                     |
| In-Game Access   | Minimalist music controls/info available during gameplay         |
|                  | Keyboard shortcuts for music control during gameplay             |
| No Autoplay      | Music MUST NOT play automatically on game load                   |
|                  | User must explicitly activate music playback                     |
| Persistence      | Volume and playlist position should persist across game sessions |

### 5.5 Save Data

| Requirement   | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| Local Storage | Use browser local storage for saving user preferences         |
| Saved Items   | Must save: selected background, high score, music preferences |
| Fallback      | Game must function correctly if local storage is unavailable  |
