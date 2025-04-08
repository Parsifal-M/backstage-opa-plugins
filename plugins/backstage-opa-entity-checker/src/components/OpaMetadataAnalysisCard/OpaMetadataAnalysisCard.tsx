import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ApiHolder, alertApiRef, useApi } from '@backstage/core-plugin-api';
import { opaApiRef } from '../../api';
import { OpaMetadataEntityResult, OpaEntityResult } from '../../api/types';
import { getPassStatus } from '../../utils/getPassStatus';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StylesAlert } from '../StyledAlert';
import { StyledCard, classes } from '../StyledCard';
import { Entity } from '@backstage/catalog-model/index';
import { StatusChip } from '../StatusChip';

/**
 * Props interface for the OpaMetadataAnalysisCard component.
 *
 * @interface OpaMetadataAnalysisCardProps
 * @property {string} [title] - Optional title to display on the card.
 * @property {MetadataAnalysisCardVariants} [variant] - Can be one of the following: 'default', 'compact'.
 * @property {string | React.ReactNode} [children] - Optional content to render inside the card.
 */
export interface OpaMetadataAnalysisCardProps {
  title?: string;
  children?: string | React.ReactNode;
  variant?: 'default' | 'compact';
  showCheckTitle?: boolean;
  showUrls?: boolean;
}

type CardProps = Omit<OpaMetadataAnalysisCardProps, 'variant'>;

/**
 * Returns true if the given entity has any validation errors
 *
 * @public
 */
export async function hasOPAValidationErrors(
  entity: Entity,
  context: { apis: ApiHolder },
) {
  const opaApi = context.apis.get(opaApiRef);
  if (!opaApi) {
    throw new Error(
      `No implementation available for ${JSON.stringify(opaApiRef)}`,
    );
  }

  const results = await opaApi.entityCheck(entity);
  return getPassStatus(results.result) !== 'PASS';
}

const countBy = (arr: any[] | undefined, prop: string) => {
  if (arr === undefined || arr.length === 0) {
    return {};
  }

  return arr.reduce((prev: any, curr: any) => {
    prev[curr[prop]] = ++prev[curr[prop]] || 1;
    return prev;
  }, {});
};

const renderCardContent = (
  results: OpaEntityResult | null | undefined,
  showCheckTitle: boolean,
  showUrls: boolean,
) => {
  let violationId = 0;

  if (!results) {
    return (
      <Typography>
        OPA did not return any results for this entity. Please make sure you are
        using the correct OPA package name.
      </Typography>
    );
  }

  if (!results?.result?.length) {
    return <Typography>No issues found!</Typography>;
  }

  return results.result.map((violation: OpaMetadataEntityResult) => (
    <StylesAlert
      severity={violation.level}
      key={violation.id ?? ++violationId}
      className={classes.alert}
      onClick={() => {
        if (showUrls && violation.url) {
          window.open(violation.url, '_blank');
        }
      }}
      sx={{
        cursor: showUrls && violation.url ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: showUrls && violation.url ? 'translateY(-2px)' : 'none',
          boxShadow:
            showUrls && violation.url ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
        },
      }}
    >
      <>
        {showCheckTitle && violation.check_title && (
          <Typography
            variant="h6"
            sx={{
              mt: -1,
            }}
          >
            {violation.check_title}
          </Typography>
        )}
        <Typography variant="body2">{violation.message}</Typography>
      </>
      {violation.decisionId && (
        <Typography variant="caption">
          Decision ID: {violation.decisionId}
        </Typography>
      )}
    </StylesAlert>
  ));
};

const DefaultCard = ({
  title = 'OPA Metadata Analysis',
  children,
  results,
  showCheckTitle = false,
  showUrls = false,
}: CardProps & { results: OpaEntityResult | null }) => {
  const passStatus = useMemo(() => getPassStatus(results?.result), [results]);

  let chipColor: 'warning' | 'error' | 'success' | 'info';
  switch (passStatus) {
    case 'ERROR':
      chipColor = 'error';
      break;
    case 'PASS':
      chipColor = 'success';
      break;
    case 'INFO':
      chipColor = 'info';
      break;
    default:
      chipColor = 'warning';
      break;
  }

  return (
    <StyledCard>
      <CardContent>
        <div className={classes.titleBox}>
          <Typography variant="h6">{title}</Typography>
          {results?.result && (
            <Chip
              label={passStatus}
              color={chipColor}
              className={classes.chip}
            />
          )}
        </div>
        {children}
        {renderCardContent(results, showCheckTitle, showUrls)}
      </CardContent>
    </StyledCard>
  );
};

const CompactCard = ({
  title = 'OPA Metadata Analysis',
  children,
  results,
  showCheckTitle = false,
  showUrls = false,
}: CardProps & { results: OpaEntityResult | null }) => {
  const count = countBy(results?.result, 'level');

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gridColumnGap: 20 }}>
          <Typography variant="h6">
            {title ?? 'OPA Metadata Analysis'}
          </Typography>
          <StatusChip count={count.error || 0} type="error" />
          <StatusChip count={count.warning || 0} type="warning" />
          <StatusChip count={count.info || 0} type="info" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        <Box sx={{ flexGrow: 1 }}>
          {renderCardContent(results, showCheckTitle, showUrls)}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const OpaMetadataAnalysisCard = (
  props: OpaMetadataAnalysisCardProps,
) => {
  const { entity } = useEntity();
  const opaApi = useApi(opaApiRef);
  const [opaResults, setOpaResults] = useState<OpaEntityResult | null>(null);
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

  if (props.variant === 'compact') {
    return <CompactCard {...props} results={opaResults} />;
  }
  return <DefaultCard {...props} results={opaResults} />;
};
