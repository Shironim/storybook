import React, { FunctionComponent, ReactNode, ComponentProps } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { resetComponents } from '@storybook/components/html';
import { Story as PureStory } from '@storybook/components';
import { toId, storyNameFromExport } from '@storybook/csf';
import { CURRENT_SELECTION } from './types';

import { DocsContext, DocsContextProps } from './DocsContext';

export const storyBlockIdFromId = (storyId: string) => `story--${storyId}`;

type PureStoryProps = ComponentProps<typeof PureStory>;

interface CommonProps {
  height?: string;
  inline?: boolean;
}

type StoryDefProps = {
  name: string;
  children: ReactNode;
} & CommonProps;

type StoryRefProps = {
  id?: string;
} & CommonProps;

export type StoryProps = StoryDefProps | StoryRefProps;

const inferInlineStories = (framework: string): boolean => {
  switch (framework) {
    case 'react':
      return true;
    default:
      return false;
  }
};

export const lookupStoryId = (
  storyName: string,
  { mdxStoryNameToKey, mdxComponentMeta }: DocsContextProps
) =>
  toId(
    mdxComponentMeta.id || mdxComponentMeta.title,
    storyNameFromExport(mdxStoryNameToKey[storyName])
  );

export const getStoryProps = (props: StoryProps, context: DocsContextProps): PureStoryProps => {
  const { id } = props as StoryRefProps;
  const { name } = props as StoryDefProps;
  const inputId = id === CURRENT_SELECTION ? context.id : id;
  const previewId = inputId || lookupStoryId(name, context);
  const data = context.storyStore.fromId(previewId) || {};

  const { height, inline } = props;
  const { parameters = {}, docs = {} } = data;
  const { framework = null } = parameters;

  if (docs.disable) {
    return null;
  }

  // prefer props, then global options, then framework-inferred values
  const {
    inlineStories = inferInlineStories(framework),
    iframeHeight = undefined,
    prepareForInline = undefined,
  } = docs;
  const { storyFn = undefined, name: storyName = undefined } = data;

  const storyIsInline = typeof inline === 'boolean' ? inline : inlineStories;
  if (storyIsInline && !prepareForInline && framework !== 'react') {
    throw new Error(
      `Story '${storyName}' is set to render inline, but no 'prepareForInline' function is implemented in your docs configuration!`
    );
  }

  return {
    parameters,
    inline: storyIsInline,
    id: previewId,
    storyFn: prepareForInline && storyFn ? () => prepareForInline(storyFn) : storyFn,
    height: height || (storyIsInline ? undefined : iframeHeight),
    title: storyName,
  };
};

const Story: FunctionComponent<StoryProps> = (props) => (
  <DocsContext.Consumer>
    {(context) => {
      const storyProps = getStoryProps(props, context);
      if (!storyProps) {
        return null;
      }
      return (
        <div id={storyBlockIdFromId(storyProps.id)}>
          <MDXProvider components={resetComponents}>
            <PureStory {...storyProps} />
          </MDXProvider>
        </div>
      );
    }}
  </DocsContext.Consumer>
);

Story.defaultProps = {
  children: null,
  name: null,
};

export { Story };
