import React, { useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { evaluateMetadata } from '../../api/opa';
import { useEntity } from '@backstage/plugin-catalog-react';
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
    }
  })
);

export const MetadataAnalysisCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [opaResults, setOpaResults] = useState<OpaResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await evaluateMetadata(entity);
        if (!results.allow) {
          setOpaResults(results);
        }
      } catch (err) {
        // handle the error accordingly
      }
    };
    fetchData();
  }, [entity]);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Metadata Analysis
        </Typography>
        {opaResults?.violation?.map((violation: Violation, i: number) => (
          <Alert severity={violation.level} key={i} className={classes.alert}>
            {violation.message}
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
