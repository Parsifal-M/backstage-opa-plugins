import Fab from '@mui/material/Fab';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import React from 'react';

type StatusType = 'error' | 'warning' | 'info';

export const StatusChip = ({
  count,
  type,
}: {
  count: number;
  type: StatusType;
}) => {
  if (count <= 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon sx={{ mr: 1 }} />;
      case 'warning':
        return <WarningIcon sx={{ mr: 1 }} />;
      case 'info':
        return <InfoIcon sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'error':
        return count === 1 ? '1 Error' : `${count} Errors`;
      case 'warning':
        return count === 1 ? '1 Warning' : `${count} Warnings`;
      case 'info':
        return count === 1 ? '1 Info' : `${count} Infos`;
      default:
        return null;
    }
  };

  return (
    <Fab variant="extended" size="small" color={type}>
      {getIcon()}
      {getLabel()}
    </Fab>
  );
};
