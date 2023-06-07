import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { CredentialType } from '@prisma/client';
import { NotFoundError, PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import { createFetch } from '@whatwg-node/fetch';
import cors from 'cors';
import { useNoBatchedQueries } from 'envelop-no-batched-queries';
import express from 'express';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { z, ZodError } from 'zod';
import { context } from './context.js';
import { customErrorMap } from './errors.js';
import { prisma } from './prisma.js';
import { schema, writeSchema } from './schema.js';

z.setErrorMap(customErrorMap);

const yoga = createYoga({
  schema,
  // CORS are handled below, disable Yoga's default CORS settings
  cors: false,
  context,
  graphiql: {
    defaultQuery: /* GraphQL */ `
      query {
        homepage {
          edges {
            node {
              title
              body
              author {
                firstName
                lastName
              }
              group {
                name
              }
            }
          }
        }
      }
    `,
  },
  fetchAPI: createFetch({
    useNodeFetch: true,
    formDataLimits: { files: 1, fileSize: 10 * 1024 * 1024 },
  }),
  maskedErrors: {
    maskError(error, message) {
      if (process.env['NODE_ENV'] === 'development') console.error(error);

      const cause = (error as GraphQLError).originalError;

      // These are user errors, no need to take special care of them
      if (cause instanceof NotFoundError)
        return new GraphQLError(cause.message, { extensions: { http: { status: 404 } } });

      if (cause instanceof ForbiddenError)
        return new GraphQLError(cause.message, { extensions: { http: { status: 401 } } });

      if (cause instanceof ZodError) {
        return new GraphQLError('Validation error.', {
          extensions: { code: 'ZOD_ERROR', errors: cause.format(), http: { status: 400 } },
        });
      }

      // Below this point are server errors
      if (process.env['NODE_ENV'] !== 'development') console.error(error);

      // If the error has no cause, return it as is
      if (cause === undefined) return error as GraphQLError;

      if (cause instanceof PrismaClientKnownRequestError) {
        return new GraphQLError('Database error.', {
          extensions: { code: 'PRISMA_ERROR', prismaCode: cause.code, http: { status: 500 } },
        });
      }

      if (cause instanceof GraphQLError) return cause;
      return new GraphQLError(message, { extensions: { http: { status: 500 } } });
    },
  },
  plugins: [useNoBatchedQueries({ allow: 4 })],
});

const api = express();
api.use(
  // Allow queries from the frontend only
  cors({ origin: [process.env.FRONTEND_ORIGIN, 'http://192.168.*', 'http://app'] }),
  // Set basic security headers
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
api.use('/graphql', async (req, res) => yoga(req, res));
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(fileURLToPath(new URL(process.env.STORAGE)))
);

// Poor man's GDPR data download
api.use('/dump', async (req, res) => {
  const token = String(req.query['token']);
  try {
    const credential = await prisma.credential.findFirstOrThrow({
      where: { type: CredentialType.Token, value: token },
      include: {
        user: {
          include: { groups: true, articles: true, linkCollection: { include: { links: true } } },
        },
      },
    });
    res.json({ _: `Downloaded on ${new Date().toISOString()}`, ...credential.user });
  } catch {
    res
      .status(401)
      .send('<h1>401 Unauthorized</h1><p>Usage: <code>/dump?token=[session token]</code></p>');
  }
});

api.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centraverse API</title>
  <style>body { font-family: system-ui, sans serif; } a { color: #1d4ed8; }</style>
</head>
<body>
  <h1>Centraverse API</h1>
  <p><strong><a href="${new URL(process.env.FRONTEND_ORIGIN).toString()}">
    Retourner à l'accueil</a></strong></p>
  <p><a href="/graphql">GraphiQL (pour les développeurs et les curieux)</a></p>
  <p><a href="https://git.inpt.fr/inp-net/centraverse">Code source</a></p>
</body>
</html>`);
});
api.listen(4000, () => {
  console.log('API ready at http://localhost:4000');
});

await writeSchema();
