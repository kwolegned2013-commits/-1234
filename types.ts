
export enum Role {
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  NONE = 'NONE'
}

export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  width: number;
}

export interface StudySession {
  id: string;
  childName: string;
  subject: string;
  startTime: number;
  duration: number; // in seconds
  canvasData: Path[];
  isActive: boolean;
}

export interface SyncMessage {
  type: 'DRAW' | 'CLEAR' | 'STATUS_CHANGE' | 'UNDO' | 'SET_IMAGE';
  payload: any;
}
