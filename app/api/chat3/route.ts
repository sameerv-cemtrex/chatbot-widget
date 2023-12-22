import { NextResponse } from "next/server";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getPineconeClient, getPineconeClient2 } from "@/util/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { makeChain } from "@/util/makechain";
import { Pin } from "lucide-react";

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX2;

export async function POST(req: Request) {
  console.log("chat init");
  const body = await req.json();
  const { question, history } = body;
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  try {
    const client = await getPineconeClient2();
    const index = await client.Index(PINECONE_INDEX as string);

    const openaiEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_KEY as string,
    });

    // const embeddings = await openaiEmbeddings.embedQuery(sanitizedQuestion);

    const vectorstore = await PineconeStore.fromExistingIndex(
      openaiEmbeddings,
      {
        pineconeIndex: index,
        textKey: "text",
      }
    );

    const chain = makeChain(vectorstore);

    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    return NextResponse.json({
      text: response.text,
      sourceDocuments: response.sourceDocuments,
    });
  } catch (err: any) {
    throw new Error("something went wrong ", err);
  }
}
