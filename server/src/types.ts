export interface PlainMessage {
  room: string;
  sender: string;
  text?: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  timestamp: number;
  readBy: string[];
  reactions: Record<string, string[]>;
}