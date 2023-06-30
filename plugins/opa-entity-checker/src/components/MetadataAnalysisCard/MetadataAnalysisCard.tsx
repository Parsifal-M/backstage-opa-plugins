import React, { useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Chip, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaBackendApiRef } from '../../api';
import { OpaResult, Violation } from '../../api/types';

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
  const opaApi = useApi(opaBackendApiRef);
  const [opaResults, setOpaResults] = useState<OpaResult | null>(null);
  const alertApi = useApi(alertApiRef);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await opaApi.entityCheck(entity);
        setOpaResults(results);
      } catch (err: any) {
        alertApi.post({
          message: 'Oops, something went wrong, cannot load Employees!',
          severity: 'error',
        });
      }
    };
    fetchData(); 
  }, [entity, alertApi, opaApi]);

  const getPassStatus = (violations: Violation[] = []) => {
    const errors = violations.filter(v => v.level === 'error').length;
    return errors > 0 ? 'FAIL' : 'PASS';  // Return 'FAIL' if any error exists, 'PASS' otherwise
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
        {opaResults && opaResults.violation && opaResults.violation.length > 0 ? (
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
