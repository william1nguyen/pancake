import logger from "../shared/logger";
import { commandQueue, createCommandWorker } from "./command";

const initWorkers = (): void => {
  logger.info("Create workers");
  createCommandWorker();
  logger.info("Workers created");
};

export const setupBackgroundJobs = (): void => {
  initWorkers();
};

export const LIST_QUEUES = [commandQueue];
