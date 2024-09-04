import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box, Fab, useMediaQuery, useTheme
} from '@mui/material';
import { Alert } from '@mui/material';
import { useEntity } from '@backstage/plugin-catalog-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaBackendApiRef } from '../../api';
import { OpaResult, EntityResult } from '../../api/types';
import {Entity} from "@backstage/catalog-model";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const PREFIX = 'OpaMetadataAnalysisCard';

const classes = {
  card: `${PREFIX}-card`,
  title: `${PREFIX}-title`,
  alert: `${PREFIX}-alert`,
  chip: `${PREFIX}-chip`,
  titleBox: `${PREFIX}-titleBox`
};

const StylesAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}))

const StyledCard = styled(Card)(({
    theme
  }
) => ({
  [`& .${classes.card}`]: {
    marginBottom: theme.spacing(2),
  },

  [`& .${classes.title}`]: {
    marginBottom: theme.spacing(2),
  },

  [`& .${classes.chip}`]: {
    marginLeft: 'auto',
  },

  [`& .${classes.titleBox}`]: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  }
}));

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

const countBy = (arr: any[] | undefined, prop: string) => {
  if (arr === undefined || arr.length === 0) {
    return {}
  }

  return arr.reduce(
      (prev: any, curr: any) => ((prev[curr[prop]] = ++prev[curr[prop]] || 1), prev),
      {},
  );
}


export interface OpaMetadataAnalysisCardProps {
  title?: string;
  // Select how the card looks like
  variant?: OpaMetadataAnalysisCard;
}

export const OpaMetadataAnalysisCard = (
  props: OpaMetadataAnalysisCardProps,
) => {

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

  switch (props.variant) {
    case 'compact': {
      return renderCompactCard(props, opaResults)
    }
    default: {
      return renderDefaultCard(props, opaResults)
    }
  }
};

const renderDefaultCard = (props: OpaMetadataAnalysisCardProps, results: OpaResult | null) => {
  const passStatus = useMemo(
      () => getPassStatus(results?.result),
      [results],
  );

  let chipColor: 'warning' | 'error' | 'success';
  switch (passStatus) {
    case 'FAIL':
      chipColor = 'error';
      break;
    case 'PASS':
      chipColor = 'success';
      break;
    default:
      chipColor = 'warning';
  }

  return (
      <StyledCard>
        <CardContent>
          <div className={classes.titleBox}>
            <Typography variant="h6">{props.title}</Typography>
            {results?.result && (
                <Chip
                    label={passStatus}
                    color={chipColor}
                    className={classes.chip}
                />
            )}
          </div>
          {renderCardContent(results)}
        </CardContent>
      </StyledCard>
  );

}

const renderCompactCard = (props: OpaMetadataAnalysisCardProps, results: OpaResult | null) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const count = countBy(results?.result, 'level')

  return (
      <Accordion>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
        >
          <Box sx={{ display: isMobile ? "block": "flex", alignItems:"center", gridColumnGap:20 }}>
            <Typography variant="h6">{props.title}</Typography>
            {count['error'] > 0 &&
              <Fab variant="extended" size="small" color="error">
                <ErrorIcon sx={{ mr: 1 }}/>{count['error']} Errors
              </Fab>
            }
            {count['warning'] > 0 &&
              <Fab variant="extended" size="small" color="warning" >
                <WarningIcon sx={{ mr: 1 }}/> {count['warning']} Warnings
              </Fab>
            }
            {count['info'] > 0 &&
              <Fab variant="extended" size="small">
                <InfoIcon sx={{ mr: 1 }}/> {count['info']} Infos
              </Fab>
            }
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
      <StylesAlert
          severity={violation.level}
          key={violation.id ?? ++violationId}
          className={classes.alert}
      >
        {violation.message}
      </StylesAlert>
  ));
};

OpaMetadataAnalysisCard.defaultProps = {
  title: 'OPA Entity Checker',
}
