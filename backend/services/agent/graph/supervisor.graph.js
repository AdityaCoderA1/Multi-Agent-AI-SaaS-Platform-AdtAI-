import {
  StateGraph
}
  from "@langchain/langgraph";

import {
  AgentState
}
  from "./state.js";

import {
  routerNode
}
  from "./router.node.js";

import {
  evaluatorNode
}
  from "./evaluator.node.js";

import {
  chatAgent
}
  from "../agents/chat.agent.js";

import {
  codingAgent
}
  from "../agents/coding.agent.js";

import {
  searchAgent
}
  from "../agents/search.agent.js";

import {
  pdfAgent
}
  from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { imageAgent } from "../agents/imageGen.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { pdfRagAgent } from "../agents/pdfRag.agent.js";
import { readAgent } from "../agents/read.agent.js";

const workflow =
  new StateGraph(
    AgentState
  );

workflow.addNode(
  "router",
  routerNode
);

workflow.addNode(
  "evaluator",
  evaluatorNode
);

workflow.addNode(
  "chat",
  chatAgent
);

workflow.addNode(
  "coding",
  codingAgent
);

workflow.addNode(
  "search",
  searchAgent
);

workflow.addNode(
  "pdf",
  pdfAgent
);
workflow.addNode(
  "ppt",
  pptAgent
);
workflow.addNode(
  "image",
  imageAgent
);
workflow.addNode(
  "vision",
  visionAgent
);
workflow.addNode(
  "pdf_rag",
  pdfRagAgent
);
workflow.addNode(
  "read",
  readAgent
);
workflow.addEdge(
  "__start__",
  "router"
);

workflow.addConditionalEdges(

  "router",

  (state) => {

    switch (state.agent) {

      case "search":
        return "search";

      case "coding":
        return "coding";

      case "pdf":
        return "pdf";

      case "ppt":
        return "ppt";

      case "image":
        return "image";

      case "vision":
        return "vision";
      case "pdf_rag":
        return "pdf_rag";
      case "read":
        return "read";

      default:
        return "chat";

    }

  },

  {

    chat: "chat",

    search: "search",

    coding: "coding",

    pdf: "pdf",
    ppt: "ppt",
    image: "image",
    vision: "vision",
    pdf_rag: "pdf_rag",
    read: "read"

  }

);

workflow.addEdge(
  "coding",
  "evaluator"
);
workflow.addEdge(
  "image",
  "evaluator"
);

workflow.addEdge(
  "search",
  "chat"
);

workflow.addEdge(
  "pdf",
  "evaluator"
);
workflow.addEdge(
  "ppt",
  "evaluator"
);

workflow.addEdge(
  "chat",
  "evaluator"
);

workflow.addEdge(
  "vision",
  "evaluator"
);

workflow.addEdge(
  "pdf_rag",
  "evaluator"
);

workflow.addEdge(
  "read",
  "evaluator"
);

workflow.addConditionalEdges(
  "evaluator",
  (state) => {
    if (state.lastError) {
      return state.agent || "chat";
    }
    return "__end__";
  },
  {
    chat: "chat",
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    image: "image",
    vision: "vision",
    pdf_rag: "pdf_rag",
    read: "read",
    __end__: "__end__"
  }
);

export const graph =
  workflow.compile();