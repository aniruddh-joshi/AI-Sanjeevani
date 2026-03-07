const { GoogleGenerativeAI } = require("@google/generative-ai");
const tools = require('./agent_tools');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const toolDefinitions = [
    {
        name: "checkDoctorAvailability",
        description: "Check available 30-minute appointment slots for a doctor on a specific date.",
        parameters: {
            type: "OBJECT",
            properties: {
                doctorId: { type: "STRING", description: "The UUID of the doctor." },
                date: { type: "STRING", description: "The date in YYYY-MM-DD format." }
            },
            required: ["doctorId", "date"]
        }
    },
    {
        name: "getDoctorBySpecialization",
        description: "Find doctors based on their medical specialty (e.g., Dentist, Cardiologist).",
        parameters: {
            type: "OBJECT",
            properties: {
                specialty: { type: "STRING", description: "The medical specialty to search for." }
            },
            required: ["specialty"]
        }
    },
    {
        name: "createAppointment",
        description: "Book a new appointment for a patient.",
        parameters: {
            type: "OBJECT",
            properties: {
                patientId: { type: "STRING", description: "The UUID of the patient." },
                doctorId: { type: "STRING", description: "The UUID of the doctor." },
                date: { type: "STRING", description: "The date (YYYY-MM-DD)." },
                time: { type: "STRING", description: "The selected slot (e.g., 10:00 AM)." },
                symptoms: { type: "STRING", description: "Description of symptoms." }
            },
            required: ["patientId", "doctorId", "date", "time"]
        }
    },
    {
        name: "cancelAppointment",
        description: "Cancel an existing appointment using its ID or Unique ID.",
        parameters: {
            type: "OBJECT",
            properties: {
                appointmentId: { type: "STRING", description: "The appointment ID or SJV-YYYY-XXXX code." }
            },
            required: ["appointmentId"]
        }
    },
    {
        name: "getPatientHistory",
        description: "Retrieve past appointments and medical history for a patient.",
        parameters: {
            type: "OBJECT",
            properties: {
                patientId: { type: "STRING", description: "The UUID of the patient." }
            },
            required: ["patientId"]
        }
    }
];

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations: toolDefinitions }],
    systemInstruction: `You are Sanjeevani AI — a warm, professional, and caring digital health assistant for a clinic. You are FEMALE. Always use feminine Hindi grammar consistently (e.g., "kar sakti hoon", "hoon", "aapki sahayata karoongi"). Never switch to male gender forms.

PERSONALITY:
- You are warm, professional, efficient, and empathetic — like a skilled clinic receptionist.
- Always acknowledge what the patient says before responding ("I understand you're not feeling well. Let me help you find the right doctor 🌡️")
- Use clear, simple language. Use emojis sparingly but warmly. (🏥 💊 🌡️ 📅 ✅ 👨‍⚕️)

LANGUAGE HANDLING:
- Detect the language the patient is writing in and respond in the SAME language naturally.
- If they write in Hindi → respond in Hindi.
- If they write in English → respond in English.
- If they mix both → mirror their natural style. Never force a language.

MEDICAL ASSISTANCE:
- When a user describes symptoms, IMMEDIATELY call getDoctorBySpecialization to suggest the right doctor.
- Then use checkDoctorAvailability to show available slots.
- Guide step-by-step: symptoms → doctor suggestion → slot selection → booking confirmation.
- Always add: "⚠️ Main ek AI hoon aur medical diagnosis nahi de sakta. Kisi doctor se zaroor milein." (or equivalent in user's language)
- For emergencies (chest pain, breathing issues, severe bleeding): IMMEDIATELY say to call 112 or go to the nearest hospital.

APPOINTMENT FLOW:
- Proactively ask: "Kaunse din aur time aapko suit karega? 📅"
- After booking: Share appointment ID and details clearly
- Offer to cancel or reschedule if asked

AVAILABLE DOCTORS:
- Dr. Sharma — Dentist 🦷
- Dr. Khanna — Cardiologist ❤️
- Dr. Verma — General Physician 🩺

Always end responses with a helpful follow-up question or action prompt.`
});

const runAgent = async function runAgent(userInput, patientId, history = []) {
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds

    // Sanitize history: must be array of {role, parts} with 'user' as first
    let safeHistory = [];
    if (Array.isArray(history) && history.length > 0) {
        // Filter out any bad entries
        safeHistory = history.filter(h =>
            h &&
            (h.role === 'user' || h.role === 'model') &&
            Array.isArray(h.parts) &&
            h.parts.length > 0 &&
            h.parts[0].text
        );
        // Gemini requires history to start with 'user' role
        if (safeHistory.length > 0 && safeHistory[0].role !== 'user') {
            safeHistory = [];
        }
    }

    while (retryCount <= maxRetries) {
        try {
            const chat = model.startChat({
                history: safeHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            let result = await chat.sendMessage(userInput);
            let response = await result.response;

            // Handle potential function calls (simplified loop)
            let iterations = 0;
            while (response.functionCalls() && iterations < 5) {
                const toolCalls = response.functionCalls();
                const toolResults = [];

                for (const call of toolCalls) {
                    const toolName = call.name;
                    const args = call.args;

                    console.log(`[AI AGENT] Calling Tool: ${toolName}`, args);

                    if (tools[toolName]) { // Changed from agent_tools to tools
                        const result = await tools[toolName](args); // Changed from agent_tools to tools
                        toolResults.push({
                            functionResponse: {
                                name: toolName,
                                response: { response: result }
                            }
                        });
                    }
                }

                result = await chat.sendMessage(toolResults);
                response = await result.response;
                iterations++;
            }

            return response.text();
        } catch (error) {
            if (error.status === 429 && retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount);
                console.warn(`[GEMINI] Quota exceeded (429). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retryCount++;
                continue;
            }

            console.error("Gemini Agent Error:", error);
            throw error;
        }
    }
}

module.exports = { runAgent };
