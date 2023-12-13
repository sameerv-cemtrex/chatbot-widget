import React from "react";
import Markdown from "react-markdown";

const RenderMarkdown = ({ mdString }: { mdString: string }) => {
  return (
    <div>
      <Markdown>{mdString}</Markdown>
    </div>
  );
};

export default RenderMarkdown;
