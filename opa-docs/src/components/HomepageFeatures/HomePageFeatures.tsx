import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

import { motion } from 'framer-motion';
import { ScrollText, Puzzle, Rocket } from 'lucide-react';

type FeatureItem = {
  title: string;
  icon: ReactNode;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Policy as Code',
    icon: <ScrollText size={32} />,
    description: (
      <>
        Integrate OPA's powerful policy-as-code capabilities directly into your
        Backstage instance.
      </>
    ),
  },
  {
    title: 'Seamless Integration',
    icon: <Puzzle size={32} />,
    description: (
      <>
        These plugins integrate smoothly with the Backstage ecosystem, providing
        a consistent experience.
      </>
    ),
  },
  {
    title: 'No Redeploying',
    icon: <Rocket size={32} />,
    description: (
      <>
        No need to redeploy Backstage when making policy changes! Decouple the
        application and update on the fly.
      </>
    ),
  },
];

function Feature({
  title,
  icon,
  description,
  delay,
}: FeatureItem & { delay: number }) {
  return (
    <div className={clsx('col col--4')}>
      <motion.div
        className={styles.featureCard}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5 }}
      >
        <div className="text--center">
          <div className={styles.featureIcon}>{icon}</div>
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
