import React, { useState, useEffect } from 'react';
import { Content, InfoCard } from '@backstage/core-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { opaPolicyBackendApiRef, OpaPolicy } from '../../api/types';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

export const OpaPolicyPage = () => {
  const [policy, setPolicy] = useState<OpaPolicy | null>(null);
  const opaApi = useApi(opaPolicyBackendApiRef);
  const { entity } = useEntity();
  const alertApi = useApi(alertApiRef);
  const opaPolicy = entity.metadata?.annotations?.['open-policy-agent/policy'];

  useEffect(() => {
    const fetchData = async () => {
      if (opaPolicy) {
        try {
          const response = await opaApi.getPolicyFromRepo(opaPolicy);
          setPolicy(response.policyContent ? response : null);
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

  return (
      <Content>
        {policy && (
          <InfoCard title={`${entity.metadata.name} OPA Policy`}>
            <SyntaxHighlighter language="rego" showLineNumbers>
              {policy.policyContent}
            </SyntaxHighlighter>
          </InfoCard>
        )}
      </Content>
  );
};