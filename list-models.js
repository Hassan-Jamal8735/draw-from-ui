const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = "AIzaSyCtzDLJZV6ZFQOcpsjVwnQjZCeTXdr4omQ";
const genAI = new GoogleGenerativeAI(key);

async function listModels() {
  console.log("Listing available models...");
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy
    // The SDK doesn't have a direct listModels, we usually use the REST API
    const fetch = require('node-fetch'); // Not sure if available
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    // If fetch is not there, we'll try curl
    console.log("Fetch failed, please use curl.");
  }
}

listModels();
