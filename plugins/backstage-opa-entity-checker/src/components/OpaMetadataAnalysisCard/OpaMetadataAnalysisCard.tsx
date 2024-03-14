import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Chip } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaBackendApiRef } from '../../api';
import { OpaResult, EntityResult } from '../../api/types';

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

const getPassStatus = (violations: EntityResult[] = []) => {
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
  let violationId = 0;

  const fetchData = useCallback(async () => {
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
  }, [entity, alertApi, opaApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const passStatus = useMemo(
    () => getPassStatus(opaResults?.result),
    [opaResults],
  );

  let chipColor: 'orange' | 'green' | 'red';
  if (passStatus === 'FAIL') {
    chipColor = 'red';
  } else if (passStatus === 'PASS') {
    chipColor = 'green';
  } else {
    chipColor = 'orange';
  }

  const renderCardContent = () => {
    if (!opaResults){
      return (
        <Typography>
          OPA did not return any results for this entity. Please make sure you
          are using the correct OPA package name.
        </Typography>
      );
    }

    if (!opaResults?.result?.length) {
      return <Typography>No issues found!</Typography>;
    }

    return opaResults.result.map((violation: EntityResult) => (
      <Alert
        severity={violation.level}
        key={violation.id ?? ++violationId}
        className={classes.alert}
      >
        {violation.message}
      </Alert>
    ));
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.titleBox}>
          <Typography variant="h6">OPA Entity Checker</Typography>
          {opaResults?.result && (
            <Chip
              label={passStatus}
              style={{ backgroundColor: chipColor }}
              className={classes.chip}
            />
          )}
        </div>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
};
