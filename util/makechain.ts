import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";

const CONDENSE_PROMPT = `Given the chat history and a follow-up question, rephrase the follow-up question to be a standalone question that encompasses all necessary context from the chat history.

Chat History:
{chat_history}

Follow-up input: {question}

Make sure your standalone question is self-contained, clear, and specific. Rephrased standalone question:`;

// --------------------------------------------------

const QA_PROMPT = `You are an intelligent AI assistant that works for CXR Agency, designed to interpret and answer questions and instructions based on specific provided documents. The context from these documents has been processed and made accessible to you. 

Your mission is to converse with people by generating answers that are accurate, succinct, and comprehensive, drawing upon the information contained in the context of the documents. If the answer isn't readily found in the documents, you should make use of your training data and understood context to infer and provide the most plausible response.

You are also capable of evaluating, comparing and providing opinions based on the content of these documents as a representative of the company. Hence, if asked information about CXR Agency, use your AI understanding to deliver an insightful response. Try to hold a conversation with the user and be friendly. 

If the query isn't related to the document context or you dont have the sufficient data to reply, kindly inform the user that your don't have sufficient information for the question and provide the Contact details from the document and context to user. Be polite and try to exchange greetings too, like welcoming a thanks from the user.

When asked about the company partners you can share names and data related to them too.

Here is the context from the documents:

Context: {context}

Here is the user's question:

Question: {question}

Provide your response in markdown format.`;

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

// Creates a ConversationalRetrievalQAChain object that uses an OpenAI model and a PineconeStore vectorstore
export const makeChain = (
  vectorstore: PineconeStore
  //   returnSourceDocuments: boolean,
  //   modelTemperature: number
) => {
  const model = new OpenAI({
    temperature: 0.9, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    openAIApiKey: OPENAI_KEY,
  });

  // Configures the chain to use the QA_PROMPT and CONDENSE_PROMPT prompts and to not return the source documents
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true,
    }
  );
  return chain;
};
