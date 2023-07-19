import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, makeStyles, Avatar, CardHeader, Collapse, CardActions, Divider, Grid, Paper, Button } from '@material-ui/core';
import { Job, Runner } from '../../types';
import { getRunnerJobs } from '../../api/fetchRunners';
import { formatDate } from '../utils/utils';


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

interface RunnerCardProps {
  runner: Runner;
}

export const RunnerCard = ({ runner }: RunnerCardProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const classes = useStyles();
  let chipClass = '';

  useEffect(() => {
    getRunnerJobs(runner.id).then(data => setJobs(data));
  }, [runner.id]);


  if (runner.online) {
    chipClass = classes.online;
  } else if (runner.status === 'stale') {
    chipClass = classes.stale;
  } else {
    chipClass = classes.offline;
  }

  interface DataFieldProps {
    label: string;
    value: string | number;
  }

  const DataField = ({ label, value }: DataFieldProps) => {
    return (
      <React.Fragment>
        <Grid item xs={4}>
          <Typography variant="subtitle1">{label}:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body1" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{value}</Typography>
        </Grid>
      </React.Fragment>
    );
  }


  const handleExpandClick = (section: string) => {
    setExpanded(prev => prev === section ? null : section);
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Avatar aria-label="runner-status" className={chipClass}>
            {runner.online ? 'O' : 'X'}
          </Avatar>
        }
        title={runner.description}
        subheader={`ID: ${runner.id}`}
      />

      <CardContent>
        <Typography color="textSecondary">
          IP Address: {runner.ip_address}
        </Typography>
        <Typography color="textSecondary">
          Online: {runner.online ? 'Yes' : 'No'}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Button size="small" onClick={() => handleExpandClick('jobs')}>
          Jobs
        </Button>
        <Button size="small" onClick={() => handleExpandClick('pipelines')}>
          Pipelines
        </Button>
        <Button size="small" onClick={() => handleExpandClick('projects')}>
          Projects
        </Button>
      </CardActions>
      <Collapse in={expanded === 'jobs'} timeout="auto" unmountOnExit>
        <CardContent>
          {jobs && jobs.length > 0 && jobs.slice(-5).map(job => (
            <Paper elevation={2} key={job.id} style={{ margin: '10px 0', padding: '10px' }}>
              <Typography variant="h6" style={{ marginBottom: '10px' }}>Job ID: {job.id}</Typography>
              <Divider variant="middle" style={{ marginBottom: '10px' }} />
              <Grid container spacing={1}>
                <DataField label="Status" value={job.status} />
                <DataField label="Stage" value={job.stage} />
                <DataField label="Name" value={job.name} />
                <DataField label="Created At" value={formatDate(job.created_at)} />
                <DataField label="Started At" value={formatDate(job.started_at)} />
                <DataField label="Finished At" value={formatDate(job.finished_at)} />
                <DataField label="Duration" value={job.duration} />
              </Grid>
            </Paper>
          ))}
        </CardContent>
      </Collapse>
      <Collapse in={expanded === 'pipelines'} timeout="auto" unmountOnExit>
        {jobs && jobs.length > 0 && jobs.slice(-5).map(job => (
          <Paper elevation={2} key={job.pipeline.id} style={{ margin: '10px 0', padding: '10px' }}>
            <Typography variant="h6" style={{ marginBottom: '10px' }}>Pipeline ID: {job.pipeline.id}</Typography>
            <Divider variant="middle" style={{ marginBottom: '10px' }} />
            <Grid container spacing={1}>
              <DataField label="ID" value={job.pipeline.id} />
              <DataField label="Ref" value={job.pipeline.ref} />
              <DataField label="Status" value={job.pipeline.status} />
            </Grid>
          </Paper>
        ))}
      </Collapse>
      <Collapse in={expanded === 'projects'} timeout="auto" unmountOnExit>
        {jobs && jobs.length > 0 && jobs.slice(-5).map(job => (
          <Paper elevation={2} key={job.project.id} style={{ margin: '10px 0', padding: '10px' }}>
            <Typography variant="h6" style={{ marginBottom: '10px' }}>Project ID: {job.project.id}</Typography>
            <Divider variant="middle" style={{ marginBottom: '10px' }} />
            <Grid container spacing={1}>
              <DataField label="ID" value={job.project.id} />
              <DataField label="Name" value={job.project.name} />
              <DataField label="Path with Namespace" value={job.project.path_with_namespace} />
            </Grid>
          </Paper>
        ))}
      </Collapse>

    </Card>
  );
}
