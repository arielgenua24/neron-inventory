import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the client with the API key
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { message, clientsData } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        // Create a context-aware system instruction
        const systemInstruction = `Eres un asistente inteligente para el sistema de tracking de honorarios "Nerón Inventory". 
Tu rol es ayudar a los usuarios a consultar información sobre clientes, empleados, pagos y honorarios.

DATOS ACTUALES DEL SISTEMA:
${JSON.stringify(clientsData, null, 2)}

REGLAS IMPORTANTES:
1. Responde siempre en español de Argentina.
2. Sé conciso pero amable.
3. Cuando te pregunten sobre pagos, indica qué meses están pagados o pendientes.
4. Los montos están en pesos argentinos (ARS).
5. Puedes ayudar a calcular totales, identificar morosos, y dar información precisa sobre cualquier cliente o empleado.
6. Si no hay datos disponibles, indícalo amablemente.
7. Usa formato claro y organizado para presentar la información.
8. El CUIT se muestra en formato XX-XXXXXXXX-X.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const text = response.text;

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Error al procesar tu consulta. Por favor, intentá de nuevo." },
            { status: 500 }
        );
    }
}
