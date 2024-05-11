import { UrlReader } from '@backstage/backend-common';
import { NotFoundError } from '@backstage/errors';

export async function readPolicyFile(
  reader: UrlReader,
  policyFilePath: string,
): Promise<string | undefined> {
  const url = `${policyFilePath}`;
  try {
    const data = await reader.readUrl(url);
    const buffer = await data.buffer();
    return buffer.toString();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return undefined;
    }
    throw error;
  }
}
