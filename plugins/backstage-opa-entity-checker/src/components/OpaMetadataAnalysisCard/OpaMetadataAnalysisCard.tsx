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
    },
  }),
);

const getPassStatus = (violations: Violation[] = []) => {
  const errors = violations.filter(v => v.level === 'error').length;
  const warnings = violations.filter(v => v.level !== 'error').length;

  if (errors > 0) {
    return 'FAIL';
  } else if (warnings > 0) {
    return 'WARN';
  }
  return 'PASS';
};

export const OpaMetadataAnalysisCard = () => {
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
      } catch (error: unknown) {
        alertApi.post({
          message: `Could not fetch data from OPA: ${error}`,
          severity: 'error',
          display: 'transient',
        });
      }
    };
    fetchData();
  }, [entity, alertApi, opaApi]);

  const renderCardContent = () => {
    if (opaResults === null) {
      return (
        <Typography>
          OPA did not return any results for this entity. Please make sure you
          are using the correct OPA package name.
        </Typography>
      );
    }

    if (!opaResults?.result?.violation?.length) {
      return <Typography>No issues found!</Typography>;
    }

    return opaResults.result.violation.map((violation: Violation) => (
      <Alert
        severity={violation.level}
        key={`${violation.level}-${violation.message}`}
        className={classes.alert}
      >
        {violation.message}
      </Alert>
    ));
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box className={classes.titleBox}>
          <Typography variant="h6">OPA Metadata Analysis</Typography>
          {opaResults?.result?.violation && (
            <Chip
              label={getPassStatus(opaResults.result.violation)}
              color={
                getPassStatus(opaResults.result.violation) === 'FAIL'
                  ? 'secondary'
                  : 'default'
              }
            />
          )}
        </Box>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
};
