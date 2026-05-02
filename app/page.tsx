"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"

const sandboxId = "sb_abc123" // Returned by your server

const chat = createAgentChat({
  agent: "my-agent",
  tokenUrl: "/api/an-token",
  sandboxId,
})

const reviewOptions = {
  systemPrompt: {
    type: "preset",
    preset: "claude_code",
    append:
      "You are reviewing a checkout diff. Focus on regressions, risky edge cases, and missing tests. Do not edit files.",
  },
  maxTurns: 4,
  maxBudgetUsd: 0.2,
  disallowedTools: ["Bash"],
}

export default function Page() {
  const { messages, sendMessage, status, stop, error } = useChat({ chat } as any)

  return (
    <AgentChat
      messages={messages}
      onSend={(message) =>
        sendMessage(
          {
            role: "user",
            parts: [{ type: "text", text: message.content }],
          },
          {
            body: { options: reviewOptions },
          },
        )
      }
      status={status}
      onStop={stop}
      error={error ?? undefined}
    />
  )
}