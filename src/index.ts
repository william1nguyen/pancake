import '0prelude';

import logger from '~/logger';

export const add = (a: number, b: number): number => a + b;

const hello = () => logger.info('hello');

hello();
