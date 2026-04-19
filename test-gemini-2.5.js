const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = "AIzaSyCtzDLJZV6ZFQOcpsjVwnQjZCeTXdr4omQ";

const genAI = new GoogleGenerativeAI(key);

async function test() {
  console.log("Testing Gemini 2.5 Flash...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      "Say hello!",
    ]);
    console.log("Success! Response:", result.response.text());
  } catch (e) {
    console.error("❌ Gemini Test Failed:", e.message);
  }
}

test();
