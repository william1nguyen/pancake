import logger from "../utils/logger";
import { commandQueue, createCommandWorker } from "./workers";

const initWorkers = (): void => {
  logger.info("Create workers");
  createCommandWorker();
  logger.info("Workers created");
};

export const setupBackgroundJobs = (): void => {
  initWorkers();
};

export const LIST_QUEUES = [commandQueue];
