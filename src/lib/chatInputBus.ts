/**
 * Simple cross-component event bus for chat input.
 * Used by voice mode in RightSidebar to inject transcribed text
 * into the chat input field in CenterZone.
 */
export const CHAT_INPUT_EVENT = "buildverse:chat-input";

export const dispatchChatInput = (text: string) => {
  window.dispatchEvent(new CustomEvent(CHAT_INPUT_EVENT, { detail: text }));
};
