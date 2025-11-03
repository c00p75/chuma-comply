import { router } from '../trpc';
import { ragRouter } from './rag';

export const appRouter = router({
  rag: ragRouter,
});

export type AppRouter = typeof appRouter;


