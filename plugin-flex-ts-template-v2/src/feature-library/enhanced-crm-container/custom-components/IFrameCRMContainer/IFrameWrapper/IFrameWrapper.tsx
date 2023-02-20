import React, { useState, useRef } from 'react';
import * as Flex from '@twilio/flex-ui';

import { wrapperStyle, frameStyle, IFrameRefreshButtonStyledDiv } from './IFrameWrapperStyles'

export interface Props {
  thisTask: Flex.ITask, // task assigned to iframe
  task: Flex.ITask // task in Context
  baseUrl: string
}

export const IFrameWrapper = ({thisTask, task, baseUrl}: Props) => {

  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const [iFrameKey, setIframeKey] = useState(0 as number);

  const handleOnClick = (event: any) => {
    setIframeKey(Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1)));
  }

  // This allows short-lived tasks (e.g. callback tasks) to share/show
  // the same iframe as their parent task so CRM work can continue after
  // the short-lived task completes and disappears
  const visibility = (
    task?.taskSid === thisTask.taskSid ||
    task?.attributes?.parentTask === thisTask.sid
  ) ? 'visible' : 'hidden' as any;

  const url = thisTask?.attributes?.case_id
    ? `${baseUrl}?ticket_id=${thisTask.attributes.case_id}&iframe=true`
    : `${baseUrl}?iframe=true`;

  return (
    <div style={{ ...wrapperStyle, visibility }}>
      <IFrameRefreshButtonStyledDiv
        onClick={handleOnClick}
      >
        <Flex.IconButton variant="primary" icon="Loading" />
      </IFrameRefreshButtonStyledDiv>
      <iframe
        key={iFrameKey}
        style={frameStyle}
        src={url}
        ref={iFrameRef}
      />
    </div>
  );
}
