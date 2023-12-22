"use client";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpCircle, MessageSquare, MoreHorizontal, X } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import { Remarkable } from "remarkable";

type Message = {
  user: string;
  ai: string;
};

const ChatPage = () => {
  const [msgInput, setMsgInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([{ user: "", ai: "" }]);
  const md = new Remarkable("commonmark", {
    breaks: true,
    typographer: true,
  });

  const { mutate, isPending, status, isSuccess } = useMutation({
    mutationFn: async (que: String) => {
      const postQuestion = await fetch("/api/chat3", {
        method: "POST",
        body: JSON.stringify({ question: que }),
      });
      const res = await postQuestion.json();

      return res;
    },
    onSuccess(data, variables, context) {
      console.log(data);
      const msgs: Message[] = JSON.parse(
        localStorage.getItem("messages") as string
      );
      const lastMessage = msgs.splice(-1, 1)[0];

      localStorage.setItem(
        "messages",
        JSON.stringify([...msgs, { ai: data.text, user: lastMessage.user }])
      );
      setMsgInput("");
    },
  });

  useEffect(() => {
    if (typeof window != "undefined") {
      const msgs = localStorage.getItem("messages");
      if (!!msgs) {
        setMessages(JSON.parse(msgs));
      } else {
        let msg: Message = { user: "", ai: "Hi, how may I help you today?" };
        setMessages([msg]);
      }
    }
  }, [isSuccess, status]);

  return (
    <div className=" rounded-lg h-[450px] bg-slate-100 flex flex-col text-black">
      <div className="border-b py-3 px-4 w-full flex justify-between">
        <MessageSquare className="text-green-400" />
        <p className="text-black">CXR.Agency</p>
      </div>

      <div className="h-full w-full max-h-[345px] overflow-y-auto text-black  py-2 px-2 space-y-3 ">
        {messages.map((item, i) => (
          <Fragment key={i}>
            {item.user != "" && <div className="user">{item.user}</div>}
            {item.ai != "" && (
              <div
                className="ai"
                dangerouslySetInnerHTML={{
                  __html: md.render(item.ai.replaceAll(/\n\n/g, "<br><br>")),
                }}
              ></div>
            )}
          </Fragment>
        ))}
        {isPending && (
          <div className="ai">
            <MoreHorizontal className="animate-pulse text-gray-600" />
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (msgInput == "") {
            return;
          }
          mutate(msgInput);
          // setMessages([...messages, { user: msgInput, ai: "" }]);
          localStorage.setItem(
            "messages",
            JSON.stringify([...messages, { user: msgInput, ai: "" }])
          );
        }}
      >
        <div className="m-2 bg-white p-2 rounded-lg flex space-x-2">
          <input
            type="text"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            className="flex-1 text-xs px-1 focus:outline-none"
            placeholder="How can I use AR/VR for my work ..."
          />
          <button type="submit">
            <ArrowUpCircle className="text-green-600 cursor-pointer" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
