export interface PermissionInput {
    entryPoint: string;
    opaBaseUrl?: string;
    [key: string]: unknown;
}

export interface OpaResponse {
    [key: string]: unknown;
}