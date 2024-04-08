import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { Content, Page } from '@backstage/core-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { opaPolicyBackendApiRef, OpaPolicy } from '../../api/types';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';


export const OpaPolicyPage = () => {
  const [policy, setPolicy] = useState<OpaPolicy | null>(null);
  const opaApi = useApi(opaPolicyBackendApiRef);
  const { entity } = useEntity();
  const opaPolicy = entity.metadata?.annotations?.['open-policy-agent/policy'];

  console.log('opaPolicy:', opaPolicy);

  useEffect(() => {
    const fetchData = async () => {
      if (opaPolicy) {
        try {
          const response = await opaApi.getPolicy(opaPolicy);
          setPolicy(response.id ? response : null);
        } catch (error) {
          console.error('Error fetching OPA policy:', error);
        }
      }
    };
    fetchData();
  }, [opaApi, opaPolicy]);

  return (
    <Page themeId='tool'>
      <Content>
        {policy && (
          <>
            <Typography variant="h6">
              Policy: {policy.id}
            </Typography>
            <SyntaxHighlighter language="rego" style={materialLight}>
              {policy.raw}
            </SyntaxHighlighter>
          </>
        )}
      </Content>
    </Page>
  );
};