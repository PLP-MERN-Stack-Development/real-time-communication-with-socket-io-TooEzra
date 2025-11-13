import { PlainMessage } from "./types";

const memoryMessages = new Map<string, PlainMessage[]>();

export const getRoomMessages = async (room: string): Promise<PlainMessage[]> => {
  return memoryMessages.get(room) || [];
};

export const addMessage = async (msg: PlainMessage) => {
  const list = memoryMessages.get(msg.room) || [];
  list.push(msg);
  if (list.length > 1000) list.shift();
  memoryMessages.set(msg.room, list);
};