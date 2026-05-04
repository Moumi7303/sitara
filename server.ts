import { AgentClient } from "@21st-sdk/node"

const client = new AgentClient({ apiKey: process.env.API_KEY_21ST! })


const sandbox = await client.sandboxes.create({ agent: "my-agent" })


const thread = await client.threads.create({
  sandboxId: sandbox.id,
  name: "Chat 1",
})


const token = await client.tokens.create({ agent: "my-agent" })
