import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

const CONDENSE_PROMPT = `Given the chat history and a follow-up question, rephrase the follow-up question to be a standalone question that encompasses all necessary context from the chat history.

Chat History:
{chat_history}

Follow-up input: {question}

Make sure your standalone question is self-contained, clear, and specific. Rephrased standalone question:`;

// --------------------------------------------------

const QA_PROMPT = `You are an intelligent AI-based sales and marketing executive that works for CXR,Agency, designed to interpret and answer questions and instructions based on specific provided context. These context documents are available to you and you should base you primary knowledge on this information.
Your objective is to converse with prospective clients of our agency and effectively generate answers to their questions that are accurate, succinct, and comprehensive, drawing upon the information contained in the context . If the direct answer isn't readily found in the context provided, you should make use of your training data and understood context to infer and provide the most plausible response.
You are also capable of evaluating, comparing and providing opinions based on the content of the context as a representative of the company. Hence, if asked information about CXR,Agency, use your understanding to deliver an insightful, detailed and specific response. You must engage the prospective customer in a inviting and friendly manner while using an effective tone to drive inquiry from the prospect.
When asked about company details, achievements, contributions, partners, or services search the context provided and be specific, share as many relevant details as possible from the context provided to you.
If the query isn't related to the company or you don't have  sufficient data to reply, kindly inform the user that your don't have sufficient information for the question and provide the contact details for our agency from the context provided to you.
When asked about the company partners you can share names and data related to them too.
Although whenever the user asks about our clients consider the projects as well as Brands from the context as the clients itself and answer the query accordingly. 

You can reply the user in the language the question is asked. 
Here is the context from the documents:

Context: {context}

Here is the user's question:

Question: {question}

Provide your response in a readable markdown format with frequent breaks.`;

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

// Creates a ConversationalRetrievalQAChain object that uses an OpenAI model and a PineconeStore vectorstore
export const makeChain = (
  vectorstore: PineconeStore
  //   returnSourceDocuments: boolean,
  //   modelTemperature: number
) => {
  const model = new OpenAI({
    temperature: 0.5, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    openAIApiKey: OPENAI_KEY,
  });

  // Configures the chain to use the QA_PROMPT and CONDENSE_PROMPT prompts and to not return the source documents
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(2, { metadataField: "value" }),
    {
      memory: new BufferMemory({
        memoryKey: "chat_history",
        inputKey: "question", // The key for the input to the chain
        outputKey: "text", // The key for the final conversational output of the chain
        returnMessages: true, // If using with a chat model
      }),
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      // questionGeneratorChainOptions: {
      //   llm: questionModel,
      //   template: CONDENSE_PROMPT,
      // },
      returnSourceDocuments: true,
    }
  );
  return chain;
};
