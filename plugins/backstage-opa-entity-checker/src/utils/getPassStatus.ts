import { EntityResult } from '../api/types';

export const getPassStatus = (violations: EntityResult[] = []) => {
  const errors = violations.filter(v => v.level === 'error').length;
  const warnings = violations.filter(v => v.level === 'warning').length;
  const infos = violations.filter(v => v.level === 'info').length;

  if (errors > 0) {
    return 'ERROR';
  } else if (warnings > 0) {
    return 'WARNING';
  } else if (infos > 0) {
    return 'INFO';
  }
  return 'PASS';
};
