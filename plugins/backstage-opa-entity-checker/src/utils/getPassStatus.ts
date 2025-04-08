import { OpaMetadataEntityResult } from '../api/types';

/**
 * Determines the pass status based on the provided violations.
 *
 * @param violations - An array of `OpaMetadataEntityResult` objects representing
 * the violations. Each violation contains a `level` property which can be
 * 'error', 'warning', or 'info'. Defaults to an empty array if not provided.
 *
 * @returns A string representing the pass status:
 * - 'ERROR' if there are any violations with a level of 'error'.
 * - 'WARNING' if there are no errors but there are violations with a level of 'warning'.
 * - 'INFO' if there are no errors or warnings but there are violations with a level of 'info'.
 * - 'PASS' if there are no violations.
 */
export const getPassStatus = (checks: OpaMetadataEntityResult[] = []) => {
  const errors = checks.filter(c => c.level === 'error').length;
  const warnings = checks.filter(c => c.level === 'warning').length;
  const infos = checks.filter(c => c.level === 'info').length;
  const successes = checks.filter(c => c.level === 'success').length;

  if (errors > 0) {
    return 'ERROR';
  } else if (warnings > 0) {
    return 'WARNING';
  } else if (infos > 0) {
    return 'INFO';
  } else if (successes > 0) {
    return 'SUCCESS';
  }
  // If no errors, warnings, or infos, but only successes
  if (successes > 0 && errors === 0 && warnings === 0 && infos === 0) {
    return 'PASS';
  }
  return 'PASS';
};
