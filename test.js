import { Agent } from "alith";
import "dotenv/config";

console.log(process.env.GROQ_API_KEY)

async function main() {
  const agent = new Agent({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,
    preamble: "You are a helpful assistant."
  });

  console.log(await agent.prompt("Hello LazAI!"));
}

main();
