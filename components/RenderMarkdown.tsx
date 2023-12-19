import React from "react";
import Markdown from "react-markdown";

const RenderMarkdown = ({ mdString }: { mdString: string }) => {
  return <Markdown>{mdString}</Markdown>;
};

export default RenderMarkdown;
