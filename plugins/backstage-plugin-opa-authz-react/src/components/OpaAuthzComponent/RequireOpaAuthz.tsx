import { ReactNode } from 'react';
import { PolicyInput } from '@parsifal-m/backstage-plugin-opa-common';
import { useOpaAuthz } from '../../hooks/useOpaAuthz/useOpaAuthz';

interface RequireOpaAuthzProps {
  input: PolicyInput;
  entryPoint: string;
  options?: {
    includeUserEntity?: boolean;
  };
  errorPage?: ReactNode;
  children: ReactNode;
}

export function RequireOpaAuthz(
  props: Readonly<RequireOpaAuthzProps>,
): React.JSX.Element | null {
  const { input, entryPoint, options } = props;

  const { loading, data, error } = useOpaAuthz(input, entryPoint, options);

  if (loading || error || !data?.result.allow) {
    return null;
  }

  return <>{props.children}</>;
}
