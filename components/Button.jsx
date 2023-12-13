"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";

const Button = () => {
  const [que, setQue] = useState("");
  const { mutate, isLoading } = useMutation({
    mutationFn: async (que) => {
      const postQuestion = await fetch("/api/crawl", {
        method: "POST",
        body: JSON.stringify({ url: que }),
      });

      const res = await postQuestion.json();

      return res;
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return (
    <>
      <input
        type="text"
        value={que}
        placeholder="Enter url to crawl"
        onChange={(e) => setQue(e.target.value)}
        className="border border-gray-300 p-3 bg-transparent"
      />
      <button
        type="button"
        onClick={() => {
          mutate(que);
        }}
        className="bg-red-500 p-2 "
      >
        post que
      </button>
    </>
  );
};

export default Button;
