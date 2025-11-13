import { Schema, model, Document } from "mongoose";

// 1. Define the interface (this is the type)
export interface IMessage extends Document {
  room: string;
  sender: string;
  text?: string;
  file?: { name: string; url: string; type: string };
  timestamp: number;
  readBy: string[];
  reactions: Record<string, string[]>;
}

// 2. Define the schema
const messageSchema = new Schema<IMessage>({
  room: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  text: String,
  file: {
    name: String,
    url: String,
    type: String,
  },
  timestamp: { type: Number, required: true, index: true },
  readBy: [String],
  reactions: { type: Schema.Types.Mixed, default: {} },
});

// 3. Export ONLY the model
export const Message = model<IMessage>("Message", messageSchema);

// DO NOT export type { IMessage } again — interface is already exported!