export type PlayerName = string;

export type Player = {
  name: string;
  alive: boolean;
  role?: string;
  task?: string;
  commend?: string;
  haveVoted?: boolean;
  questions?: string[];
};

export type Role = { name: string; count: number };

export type GameSettings = {
  taskTemplate: string;
  taskTime: number;
  infoDisplayTime: number;
  tasksPerRound: number;
};

export type Question = { key: string; question: string };

export interface PlayerAnswers {
  answered: boolean;
  answers: Record<string, boolean>;  // key: question key, value: answer
}

export type TasksResponse = {
  tasks: string[];
};

export type PlayersResponse = {
  players: Player[];
};

export type CreateGameResponse = {
  code: string;
};


export type Stat = {
  label: string;
  detail: string;
  cursorOffset?: number;
}