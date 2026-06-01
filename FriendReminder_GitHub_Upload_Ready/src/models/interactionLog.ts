export type InteractionType = "texted" | "called" | "hungOut" | "other";

export type InteractionLog = {
  id: string;
  friendId: string;
  interactionType: InteractionType;
  date: string;
  notes: string;
  createdAt: string;
};

export const interactionTypeLabels: Record<InteractionType, string> = {
  texted: "Texted",
  called: "Called",
  hungOut: "Hung out",
  other: "Other"
};

export const interactionTypes: InteractionType[] = ["texted", "called", "hungOut", "other"];
