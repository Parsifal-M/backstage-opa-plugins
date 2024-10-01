import React, { ReactNode } from 'react';
import { PolicyInput } from '../../api/types';
import { useOpaAuthz } from '../../hooks';

interface OpaAuthzComponentProps {
  input: PolicyInput;
  entryPoint: string;
  errorPage?: ReactNode;
  children: ReactNode;
}

export function RequireOpaAuthz(
  props: Readonly<OpaAuthzComponentProps>,
): React.JSX.Element | null {
  const { input, entryPoint } = props;

  const { loading, allow, error } = useOpaAuthz(input, entryPoint);

  // Hide children elements if loading, error, or allow is not explicitly true
  if (loading || error || !allow || !allow.result || !allow.result.allow) {
    return null;
  }

  return <>{props.children}</>;
}