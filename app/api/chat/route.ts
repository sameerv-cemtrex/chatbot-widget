import { NextResponse } from "next/server";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getPineconeClient } from "@/util/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { makeChain } from "@/util/makechain";

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

export async function POST(req: Request) {
  console.log("chat init");
  const body = await req.json();
  const { question, history } = body;
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  try {
    const client = await getPineconeClient();
    const index = await client.Index("testchatbot");

    const vectorstore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: OPENAI_KEY as string,
      }),
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
  } catch (err) {
    throw new Error("something went wrong ");
  }
}
