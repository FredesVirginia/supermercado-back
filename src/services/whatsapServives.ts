import { client } from "../controllers/whatsappBot"

export const sendWhatsappMessage = async (number: string, message: string) => {
  if (!client.info) {
    console.log('⚠️ Cliente no está listo aún...');
    return;
  }

  const chatId = `${number}@c.us`;
  await client.sendMessage(chatId, message);
};
