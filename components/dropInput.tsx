"use client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import Head from "next/head";
import React, { useState } from "react";
import Dropzone from "react-dropzone";

const DropInput = () => {
  const [files, setFiles] = useState<any>(null);
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (file: Blob) => {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/create-chat", {
        method: "POST",
        body: data,
      });
    },
  });
  return (
    <div>
      <Head>
        <meta property="og:title" content="File upload for the chatbot." />
        <meta property="og:image" content="botimage.png" />
        <meta property="og:type" content="summary" />
      </Head>
      <h2 className="text-lg mb-5 text-center">
        Add a file to the Chatbot Dataset
      </h2>
      <Dropzone
        onDrop={(acceptedFiles) => {
          const inputFile = acceptedFiles[0];
          console.log(inputFile);
          setFiles(acceptedFiles[0]);
          mutate(acceptedFiles[0]);
        }}
        multiple={false}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="border border-dotted border-gray-700 dark:border-gray-200 rounded-lg p-6 w-[30vw] text-xl"
          >
            <input {...getInputProps()} />
            <p className="text-center">Drop your file here</p>
            <p className="text-center text-sm">or</p>
            <p className="text-center text-blue-400 hover:text-blue-600 cursor-pointer">
              Browse
            </p>

            <p className="text-sm text-center m-3">{files?.name}</p>
          </div>
        )}
      </Dropzone>
      {isPending && <Loader2 className="animate-spin text-emerald-500 mt-5" />}

      {isSuccess && (
        <div className="mt-5">
          <CheckCircle color="green" />
          <p className="text-green-400">Pdf uploaded.</p>
        </div>
      )}
    </div>
  );
};

export default DropInput;
