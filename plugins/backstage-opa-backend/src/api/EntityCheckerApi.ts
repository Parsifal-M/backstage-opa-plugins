import fetch from "node-fetch";
import {LoggerService} from "@backstage/backend-plugin-api";

export interface EntityCheckerApi {
  checkEntity(options: checkEntityOptions): Promise<OpaResult>
}

export type checkEntityOptions = {
  entityMetadata: string,
}

export type EntityCheckerConfig = {
  logger: LoggerService,
  opaBaseUrl: string | undefined,
  entityCheckerEntrypoint: string | undefined,
}

export interface OpaResult {
  good_entity: boolean;
  result?: EntityResult[];
}

export interface EntityResult {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

export class EntityCheckerApiImpl implements EntityCheckerApi{
  constructor(private readonly config: EntityCheckerConfig) {
    const logger = this.config.logger;

    if (!config.opaBaseUrl) {
      logger.error('OPA URL not set or missing!');
      throw new Error('OPA URL not set or missing!');
    }

    if (!config.entityCheckerEntrypoint) {
      logger.error('OPA package not set or missing!');
      throw new Error('OPA package not set or missing!');
    }
  }

  async checkEntity(options: checkEntityOptions): Promise<OpaResult> {
    const logger = this.config.logger;
    const entityMetadata = options;

    if (!entityMetadata) {
      logger.error('Entity metadata is missing!');
      throw new Error('Entity metadata is missing!');
    }

    const opaUrl = `${this.config.opaBaseUrl}/v1/data/${this.config.entityCheckerEntrypoint}`;
    logger.debug(`Sending entity metadata to OPA: ${entityMetadata}`);
    const opaResponse = await fetch(opaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: entityMetadata }),
    });
    const opaEntityCheckerResponse = await opaResponse.json() as OpaResult;
    logger.debug(`Received response from OPA: ${opaEntityCheckerResponse.result}`);
    return opaEntityCheckerResponse;
  }
}
