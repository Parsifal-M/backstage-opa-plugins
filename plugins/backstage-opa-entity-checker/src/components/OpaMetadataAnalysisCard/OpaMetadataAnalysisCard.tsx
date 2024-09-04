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
        <StyledCard>
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
        </StyledCard>
      );
      break;
    }
  }
};

const renderCompactCard = (props: OpaMetadataAnalysisCardProps, results: OpaResult | null) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
