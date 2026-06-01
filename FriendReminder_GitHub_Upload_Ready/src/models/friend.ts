import { InteractionType } from "./interactionLog";

export type Friend = {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  lastContactedAt: string | null;
  cadenceDays: number;
  preferredInteractionType: InteractionType;
  isArchived: boolean;
};

export type FriendInput = {
  name: string;
  notes: string;
  cadenceDays: number;
  preferredInteractionType: InteractionType;
  lastContactedAt?: string | null;
};
