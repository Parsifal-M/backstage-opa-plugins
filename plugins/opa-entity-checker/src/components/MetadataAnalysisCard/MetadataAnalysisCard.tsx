import { useApi } from '@backstage/core-plugin-api';
import { opaBackendApiRef } from '../../api/types';
import { Card, CardContent, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';

export const MetadataAnalysisCard = () => {
  // Get api instance
  const opaBackendApi = useApi(opaBackendApiRef);
  const [healthStatus, setHealthStatus] = useState<{status: string} | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await opaBackendApi.getHealth();
        setHealthStatus(health);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, [opaBackendApi]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Opa Entity Checker Plugin Health Status:</Typography>
        {healthStatus ?
          <Typography variant="body1">{`Status: ${healthStatus.status}`}</Typography>
          :
          <Typography variant="body1">Loading...</Typography>
        }
      </CardContent>
    </Card>
  );
};
