import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Configurar pool de conexões para Neon
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

const pool = new Pool({ connectionString });

// Criar adapter do Prisma com driver Neon
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  // Configuração de autenticação por email/senha
  emailAndPassword: {
    enabled: true,
  },
  
  // Você pode adicionar providers sociais aqui
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },
  
  // Base path para as rotas de autenticação
  basePath: '/api/auth',
  
  // URL base da aplicação
  baseURL: process.env.BETTER_AUTH_URL,
  
  // Secret para criptografia
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Hooks (opcional) - necessário para usar @Hook() decorator
  hooks: {},
});