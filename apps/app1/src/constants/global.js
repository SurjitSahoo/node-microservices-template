import { fileURLToPath } from 'url';
import * as path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const __appRoot = path.join(__dirname, '../../');
export const __srcDir = path.join(__dirname, '../');
