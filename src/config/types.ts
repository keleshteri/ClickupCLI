export interface AccountConfig {
  name: string;
  token: string;
  userId: number;
  username: string;
  email: string;
}

export interface CliConfig {
  activeAccount: string | null;
  accounts: Record<string, AccountConfig>;
}
