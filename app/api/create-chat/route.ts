import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { FaissStore } from "langchain/vectorstores/faiss";
import fs from "fs";
import * as path from "path";
import { LocalIndex } from "vectra";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { NextResponse } from "next/server";
import { getPineconeClient } from "@/util/pinecone";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { TextLoader } from "langchain/document_loaders/fs/text";

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

export async function POST(req: Request) {
  console.log("indexing PDF..");
  const body = await req.blob();

  try {
    // const directoryLoader = new DirectoryLoader("public", {
    //   ".pdf": (path) => new PDFLoader(path),
    //   ".docx": (path) => new DocxLoader(path),
    //   ".txt": (path) => new TextLoader(path),
    // });
    const loader = new WebPDFLoader(body);

    const rawDocs = await loader.load();

    // Split the PDF documents into smaller chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: Number(1000),
      chunkOverlap: Number(20),
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    // OpenAI embeddings for the document chunks
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_KEY as string,
    });

    const client = await getPineconeClient();
    const index = await client.Index("testchatbot");
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return NextResponse.json({
      message: "pass",
    });
  } catch (error: any) {
    console.log("error", error);
    throw new Error("upload file failed");
  }
}
