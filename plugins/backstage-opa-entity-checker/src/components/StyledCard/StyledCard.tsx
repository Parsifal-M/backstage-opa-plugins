import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';

const PREFIX = 'OpaMetadataAnalysisCard';

export const classes = {
  card: `${PREFIX}-card`,
  title: `${PREFIX}-title`,
  alert: `${PREFIX}-alert`,
  chip: `${PREFIX}-chip`,
  titleBox: `${PREFIX}-titleBox`,
};

export const StyledCard = styled(Card)(({ theme }) => ({
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
  },
}));
