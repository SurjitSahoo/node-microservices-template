import { cleanEnv, str, num } from 'envalid';
import * as dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  OAUTH_JWKS_URI: str({ desc: 'JWKS URI for OAuth2 token validation' }),
  POSTGRES_HOST: str(),
  POSTGRES_PORT: num(),
  POSTGRES_USERNAME: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_DATABASE: str(),
  NODE_ENV: str({
    default: 'development',
    choices: ['development', 'test', 'production', 'local'],
  }),
});

export default env;
