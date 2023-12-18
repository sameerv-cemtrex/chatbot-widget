import { NextResponse } from "next/server";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getPineconeClient } from "@/util/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { makeChain } from "@/util/makechain";
import { BaseMessage } from "langchain/schema";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { OpenAI } from "langchain/llms/openai";
import { StringOutputParser } from "langchain/schema/output_parser";

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

export async function POST(req: Request) {
  console.log("chat init");
  const body = await req.json();
  const { question, memory } = body;
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  try {
    const client = await getPineconeClient();
    const index = await client.Index("testchatbot");

    const openaiEmbeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_KEY as string,
    });

    const vectorstore = await PineconeStore.fromExistingIndex(
      openaiEmbeddings,
      {
        pineconeIndex: index,
        textKey: "text",
      }
    );
    const retriever = await vectorstore.asRetriever();

    const model = new OpenAI({
      openAIApiKey: OPENAI_KEY,
    });

    const SYSTEM_TEMPLATE = `
    You are an intelligent AI-based sales and marketing executive that works for CXR,Agency, designed to interpret and answer questions and instructions based on specific provided context. These context documents are available to you and you should base you primary knowledge on this information.
  Your objective is to converse with prospective clients of our agency and effectively generate answers to their questions that are accurate, succinct, and comprehensive, drawing upon the information contained in the context . If the direct answer isn't readily found in the context provided, you should make use of your training data and understood context to infer and provide the most plausible response.
  You are also capable of evaluating, comparing and providing opinions based on the content of the context as a representative of the company. Hence, if asked information about CXR,Agency, use your understanding to deliver an insightful, detailed and specific response. You must engage the prospective customer in a inviting and friendly manner while using an effective tone to drive inquiry from the prospect.
  When asked about company details, achievements, contributions, partners, or services search the context provided and be specific, share as many relevant details as possible from the context provided to you.
  If the query isn't related to the company or you don't have  sufficient data to reply, kindly inform the user that your don't have sufficient information for the question and provide the contact details for our agency from the context provided to you.
  When asked about the company partners you can share names and data related to them too.
  Although whenever the user asks about our clients consider the projects as well as Brands from the context as the clients itself and answer the query accordingly. 
  Here is the context from the documents: {context}

  Give your response in markdown format. 

    `;

    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate("{question}"),
    ];
    const prompt = ChatPromptTemplate.fromMessages(messages);

    const chain = RunnableSequence.from([
      {
        // Pipe the question through unchanged
        // question: (input: { question: string }) => input.question,
        // // Fetch the chat history, and return the history or null if not present
        // chatHistory: async () => {
        //   const savedMemory = await memory.loadMemoryVariables({});
        //   const hasHistory = savedMemory.chatHistory.length > 0;
        //   return hasHistory ? savedMemory.chatHistory : null;
        // },

        // Fetch relevant context based on the question
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
      //   performQuestionAnswering,
    ]);

    const response = await chain.invoke(sanitizedQuestion);

    return NextResponse.json({
      text: response,
      //   sourceDocuments: response.sourceDocuments,
    });
  } catch (err: any) {
    throw new Error("something went wrong ", err);
  }
}
