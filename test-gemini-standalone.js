const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Extract API Key manually from .env if possible, or just use it here
const key = "AIzaSyCtzDLJZV6ZFQOcpsjVwnQjZCeTXdr4omQ";

const genAI = new GoogleGenerativeAI(key);

async function test() {
  console.log("Testing Gemini 1.5 Flash...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Say hello!",
    ]);
    console.log("Success! Response:", result.response.text());
  } catch (e) {
    console.error("❌ Gemini Test Failed:", e.message);
    if (e.message.includes("API_KEY_INVALID")) {
        console.error("CRITICAL: The API key is invalid.");
    }
  }
}

test();
