import { OpaMetadataEntityResult } from '../api/types';

/**
 * Determines the overall pass status based on the levels of checks provided.
 *
 * @param checks - An array of `OpaMetadataEntityResult` objects representing the checks to evaluate.
 *                 Each check contains a `level` property which can be one of the following:
 *                 - 'error': Indicates a critical issue.
 *                 - 'warning': Indicates a non-critical issue.
 *                 - 'info': Provides informational messages.
 *                 - 'success': Indicates a successful check.
 *
 * @returns A string representing the overall status:
 *          - 'ERROR': If there is at least one check with the level 'error'.
 *          - 'WARNING': If there are no errors but at least one check with the level 'warning'.
 *          - 'INFO': If there are no errors or warnings but at least one check with the level 'info'.
 *          - 'SUCCESS': If there are no errors, warnings, or infos but at least one check with the level 'success'.
 *          - 'PASS': If there are no errors, warnings, or infos, and only successes or no checks at all.
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
