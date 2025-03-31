import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Policy as Code',
    description: (
      <>
        Integrate OPA's powerful policy-as-code capabilities directly into your
        Backstage instance. No need to redeploy Backstage when creating or
        updating policies, simply update the Rego policies and they will be
        automatically applied.
      </>
    ),
  },
  {
    title: 'Seamless Integration',
    description: (
      <>
        These plugins integrate smoothly with the Backstage ecosystem, providing
        a consistent experience while adding powerful OPA functionality to your
        developer portal.
      </>
    ),
  },
  {
    title: 'Enhanced Governance',
    description: (
      <>
        Improve security and compliance with centralized policy management.
        Enforce standardization while maintaining flexibility for your
        engineering teams.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center"></div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
