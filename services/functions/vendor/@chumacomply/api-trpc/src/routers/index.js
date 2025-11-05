import { router } from '../trpc.js';
import { ragRouter } from './rag.js';
export const appRouter = router({
    rag: ragRouter,
});
