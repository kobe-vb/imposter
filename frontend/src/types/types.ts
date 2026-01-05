export type PlayerName = string;

export type Player = {
  name: string;
  alive: boolean;
  role?: string;
  task?: string;
};

export type Role = { name: string; count: number };

export type GameSettings = {
  taskTemplate: string;
  taskTime: number;
  infoDisplayTime: number;
  tasksPerRound: number;
};

export type TasksResponse = {
  tasks: string[];
};

export type PlayersResponse = {
  players: Player[];
};

export type CreateGameResponse = {
  code: string;
};
