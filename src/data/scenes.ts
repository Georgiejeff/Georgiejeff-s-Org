export interface SceneDefinition {
  id: number;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  image: string;
  imageAlt: string;
  visual: string;
  camera: string;
  sound: string;
  dialogue?: {
    speaker: 'Warrior' | 'AI Voice' | 'System';
    text: string;
  };
  promptPreset: string;
  vfxTheme: 'lightning' | 'nanotech' | 'reactor' | 'repulsor';
  directorNotes: string;
}

export const SCENES: SceneDefinition[] = [
  {
    id: 1,
    title: 'THE ARRIVAL',
    subtitle: 'Dark Abandoned City • Skull Mask Vigilante',
    startTime: 0,
    endTime: 6,
    image: '/assets/aistudio/IMG-20261024-WA0002_14c4d0eb.jpg',
    imageAlt: 'Masked warrior standing in night city with glossy blue vest and skull balaclava',
    visual: 'The masked warrior stands in a dark, abandoned city at night. His glossy blue vest reflects flashes of lightning. Smoke rolls across the ground.',
    camera: 'Slow cinematic push-in toward his skull mask.',
    sound: 'Deep cinematic bass, distant thunder, metallic ambience.',
    dialogue: {
      speaker: 'Warrior',
      text: 'They thought I was just a man...',
    },
    promptPreset: 'Cinematic Marvel movie opening shot. The masked muscular warrior with skull balaclava and glossy electric-blue vest stands in a rain-soaked dark cyberpunk city street. Dramatic lightning flashes illuminate his silhouette, low rolling fog and cinematic depth of field, slow push-in camera 4k photorealistic VFX.',
    vfxTheme: 'lightning',
    directorNotes: 'Establish mood of gritty vigilante before cosmic armor activation. Anamorphic lens distortion, rain reflections on pavement, deep subwoofer impact.',
  },
  {
    id: 2,
    title: 'THE TRANSMISSION',
    subtitle: 'Nanotech Awakening • Holographic Glyphs',
    startTime: 6,
    endTime: 12,
    image: '/assets/aistudio/IMG-20261024-WA0001_073878e6.jpg',
    imageAlt: 'The warrior looking intensely as robotic nanotechnology surges',
    visual: 'Blue holographic symbols appear around his arms. A mysterious transmission activates inside his chest. Electric-blue energy pulses beneath his clothing. His eyes glow blue as robotic nanotechnology emerges from his wrists and spreads across his body.',
    camera: 'Fast orbiting shot with close-ups of his hands, chest, and glowing eyes.',
    sound: 'Digital transmission, electronic pulses, rising orchestral music.',
    dialogue: {
      speaker: 'AI Voice',
      text: 'ARMOR SYSTEM ACTIVATED. WARRIOR PROTOCOL ONLINE.',
    },
    promptPreset: 'Cinematic Marvel action sequence. Intense close-up of warrior as electric-blue holographic circuit runes manifest around his forearms. Robotic nanotechnology creeps across his skin and clothing with pulsing cyan plasma. Glowing electric blue eyes, fast dynamic orbiting camera, 4K VFX.',
    vfxTheme: 'nanotech',
    directorNotes: 'Energy surge accelerates BPM. Layered holographic glyphs rotate around wrists. AI protocol voice reverberates through suit audio telemetry.',
  },
  {
    id: 3,
    title: 'THE TRANSFORMATION',
    subtitle: 'Layered Armor Assembly • Power Core Ignition',
    startTime: 12,
    endTime: 22,
    image: '/assets/aistudio/605015ba23f11b3_44729b27.jpeg',
    imageAlt: 'Full high-tech iron superhero armor with glowing center power core',
    visual: 'Metallic armor assembles around his body in layers. Black and electric-blue mechanical plates lock over his arms, chest, and legs. His skull mask retracts into a futuristic helmet. A glowing blue reactor ignites in the center of his chest. His helmet seals shut, revealing brilliant blue eye lights. He has become a powerful, original armored superhero.',
    camera: 'Rapid close-ups followed by a dramatic 360-degree orbit.',
    sound: 'Heavy metallic impacts, hydraulic movements, reactor ignition, explosive cinematic bass.',
    dialogue: {
      speaker: 'AI Voice',
      text: 'POWER CORE ONLINE. ALL SYSTEMS OPERATIONAL.',
    },
    promptPreset: 'Iron Man style full suit assembly in photorealistic 4K cinematic VFX. Segmented black and gold/electric-blue metallic armored plates snap and lock into place over his body with hydraulic servos. The center arc reactor on his chest blazes with intense turquoise plasma energy, helmet clamps shut with glowing optics, 360 orbit camera.',
    vfxTheme: 'reactor',
    directorNotes: 'The crescendo of the trailer. Mechanical interlocking sound effects synchronized with plate snaps. Reactor core flares the screen with cyan anamorphic streak.',
  },
  {
    id: 4,
    title: 'THE IRON WARRIOR RISES',
    subtitle: 'Rooftop Repulsor Blast • Flight into Horizon',
    startTime: 22,
    endTime: 30,
    image: '/assets/aistudio/605015ba23f11b3_44729b27.jpeg',
    imageAlt: 'Armored warrior standing on rooftop gathering energy in repulsor palm before supersonic flight',
    visual: 'The fully armored warrior stands on a rooftop overlooking a futuristic city. He raises his palm. Blue energy gathers inside a repulsor, illuminating his armor. He launches into the sky with a powerful burst of blue-white propulsion. The camera follows him upward before cutting to a dramatic silhouette against the skyline.',
    camera: 'The camera follows him upward before cutting to a dramatic silhouette against the skyline.',
    sound: 'Massive orchestral hit, rocket propulsion, deep cinematic impact effect, and a final fading crescendo of strings.',
    dialogue: {
      speaker: 'Warrior',
      text: "I'm not the man I was anymore.",
    },
    promptPreset: 'Epic superhero climax. The armored iron warrior stands on a skyscraper rooftop overlooking a glittering neon metropolis at night. He raises his palm, a blinding electric-blue repulsor energy core charging and swirling with lightning, then blasts upward into the night sky leaving a supersonic blue propulsion trail, 4K Marvel cinematic shot.',
    vfxTheme: 'repulsor',
    directorNotes: 'Final punchline dialogue delivered with subtle robotic vocoder filter. Sonic boom air distortion as he breaks the sound barrier into the night sky.',
  },
];

export const CHARACTER_PORTRAITS = [
  {
    id: 'vest-mask',
    name: 'Skull Mask & Vest',
    role: 'Vigilante Street Form (Scene 1)',
    image: '/assets/aistudio/IMG-20261024-WA0002_14c4d0eb.jpg',
    description: 'Glossy blue puffer vest, black skull balaclava mask, stealth tactical cargo pants.',
  },
  {
    id: 'trenchcoat',
    name: 'Civilian Alter-Ego',
    role: 'Investigation Form (Scene 2)',
    image: '/assets/aistudio/IMG-20261024-WA0001_073878e6.jpg',
    description: 'Beige trench coat, loosened tie, dark tailored trousers - detective disguise.',
  },
  {
    id: 'street-jacket',
    name: 'Tattooed Operative',
    role: 'Underground Form (Scene 2 Alternate)',
    image: '/assets/aistudio/IMG-20261024-WA0003_bf7f6824.jpg',
    description: 'Geometric burgundy printed jacket, over-ear studio monitors, leather tactical gloves.',
  },
  {
    id: 'armored-hero',
    name: 'Iron Warrior Prime',
    role: 'Superpowered Armored Form (Scene 3 & 4)',
    image: '/assets/aistudio/605015ba23f11b3_44729b27.jpeg',
    description: 'Black carbon nano-alloy plating, golden reinforcement trims, arc reactor core.',
  },
  {
    id: 'street-turnaround',
    name: '3-Angle Surveillance',
    role: 'Tactical Turnaround (Scene 2 Analysis)',
    image: '/assets/aistudio/a3d79b489e39ba3_090a88e4.jpeg',
    description: '360 multi-angle profile of operative with wireless audio interface and runic print.',
  },
];
