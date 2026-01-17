import { ReactNode } from 'react';
import { PolicyInput } from '@parsifal-m/backstage-plugin-opa-common';
import { useOpaAuthz } from '../../hooks/useOpaAuthz/useOpaAuthz';

interface RequireOpaAuthzProps {
  input: PolicyInput;
  entryPoint: string;
  errorPage?: ReactNode;
  children: ReactNode;
}

export function RequireOpaAuthz(
  props: Readonly<RequireOpaAuthzProps>,
): React.JSX.Element | null {
  const { input, entryPoint } = props;

  const { loading, data, error } = useOpaAuthz(input, entryPoint);

  if (loading || error || !data?.result.allow) {
    return null;
  }

  return <>{props.children}</>;
}
