"use client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
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
            className="border border-dotted rounded-lg p-6 w-[30vw] text-xl"
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
      {isPending && <Loader2 className="animate-spin text-emerald-500" />}

      {isSuccess && (
        <div>
          <CheckCircle color="green" />
          <p className="text-green-400">Pdf uploaded.</p>
        </div>
      )}
    </div>
  );
};

export default DropInput;
