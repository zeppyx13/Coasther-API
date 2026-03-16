const GoogleGenerativeAI = require("@google/generative-ai").GenerativeAI;
const dotenv = require("dotenv");
dotenv.config();
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  temperature: 0.7,
  maxOutputTokens: 2048,
  generationConfig: {
    responseMimeType: "application/json",
    stopSequences: ["\n\n"],
    responseSchema: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          name: { type: FunctionDeclarationSchemaType.STRING },
          description: { type: FunctionDeclarationSchemaType.STRING },
          parameters: {
            type: FunctionDeclarationSchemaType.ARRAY,
            items: {
              type: FunctionDeclarationSchemaType.OBJECT,
              properties: {
                name: { type: FunctionDeclarationSchemaType.STRING },
                type: { type: FunctionDeclarationSchemaType.STRING },
                description: { type: FunctionDeclarationSchemaType.STRING },
              },
            },
          },
        },
      },
    },
  },
});
