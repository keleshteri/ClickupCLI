export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture: string | null;
  initials: string;
}

export interface ClickUpTeamMember {
  user: ClickUpUser;
  role: number;
}

export interface ClickUpTeam {
  id: string;
  name: string;
  color: string;
  avatar: string | null;
  members: ClickUpTeamMember[];
}

export interface ClickUpStatus {
  status: string;
  color: string;
  type: string;
  orderindex: number;
}

export interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface ClickUpTask {
  id: string;
  custom_id: string | null;
  name: string;
  text_content: string | null;
  description: string | null;
  status: ClickUpStatus;
  priority: ClickUpPriority | null;
  assignees: ClickUpUser[];
  tags: ClickUpTag[];
  due_date: string | null;
  start_date: string | null;
  date_created: string;
  date_updated: string;
  creator: Pick<ClickUpUser, 'id' | 'username' | 'email' | 'profilePicture'>;
  url: string;
  list: { id: string; name: string; access: boolean };
  folder: { id: string; name: string; hidden: boolean; access: boolean };
  space: { id: string };
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  task_count: string;
  hidden: boolean;
  space: { id: string; name: string };
}

export interface ClickUpList {
  id: string;
  name: string;
  task_count: number | null;
  archived: boolean;
  folder: { id: string; name: string; hidden: boolean; access: boolean };
  space: { id: string; name: string; access: boolean };
  permission_level: string;
}
