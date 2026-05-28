import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { CliConfig, AccountConfig } from './types';

const CONFIG_DIR = join(homedir(), '.clickup-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULTS: CliConfig = { activeAccount: null, accounts: {} };

function read(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return { ...DEFAULTS, accounts: {} };
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as CliConfig;
  } catch {
    return { ...DEFAULTS, accounts: {} };
  }
}

function write(data: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const config = {
  getActiveAccount(): string | null {
    return read().activeAccount;
  },

  setActiveAccount(name: string | null): void {
    const c = read();
    c.activeAccount = name;
    write(c);
  },

  getAccounts(): Record<string, AccountConfig> {
    return read().accounts;
  },

  getAccount(name: string): AccountConfig | undefined {
    return read().accounts[name];
  },

  getActiveAccountConfig(): AccountConfig | undefined {
    const c = read();
    if (!c.activeAccount) return undefined;
    return c.accounts[c.activeAccount];
  },

  addAccount(account: AccountConfig): void {
    const c = read();
    c.accounts[account.name] = account;
    write(c);
  },

  removeAccount(name: string): void {
    const c = read();
    delete c.accounts[name];
    if (c.activeAccount === name) c.activeAccount = null;
    write(c);
  },

  get configPath(): string {
    return CONFIG_FILE;
  },
};
