  // src/agenda.ts
  import { Agenda } from "agenda";

  export const agenda = new Agenda({
    db: {
      address: process.env.MONGODB_URI!,
      collection: "agendaJobs",
    },
    processEvery: "1 minutes",
  } as any);
