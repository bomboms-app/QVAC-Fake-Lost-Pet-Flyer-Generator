import { completion } from "@qvac/sdk";

function cleanOutput(text) {
  return text
    .trim()
    .replace(/^```[\s\S]*?\n/, "")
    .replace(/```$/, "")
    .trim();
}

const fallbackAlert = (pet) => `
LOST PET ALERT

${pet.name} is a missing ${pet.type}.

Appearance: ${pet.appearance}
Last seen: ${pet.location}
Distinctive features: ${pet.features}

If you see ${pet.name}, please contact: ${pet.contact}
`;

export async function generate(modelId, pet) {
  const prompt = `
Create a clear lost-pet alert using the information below.

Pet name: ${pet.name}
Animal type: ${pet.type}
Appearance: ${pet.appearance}
Last seen location: ${pet.location}
Distinctive features: ${pet.features}
Contact information: ${pet.contact}

Format the response exactly with these sections:

LOST PET ALERT
PET DETAILS
LAST SEEN
IDENTIFICATION CLUES
IF YOU SEE THIS PET
CONTACT

Keep the alert concise, practical, and easy to share.
Do not invent information that was not provided.
Return only the finished alert.
`;

  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content: "You are PetPulse, a local lost-pet alert assistant."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    stream: true,
    completionOpts: {
      temperature: 0.7,
      maxTokens: 300
    }
  });

  let text = "";

  for await (const token of run.tokenStream) {
    text += token;
  }

  text = cleanOutput(text);

  if (!text || text.length < 30) {
    text = fallbackAlert(pet);
  }

  return { result: text };
}
