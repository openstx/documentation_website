import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const SPEC_SECTIONS = [
  {
    title: 'General Description',
    description: 'Cross-cutting concepts and primitives shared by all layers.',
    to: '/docs/spec-general/primitives',
  },
  {
    title: 'Core Services',
    description: 'Services provided by the OpenSTX Core layer.',
    to: '/docs/spec-core/introduction',
  },
  {
    title: 'RAL Services',
    description: 'Services provided by the Radio Abstraction Layer (RAL).',
    to: '/docs/spec-rail/introduction',
  },
  {
    title: 'Security',
    description: 'Frame security across the RAL and Core layers.',
    to: '/docs/spec-security/security-overview',
  },
  {
    title: 'Glossary',
    description: 'Centralized definitions of terms, concepts, and acronyms.',
    to: '/docs/glossary',
  },
];

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          OpenSTX Specification
        </Heading>
        <p className="hero__subtitle">
          OpenSTX is a Joint Development Foundation-hosted initiative to standardize
          Synchronous Transmission (STX) technology — a time-slotted,
          deterministic approach to wireless communication. This site hosts
          the draft technical specification developed by the OpenSTX working
          group.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/spec-general/primitives">
            Read the Specification
          </Link>
          <Link
            className="button button--outline button--lg"
            style={{color: '#eff6ff', borderColor: '#eff6ff'}}
            to="https://openstxfoundation.org/participate">
            Get Involved
          </Link>
        </div>
      </div>
    </header>
  );
}

function SpecificationSections() {
  return (
    <section className={styles.sections}>
      <div className="container">
        <Heading as="h2">Specification sections</Heading>
        <div className={styles.sectionGrid}>
          {SPEC_SECTIONS.map((section) => (
            <Link key={section.to} className={styles.sectionCard} to={section.to}>
              <Heading as="h3">{section.title}</Heading>
              <p>{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Specification"
      description="Draft specification for Synchronous Transmission (STX) technology, developed by the OpenSTX working group.">
      <HomepageHeader />
      <main>
        <SpecificationSections />
      </main>
    </Layout>
  );
}
