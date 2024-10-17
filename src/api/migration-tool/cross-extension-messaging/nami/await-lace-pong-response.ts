import { NamiLacePingProtocol, SendMessageToExtension } from '../shared/types';

export const awaitLacePongResponse = async (
  laceExtensionId: string,
  sendMessage: SendMessageToExtension,
): Promise<boolean> => {
  console.log(
    '[MIGRATION TO LACE] Checking if Lace is installed by sending ping message',
  );
  try {
    const response = await sendMessage(
      laceExtensionId,
      NamiLacePingProtocol.ping,
    );
    console.log('[MIGRATION TO LACE] response from Lace', response);
    if (response === NamiLacePingProtocol.pong) {
      return true;
    }
  } catch {
    console.log('[MIGRATION TO LACE] got no response from Lace');
    return false;
  }
  console.log('[MIGRATION TO LACE] got wrong pong response from Lace');
  return false;
};
