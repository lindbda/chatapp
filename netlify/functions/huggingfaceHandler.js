const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    console.log("Received event:", event);

    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: "",
        };
    }

    let userMessage;
    try {
        if (!event.body) {
            throw new Error("Missing event body");
        }
        userMessage = JSON.parse(event.body).userMessage;
        console.log("User Message:", userMessage);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ botMessage: "Invalid input. Please send a valid message." }),
        };
    }

    const API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: userMessage }),
});
        if (!response.ok) {
            console.error("Error from HuggingFace API:", response.statusText);
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Response Data:", responseData);

        // Extract the generated text
        let botMessage = "Hmm, I'm not sure what to say right now.";
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].generated_text) {
            botMessage = responseData[0].generated_text;
        }
        console.log("Bot Message:", botMessage);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ botMessage }),
        };
    } catch (error) {
        console.error("Error generating response from HuggingFace:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ botMessage: "Oops, something went wrong. Please try again later." }),
        };
    }
};
