import { Annotation } from "@langchain/langgraph";

export const AgentState =
  Annotation.Root({

    prompt:
      Annotation(),

    conversationId:
      Annotation(),

    userId:
      Annotation(),

    agent:
      Annotation(),

    response:
      Annotation(),

    images:
      Annotation(),
    model:
      Annotation(),
    files:
      Annotation(),

    artifacts:
      Annotation(),

    searchResults:
      Annotation(),

    codeContext:
      Annotation(),

    pdfContext:
      Annotation(),

    clarificationMessage:
      Annotation(),

    requiresFreshSearch:
      Annotation(),
    parentMessageId:
      Annotation(),
    customInstructions:
      Annotation(),

    retryCount:
      Annotation({
        reducer: (x, y) => (y ?? x ?? 0),
        default: () => 0
      }),
    lastError:
      Annotation()

  });