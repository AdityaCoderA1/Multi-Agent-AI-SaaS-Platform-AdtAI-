import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore, getExistingVectorStore } from "../utils/vectorStore.js";
import {
    HumanMessage,
    SystemMessage,
    AIMessage
} from "@langchain/core/messages";

import { getModel } from "../utils/model.js";
import { getMemory } from "../utils/memory.js";
import { QdrantVectorStore } from "@langchain/qdrant";
export const pdfRagAgent = async (state) => {

    try {

        let allDocs = [];
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        if (state.files && state.files.length > 0) {
            for (const file of state.files) {
                if (file.mimetype === "application/pdf") {
                    const buffer = fs.readFileSync(file.path);
                    const pdf = new PDFParse(new Uint8Array(buffer));
                    const result = await pdf.getText();
                    const docs = await splitter.createDocuments([result.text]);
                    allDocs = [...allDocs, ...docs];
                }
            }
        }

        const collectionName = `conversation-${state.conversationId}`;

        let vectorStore;

        if (allDocs.length > 0) {
            vectorStore = await createVectorStore(
                collectionName,
                allDocs
            );
        } else {
            vectorStore = await getExistingVectorStore(
                collectionName
            );
        }

        const relevantDocs =
            await vectorStore.similaritySearch(

                state.prompt,

                5

            );
        console.log(relevantDocs);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
        const llm = getModel("pdf-rag");
        
        const history = await getMemory(state.conversationId, state.userId, state.parentMessageId);
        const historyMessages = history.map(msg => 
            msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );

        const messages = [
            new SystemMessage(`
You are an intelligent PDF Assistant.
Your primary role is to answer questions based on the uploaded PDF document.

Rules:
1. Try to answer the user's question using the provided Context.
2. If the user makes a conversational remark or asks a general question (e.g. "check it out", "summarize this"), provide a helpful response based on the PDF context.
3. If you truly cannot find any relevant information in the Context to answer a specific factual question, reply: "I couldn't find this information in the uploaded PDF."
4. Use Markdown formatting.
`),
            ...historyMessages,
            new HumanMessage(`
Context:
${context}

User Query:
${state.prompt}
`)
        ];


        const response =
            await llm.invoke(
                messages
            );


        return {

            ...state,

            docs: allDocs,

            response:
                response.content
        };





    }

    finally {
        if (state.files && state.files.length > 0) {
            for (const file of state.files) {
                try { fs.unlinkSync(file.path); } catch (e) { }
            }
        }
        // Do NOT delete the collection, we want to persist it for the conversation
    }
};