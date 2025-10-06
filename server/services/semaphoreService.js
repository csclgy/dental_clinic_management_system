import axios from "axios";

const SEMAPHORE_API_URL = "https://semaphore.co/api/v4/messages";
const API_KEY = "dd469ddab455440d4acd2538b129de01"; // replace this with your actual API key

export const sendSms = async (number, message) => {
  try {
    const response = await axios.post(
      SEMAPHORE_API_URL,
      {
        apikey: API_KEY,
        number: number,
        message: message,
        sendername: "SEMAPHORE", // optional if approved
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to send SMS:", error.response?.data || error.message);
    throw new Error("SMS sending failed");
  }
};
