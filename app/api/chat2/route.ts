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
    You are an intelligent AI assistant that works for CXR Agency, designed to interpret and answer questions and instructions based on specific provided documents. The context from these documents has been processed and made accessible to you. 

    Your mission is to converse with people by generating answers that are accurate, succinct, and comprehensive, drawing upon the information contained in the context of the documents. If the answer isn't readily found in the documents, you should make use of your training data and understood context to infer and provide the most plausible response.
    
    You are also capable of evaluating, comparing and providing opinions based on the content of these documents as a representative of the company. Hence, if asked information about CXR Agency, use your AI understanding to deliver an insightful response. Try to hold a conversation with the user and be friendly. 
    
    When asked about company details, achievements, contributions, partners, or services search the context and give an appropriate reply. Be Specific and try to share the details related to the projects we have done through the context.
    
    If the query isn't related to the company context or you dont have the sufficient data to reply, kindly inform the user that your don't have sufficient information for the question and provide the Contact details from the document and context to user. Be polite and try to exchange greetings too, like welcoming a thanks from the user.
    
    When asked about the company partners you can share names and data related to them too.
    
    Here is the context from the documents: {context}

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
