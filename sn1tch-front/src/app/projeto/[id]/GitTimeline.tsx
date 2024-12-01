"use client";

import { Timeline } from "flowbite-react";

const GitTimeline = ({ combinedTimeline }: any) => {
  if (!combinedTimeline) {
    return null;
  }
  return (
    <Timeline>
      {combinedTimeline.map((entry: any, index: number) => {
        const date = new Date(entry.date);
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        };

        const localeDateString = date.toLocaleDateString(
          "pt-BR",
          options as any
        );

        return (
          <Timeline.Item key={index}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Time>{localeDateString}</Timeline.Time>
              <Timeline.Title>{entry.name}</Timeline.Title>
              <Timeline.Body style={{ maxWidth: "20vw" }}>
                Mensagem de commit: {entry.message}
              </Timeline.Body>
              <Timeline.Body>Email: {entry.email}</Timeline.Body>
            </Timeline.Content>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default GitTimeline;
