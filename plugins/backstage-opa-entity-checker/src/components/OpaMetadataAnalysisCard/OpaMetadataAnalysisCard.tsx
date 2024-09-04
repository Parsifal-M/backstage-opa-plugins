import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box, Fab, useMediaQuery, useTheme
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useEntity } from '@backstage/plugin-catalog-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaBackendApiRef } from '../../api';
import { OpaResult, EntityResult } from '../../api/types';
import {Entity} from "@backstage/catalog-model";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';

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

/**
 * Returns true if the given entity has any validation errors
 *
 * @public
 */
export async function hasOPAValidationErrors(
    entity: Entity,
) {
  const opaApi = useApi(opaBackendApiRef);
  const results = await opaApi.entityCheck(entity);
  return getPassStatus(results.result) != 'PASS';
}

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

type OpaMetadataAnalysisCard = 'compact';


export interface OpaMetadataAnalysisCardProps {
  title?: string;
  // Select how the card looks like
  variant?: OpaMetadataAnalysisCard;
}

export const OpaMetadataAnalysisCard = (
  props: OpaMetadataAnalysisCardProps,
) => {
  const classes = useStyles();
  const { entity } = useEntity();
  const opaApi = useApi(opaBackendApiRef);
  const [opaResults, setOpaResults] = useState<OpaResult | null>(null);
  const alertApi = useApi(alertApiRef);

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

  switch (props.variant) {
    case 'compact': {
      return renderCompactCard(props, opaResults)
    }
    default: {
      return (
        <Card className={classes.card}>
          <CardContent>
            <div className={classes.titleBox}>
              <Typography variant="h6">{props.title}</Typography>
              {opaResults?.result && (
                <Chip
                  label={passStatus}
                  style={{ backgroundColor: chipColor }}
                  className={classes.chip}
                />
              )}
            </div>
            {renderCardContent(opaResults)}
          </CardContent>
        </Card>
      );
      break;
    }
  }
};

const renderCompactCard = (props: OpaMetadataAnalysisCardProps, results: OpaResult | null) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
      <Accordion>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
        >
          <Box sx={{ display: isMobile ? "block": "flex", alignItems:"center", gridColumnGap:20 }}>
            <Typography variant="h6">{props.title}</Typography>
            <Fab variant="extended" size="small">
              <ErrorIcon/>
              Errors
            </Fab>
            <Fab variant="extended" size="small">
              <WarningIcon />
              Warnings
            </Fab>
            <Fab variant="extended" size="small">
              <InfoIcon/>
              Infos
            </Fab>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ flexGrow: 1}}>
          {renderCardContent(results)}
          </Box>
        </AccordionDetails>
      </Accordion>
  );
}

const renderCardContent = (results: OpaResult | null) => {
  const classes = useStyles();
  let violationId = 0;

  if (!results) {
    return (
        <Typography>
          OPA did not return any results for this entity. Please make sure you
          are using the correct OPA package name.
        </Typography>
    );
  }

  if (!results?.result?.length) {
    return <Typography>No issues found!</Typography>;
  }

  return results.result.map((violation: EntityResult) => (
      <Alert
          severity={violation.level}
          key={violation.id ?? ++violationId}
          className={classes.alert}
      >
        {violation.message}
      </Alert>
  ));
};

OpaMetadataAnalysisCard.defaultProps = {
  title: 'OPA Entity Checker',
}
