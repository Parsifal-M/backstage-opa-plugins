import { Router } from 'express';
import { Config } from '@backstage/config';
import {
  HttpAuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { z } from 'zod';

const opaAuthzRequestSchema = z.object({
  entryPoint: z.string().min(1),
  input: z.record(z.unknown()).transform(({ userEntity: _, ...rest }) => rest),
  includeUserEntity: z.boolean().default(false),
});

type OpaInput = {
  userEntityRef: string;
  ownershipEntityRefs: string[];
  userEntity?: Entity | null;
} & Record<string, unknown>;

export function authzRouter(
  catalog: CatalogService,
  logger: LoggerService,
  config: Config,
  httpAuth: HttpAuthService,
  userInfo: UserInfoService,
): Router {
  const router = Router();
  const baseUrl =
    config.getOptionalString('openPolicyAgent.baseUrl') ??
    'http://localhost:8181';

  router.post('/opa-authz', async (req, res) => {
    const parsed = opaAuthzRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      entryPoint: policyEntryPoint,
      input,
      includeUserEntity,
    } = parsed.data;

    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const info = await userInfo.getUserInfo(credentials);

    let opaInput: OpaInput = { ...input, ...info };

    if (includeUserEntity) {
      try {
        const userEntity = await catalog.getEntityByRef(info.userEntityRef, {
          credentials,
        });

        opaInput = {
          ...opaInput,
          userEntity: userEntity ?? null,
        };
      } catch (error: unknown) {
        logger.error(
          `An error occurred while retrieving the full user entity from the catalog: ${error}`,
        );
        return res.status(500).json({ error: 'Error evaluating policy' });
      }
    }

    logger.debug(
      `OPA Backend received request with input: ${JSON.stringify(
        opaInput,
      )} and the policy entrypoint: ${policyEntryPoint}`,
    );

    try {
      const url = `${baseUrl}/v1/data/${policyEntryPoint}`;
      logger.debug(`Sending data to OPA: ${JSON.stringify(opaInput)}`);

      const opaResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: opaInput }),
      });

      if (!opaResponse.ok) {
        const message = `An error response was returned after sending the policy input to the OPA server: ${opaResponse.status} - ${opaResponse.statusText}`;
        logger.error(message);
        return res.status(opaResponse.status).json({ error: message });
      }

      const opaPermissionsResponse = await opaResponse.json();
      logger.debug(
        `Received data from OPA: ${JSON.stringify(opaPermissionsResponse)}`,
      );

      return res.json(opaPermissionsResponse);
    } catch (error: unknown) {
      logger.error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
      return res.status(500).json({ error: 'Error evaluating policy' });
    }
  });

  return router;
}
