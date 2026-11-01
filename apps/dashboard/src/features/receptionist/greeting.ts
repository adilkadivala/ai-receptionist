/** Plays after the owner's greeting on every call. The owner can drop the recording part, never the AI part. */
export function aiNotice(recording: boolean): string {
  return recording
    ? "Just so you know, I'm an AI assistant, and this call may be recorded."
    : "Just so you know, I'm an AI assistant.";
}
