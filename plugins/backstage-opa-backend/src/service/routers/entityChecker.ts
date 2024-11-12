import express from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import {EntityCheckerApi} from "../../api/EntityCheckerApi";

export const entityCheckerRouter = (
  logger: LoggerService,
  opa: EntityCheckerApi,
): express.Router => {
  const router = express.Router();

  router.post('/entity-checker', async (req, res, next) => {
    const entityMetadata = req.body.input;

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
    }

    try {
      const opaResponse = await opa.checkEntity(entityMetadata)
      return res.json(opaResponse)
    } catch (error) {
      logger.error(
        'An error occurred trying to send entity metadata to OPA:',
        error,
      );
      return next(error);
    }
  });

  return router;
};
