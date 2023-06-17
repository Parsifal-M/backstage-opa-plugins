export interface MetadataAnalysisCardProps {
    entityDetails: {
      name: string;
      type: string;
      id: string;
    };
    metadataFields: Record<string, string>;
    evaluationResults: {
      errors: string[];
      warnings: string[];
    };
  }