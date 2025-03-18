import React, { useEffect, useState } from 'react';
import { Typography, Grid, Button } from '@material-ui/core';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaPermissionsBackendApiRef, OpaPolicy } from '../../api/types';
import { InfoCard } from '@backstage/core-components';

export const PolicyList = () => {
  const opaApi = useApi(opaPermissionsBackendApiRef);
  const alertApi = useApi(alertApiRef);
  const [policies, setPolicies] = useState<OpaPolicy[]>([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await opaApi.getOpaPermissionPolicies();

        if (response && response.result) {
          setPolicies(response.result);
        } else {
          setPolicies([]);
        }
      } catch (error) {
        alertApi.post({
          message: 'Error fetching policies',
          severity: 'error',
        });
      }
    };

    fetchPolicies();
  }, [alertApi, opaApi]);

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom>
        Policy List
      </Typography>

      {policies.length > 0 ? (
        <Grid container spacing={3}>
          {policies.map(policy => {
            const fileName = policy.id.split('/').pop() || 'Unnamed Policy';
            return (
              <Grid item xs={12} sm={6} md={4} key={policy.id}>
                <InfoCard title={fileName} subheader={policy.id}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePolicyClick(policy.id)}
                  >
                    Edit Policy
                  </Button>
                </InfoCard>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <InfoCard title="No Policies">
          <Typography>No policies found</Typography>
        </InfoCard>
      )}
    </>
  );
};
