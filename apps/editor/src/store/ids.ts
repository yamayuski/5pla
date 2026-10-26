/** 文書内の安定した ID。ブラウザと Node の両方で使える。 */
export function createId(): string {
  return crypto.randomUUID();
}
