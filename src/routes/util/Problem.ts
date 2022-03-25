export type Problem = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  messages?: ErrorMessage[];
};

export type ErrorMessage = {
  name?: string;
  reason?: string[];
};
