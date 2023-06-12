export interface ArtifactResponse {
  data: Data;
}

export interface Data {
  packages: Packages;
}

export interface Packages {
  edges: PackageEdge[];
}

export interface PackageEdge {
  node: PackageNode;
}

export interface PackageNode {
  name: string;
  description: string | null;
  created: string;
  versions: Version[];
}

export interface Version {
  name: string;
  size: string;
  vulnerabilities: Vulnerabilities;
  stats: Stats;
  package: Package;
}

export interface Vulnerabilities {
  high?: number;
  medium?: number;
  low?: number;
  info?: number;
  unknown?: number;
  skipped?: number;
}

export interface Stats {
  downloadCount: number;
}

export interface Package {
  packageType: string;
}
