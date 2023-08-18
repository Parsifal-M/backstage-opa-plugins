import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Avatar,
  CardHeader,
  Collapse,
  CardActions,
  Divider,
  Grid,
  Paper,
  Button,
  Link,
  Box,
} from '@material-ui/core';
import { Job, RunnerDetails } from '../../types';
import { getRunnerDetails, getRunnerJobs } from '../../api/fetchRunners';
import { formatDate } from '../utils/utils';
import { RunnerCardProps } from './types';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    transition: 'box-shadow 0.3s',
    '&:hover': {
      boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
    },
  },
  chip: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
  },
  online: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
  offline: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  stale: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
  title: {
    fontWeight: 500,
    fontSize: '1.125rem',
    marginBottom: theme.spacing(1),
  },
}));

export const RunnerCard = ({ runner }: RunnerCardProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runnerDetails, setRunnerDetails] = useState<RunnerDetails | null>(
    null,
  );

  const classes = useStyles();
  let chipClass = '';

  if (runner.online) {
    chipClass = classes.online;
  } else if (runner.status === 'stale') {
    chipClass = classes.stale;
  } else {
    chipClass = classes.offline;
  }

  const DataField = ({
    label,
    value,
    url,
  }: {
    label: string;
    value: string | number;
    url?: string;
  }) => {
    return (
      <>
        <Grid item xs={4}>
          <Typography variant="subtitle1">{label}:</Typography>
        </Grid>
        <Grid item xs={8}>
          {url ? (
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <Typography
                variant="body1"
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              >
                {value}
              </Typography>
            </Link>
          ) : (
            <Typography
              variant="body1"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            >
              {value}
            </Typography>
          )}
        </Grid>
      </>
    );
  };

  const fetchData = (type: string) => {
    if (expanded !== type) {
      getRunnerJobs(runner.id).then(data => setJobs(data));
    }
  };

  const fetchRunnerDetails = async () => {
    const details = await getRunnerDetails(runner.id);
    setRunnerDetails(details);
  };

  const handleExpandClick = (section: string) => {
    setExpanded(prev => (prev === section ? null : section));
    if (section === 'info') {
      fetchRunnerDetails();
    } else {
      fetchData(section);
    }
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Avatar aria-label="runner-status" className={chipClass}>
            {runner.status === 'online' && 'O'}
            {runner.status === 'offline' && 'X'}
            {runner.status === 'stale' && 'S'}
          </Avatar>
        }
        title={runner.description}
        subheader={`ID: ${runner.id}`}
      />

      <CardContent>
        {/* <Typography color="textSecondary">
          Tags: {runner.tag_list?.join(', ')}
        </Typography> */}
      </CardContent>
      <CardActions disableSpacing>
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button
            size="small"
            onClick={() => handleExpandClick('jobs')}
            style={{ marginLeft: '10px' }}
          >
            Jobs
          </Button>
          <Button
            size="small"
            onClick={() => handleExpandClick('pipelines')}
            style={{ marginLeft: '10px' }}
          >
            Pipelines
          </Button>
          <Button
            size="small"
            onClick={() => handleExpandClick('projects')}
            style={{ marginLeft: '10px' }}
          >
            Projects
          </Button>
          <Button
            size="small"
            onClick={() => handleExpandClick('info')}
            style={{ marginLeft: '10px' }}
          >
            Info
          </Button>
        </Box>
      </CardActions>
      <Collapse in={expanded === 'jobs'} timeout="auto" unmountOnExit>
        <CardContent>
          {jobs &&
            jobs.length > 0 &&
            jobs.slice(-5).map(job => (
              <Paper
                elevation={2}
                key={job.id}
                style={{ margin: '10px 0', padding: '10px' }}
              >
                <Typography variant="h6" style={{ marginBottom: '10px' }}>
                  Job ID: {job.id}
                </Typography>
                <Divider variant="middle" style={{ marginBottom: '10px' }} />
                <Grid container spacing={1}>
                  <DataField label="Status" value={job.status} />
                  <DataField label="Stage" value={job.stage} />
                  <DataField label="Name" value={job.name} />
                  <DataField
                    label="Created At"
                    value={formatDate(job.created_at)}
                  />
                  <DataField
                    label="Started At"
                    value={formatDate(job.started_at)}
                  />
                  <DataField
                    label="Finished At"
                    value={formatDate(job.finished_at)}
                  />
                  <DataField label="Duration" value={job.duration} />
                </Grid>
              </Paper>
            ))}
        </CardContent>
      </Collapse>
      <Collapse in={expanded === 'pipelines'} timeout="auto" unmountOnExit>
        {jobs &&
          jobs.length > 0 &&
          jobs.slice(-5).map(job => (
            <Paper
              elevation={2}
              key={job.pipeline.id}
              style={{ margin: '10px 0', padding: '10px' }}
            >
              <Typography variant="h6" style={{ marginBottom: '10px' }}>
                Pipeline ID: {job.pipeline.id}
              </Typography>
              <Divider variant="middle" style={{ marginBottom: '10px' }} />
              <Grid container spacing={1}>
                <DataField
                  label="ID"
                  value={job.pipeline.id}
                  url={job.pipeline.web_url}
                />
                <DataField label="Ref" value={job.pipeline.ref} />
                <DataField label="Status" value={job.pipeline.status} />
              </Grid>
            </Paper>
          ))}
      </Collapse>
      <Collapse in={expanded === 'projects'} timeout="auto" unmountOnExit>
        {jobs &&
          jobs.length > 0 &&
          jobs.slice(-5).map(job => (
            <Paper
              elevation={2}
              key={job.project.id}
              style={{ margin: '10px 0', padding: '10px' }}
            >
              <Typography variant="h6" style={{ marginBottom: '10px' }}>
                Project ID: {job.project.id}
              </Typography>
              <Divider variant="middle" style={{ marginBottom: '10px' }} />
              <Grid container spacing={1}>
                <DataField label="ID" value={job.project.id} />
                <DataField label="Name" value={job.project.name} />
                <DataField
                  label="Path"
                  value={job.project.path_with_namespace}
                />
              </Grid>
            </Paper>
          ))}
      </Collapse>
      <Collapse in={expanded === 'info'} timeout="auto" unmountOnExit>
        <CardContent>
          {runnerDetails && (
            <Paper elevation={2} style={{ margin: '10px 0', padding: '10px' }}>
              <Typography variant="h6" style={{ marginBottom: '10px' }}>
                Runner Details
              </Typography>
              <Divider variant="middle" style={{ marginBottom: '10px' }} />
              <Grid container spacing={1}>
                <DataField
                  label="IP Address"
                  value={runnerDetails.ip_address}
                />
                <DataField
                  label="Active"
                  value={runnerDetails.active.toString()}
                />
                <DataField
                  label="Paused"
                  value={runnerDetails.paused.toString()}
                />
                <DataField
                  label="Contacted At"
                  value={formatDate(runnerDetails.contacted_at)}
                />
                <DataField
                  label="Description"
                  value={runnerDetails.description}
                />
                <DataField
                  label="Shared"
                  value={runnerDetails.is_shared.toString()}
                />
                <DataField label="Status" value={runnerDetails.status} />
                <DataField
                  label="Projects"
                  value={runnerDetails.projects
                    .map((project: { name: string }) => project.name)
                    .join(', ')}
                />
                <DataField
                  label="Tag Lists"
                  value={runnerDetails.tag_list.join(', ')}
                />
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};
