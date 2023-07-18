// RunnerCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Chip } from '@material-ui/core';
import { Runner } from '../../types';

interface RunnerCardProps {
  runner: Runner;
}

export const RunnerCard = ({ runner }: RunnerCardProps) => {
  const getStatusChip = (status: string) => {
    let color: "primary" | "secondary" | "default" = "default";

    if (status === "online") {
      color = "primary";
    } else if (status === "offline") {
      color = "secondary";
    }

    return <Chip label={status} color={color} />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {runner.description}
        </Typography>
        <Typography color="textSecondary">
          ID: {runner.id}
        </Typography>
        <Typography color="textSecondary">
          IP Address: {runner.ip_address}
        </Typography>
        <Typography color="textSecondary">
          Runner Type: {runner.runner_type}
        </Typography>
        <Typography color="textSecondary">
          Status: {getStatusChip(runner.status)}
        </Typography>
        <Typography color="textSecondary">
          Online: {runner.online ? 'Yes' : 'No'}
        </Typography>
      </CardContent>
    </Card>
  );
};
