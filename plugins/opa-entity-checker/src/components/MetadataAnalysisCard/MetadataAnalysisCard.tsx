import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Chip, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { OpaClient } from '../../api/opa';
import { useEntity } from '@backstage/plugin-catalog-react';
import { OpaResult, Violation } from '../../api/types';
import { useApi, configApiRef, discoveryApiRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      marginBottom: theme.spacing(2),
    },
    title: {
      marginBottom: theme.spacing(2),
    },
    alert: {
      marginBottom: theme.spacing(1),
    },
    chip: {
      marginLeft: 'auto',
    },
    titleBox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    }
  })
);

export const MetadataAnalysisCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [opaResults, setOpaResults] = useState<OpaResult | null>(null);

  const configApi = useApi(configApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const opaClient = useMemo(() => new OpaClient({ configApi, discoveryApiUrl: discoveryApi }), [configApi, discoveryApi]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await opaClient.evaluateMetadata(entity);
          setOpaResults(results);
      } catch (err) {
        // handle the error accordingly
      }
    };
    fetchData();
  }, [entity, opaClient]);

  const getPassStatus = (violations: Violation[] = []) => {
    const errors = violations.filter(v => v.level === 'error').length;
    return errors > 0 ? 'FAIL' : 'PASS';
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box className={classes.titleBox}>
          <Typography variant="h6">
            Metadata Analysis
          </Typography>
          {opaResults?.violation && 
            <Chip 
              label={getPassStatus(opaResults.violation)} 
              color={getPassStatus(opaResults.violation) === 'FAIL' ? 'secondary' : 'primary'} 
              className={classes.chip}
            />
          }
        </Box>
        {opaResults && opaResults.violation && opaResults.violation.length > 0 ?  (
          opaResults?.violation?.map((violation: Violation, i: number) => (
            <Alert severity={violation.level} key={i} className={classes.alert}>
              {violation.message}
            </Alert>
          ))
        ) : (
          <Typography>No Issues Found!</Typography>
        )}
      </CardContent>
    </Card>
  );
};
