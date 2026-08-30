/** Shared Groq model id — override with GROQ_MODEL env. */
export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
}
