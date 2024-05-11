import React, { useState, useEffect } from 'react';
import {
  CodeSnippet,
  Content,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import { opaPolicyBackendApiRef, OpaPolicy } from '../../api/types';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

export const OpaPolicyPage = () => {
  const [policy, setPolicy] = useState<OpaPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const opaApi = useApi(opaPolicyBackendApiRef);
  const { entity } = useEntity();
  const alertApi = useApi(alertApiRef);
  const opaPolicy = entity.metadata?.annotations?.['open-policy-agent/policy'];

  useEffect(() => {
    const fetchData = async () => {
      if (opaPolicy) {
        try {
          const response = await opaApi.getPolicyFromRepo(opaPolicy);
          if (response.policyContent) {
            setPolicy(response);
            setLoading(false);
          }
        } catch (error: unknown) {
          alertApi.post({
            message: `Could not fetch OPA policy: ${error}`,
            severity: 'error',
            display: 'transient',
          });
        }
      }
    };
    fetchData();
  }, [opaApi, entity, opaPolicy, alertApi]);

  if (loading) {
    return <Progress data-testid="progress" />;
  }

  return (
    <Content>
      <InfoCard
        title={`${entity.metadata.name} OPA Policy`}
        data-testid="opa-policy-card"
      >
        <CodeSnippet
          text={policy?.policyContent ?? ''}
          language="rego"
          showLineNumbers
          showCopyCodeButton
          customStyle={{ background: 'inherit', fontSize: '110%' }}
        />
      </InfoCard>
    </Content>
  );
};
