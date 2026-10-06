import React, {type ReactNode} from 'react';
import Admonition from '@theme/Admonition';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof ContentType>;

// Every spec page is a draft: this banner is injected above the rendered
// content of every doc page, rather than baked into the (submodule-sourced)
// markdown files, so it survives resyncing specification/ content and never
// needs to be duplicated per file.
export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <Admonition type="caution" title="Draft specification — subject to change." />
      <Content {...props} />
    </>
  );
}
