export type OpaPolicy = {
  opaPolicyContent: string;
};

export interface OpaBackendApi {
  getPolicyFromRepo(opaPolicy: string): Promise<OpaPolicy>;
}
