# CXR.Agency Chatbot

A chatbot that uses OpenAI's GPT-3.5 turbo model, to answer customer queries. The bot is trained over a dataset that comprises of various PDF files that contain information about the company, achievements, services and projects that the company has undertaken.


## Requirements

For this project you will need API keys from OpenAi and Pinecone.

<br>
<br>

## Setup

First clone this repo and make a copy of all the variables in `.env.example` into `.env.local` file, and fill the variables respectively.


Then, you can run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Here on this page you can upload the PDF files into the Database. Here vector embeddings will be created inserted in the Pincone DB.

Now you can redirect to the chat page - [http://localhost:3000/chat](http://localhost:3000/chat)

Here you can test the bot for answers.

Now Copy the loader.js file and upload on the CDN provider. The link to this file on the cloud will be your embedding link of the chatbot. You can now use this embedding link in any other project to use the chatbot.
