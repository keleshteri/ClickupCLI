import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { config } from '../config/store';
import { CliError } from '../utils/errors';

const BASE_URL = 'https://api.clickup.com/api/v2';

export function createApiClient(token?: string): AxiosInstance {
  const activeToken = token ?? config.getActiveAccountConfig()?.token;

  if (!activeToken) {
    throw new CliError('No active account. Run `clickup auth add` to authenticate.');
  }

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: activeToken,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      const status = err.response?.status;
      const url = (err.config?.url ?? '');
      if (status === 401) {
        // ClickUp also returns 401 when the resource doesn't exist or the ID type is wrong
        if (url.includes('/list/') || url.includes('/task/')) {
          throw new CliError(
            'Not found or unauthorized (401).\n' +
            '  • Make sure you used a LIST ID, not a space or folder ID.\n' +
            '  • Run `clickup browse` to find the correct list ID.\n' +
            '  • If your token changed, run `clickup auth add` again.'
          );
        }
        throw new CliError('Invalid or expired API token. Run `clickup auth add` again.');
      }
      if (status === 403) throw new CliError('Access denied. You may not have permission for this resource.');
      if (status === 404) throw new CliError('Resource not found. Check the ID and try again.');
      if (status === 429) throw new CliError('Rate limit hit. Please wait a moment and retry.');
      const msg = (err.response?.data as { err?: string })?.err ?? err.message;
      throw new CliError(`API error: ${msg}`);
    }
  );

  return client;
}
