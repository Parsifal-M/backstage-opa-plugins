import React, { useState, useEffect } from 'react';
import {
  Content,
  InfoCard,
  Progress,
  CopyTextButton,
} from '@backstage/core-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { opaPolicyBackendApiRef, OpaPolicy } from '../../api/types';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { a11yDark, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@material-ui/core';

export const OpaPolicyPage = () => {
  const theme = useTheme();
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
          if (response.opaPolicyContent) {
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
        action={
          <CopyTextButton
            text={policy?.opaPolicyContent ?? ''}
            tooltipText="Copied policy to clipboard!"
          />
        }
      >
        <SyntaxHighlighter
          language="rego"
          style={theme.palette.type === 'dark' ? a11yDark : coy}
          customStyle={{ background: 'inherit', fontSize: '110%' }}
          showLineNumbers
        >
          {policy?.opaPolicyContent ?? ''}
        </SyntaxHighlighter>
      </InfoCard>
    </Content>
  );
};
