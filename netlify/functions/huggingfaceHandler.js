const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    const userMessage = JSON.parse(event.body).userMessage;
    const API_TOKEN = process.env.HUGGINGFACE_API_TOKEN; // Store this in Netlify environment variables
    
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        const botMessage = responseData.generated_text || "Hmm, I'm not sure what to say right now.";

        return {
            statusCode: 200,
            body: JSON.stringify({ botMessage }),
        };
    } catch (error) {
        console.error("Error generating response from HuggingFace:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ botMessage: "Oops, something went wrong. Please try again later." }),
        };
    }
};
