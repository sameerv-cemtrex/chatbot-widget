import { NextResponse } from "next/server";
// import Crawler from "crawler";

import { error } from "console";
import { Crawler, Page } from "@/util/crawler";
import { TokenTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
// import Crawler from "crawler";
import axios from "axios";
import cheerio from "cheerio";
import Bottleneck from "bottleneck";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getPineconeClient } from "@/util/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const nhm = new NodeHtmlMarkdown();

// The TextEncoder instance enc is created and its encode() method is called on the input string.
// The resulting Uint8Array is then sliced, and the TextDecoder instance decodes the sliced array in a single line of code.
const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

const limiter = new Bottleneck({
  minTime: 50,
});

const OPENAI_KEY = process.env.OPEN_AI_API_KEY;

export const POST = async (req: Request) => {
  const body = await req.json();
  const { url } = body;

  const response = await axios.get(url);
  const html = response.data;

  let pages = [];

  // Parse HTML content
  const $ = cheerio.load(html);
  $("script").remove();
  $("#hub-sidebar").remove();
  $("header").remove();
  $("nav").remove();
  $("img").remove();
  const title = $("title").text() || $(".article-title").text();
  const html2 = $("body").html();
  const text = nhm.translate(html2 as string);
  const page = {
    url: url,
    text,
    title,
  };

  //   Minimimum text length = 200
  if (text.length > 200) {
    pages.push(page);
  }

  //   function processElement(element) {
  //     // ... Your logic to extract data from the element ...
  //     // This could involve parsing text, extracting attributes, etc.
  //     const text = $(element).text().trim();
  //     const href = $(element).attr("href");
  //     // Add additional data extraction logic based on your needs
  //     return { text, href };
  //   }

  const documentCollection = await Promise.all(
    pages.map(async (row) => {
      const splitter = new TokenTextSplitter({
        encodingName: "gpt2",
        chunkSize: 300,
        chunkOverlap: 20,
      });

      const pageContent = row.text;

      const docs = splitter.splitDocuments([
        new Document({
          pageContent,
          metadata: {
            url: row.url,
            text: truncateStringByBytes(pageContent, 36000),
          },
        }),
      ]);
      return docs;
    })
  );

  // OpenAI embeddings for the document chunks
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_KEY as string,
  });

  const client = await getPineconeClient();
  const index = await client.Index("testchatbot");

  try {
    for (let doc of documentCollection) {
      // console.log(doc);
      await PineconeStore.fromDocuments(doc, embeddings, {
        pineconeIndex: index,
        textKey: "text",
      });
    }
  } catch (err) {
    console.log(err);
  }

  return NextResponse.json({ url });
};
