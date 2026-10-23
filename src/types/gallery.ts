export interface GalleryStill {
  id: string;
  imageUrl: string;
  sceneId: number;
  sceneTitle: string;
  timestamp: string;
  style: 'marvel' | 'clean';
  grain: number;
  aspectRatio: '16:9' | '9:16';
  telemetry: {
    pitch: number;
    yaw: number;
    zoom: number;
  };
  dialogueQuote?: string;
  isCustomCapture?: boolean;
}
