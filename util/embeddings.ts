import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

export const createEmbeddingsFromFile = async (file: Blob) => {
  const loader = new WebPDFLoader(file);
  const rawDocs = await loader.load();

  // Split the PDF documents into smaller chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: Number(1000),
    chunkOverlap: Number(20),
  });

  const docs = await textSplitter.splitDocuments(rawDocs);

  //   const embeddings = new OpenAIEmbeddings({
  //     openAIApiKey: OPENAI_KEY as string,
  //   });

  console.log(docs);
};
