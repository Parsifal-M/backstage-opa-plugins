import { UrlReaderService } from '@backstage/backend-plugin-api';

export async function readPolicyFile(
  urlReader: UrlReaderService,
  policyFilePath: string,
): Promise<string | undefined> {
  const url = `${policyFilePath}`;
  try {
    const response = await urlReader.readUrl(url);
    const buffer = await response.buffer();
    return buffer.toString();
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return undefined;
    }
    throw error;
  }
}
