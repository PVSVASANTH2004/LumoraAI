"""
System and user prompt templates for the RAG pipeline.
"""
from app.rag.retriever.chroma_retriever import RetrievedChunk

SYSTEM_PROMPT = """You are Lumora AI, an expert document analysis assistant.

You are given retrieved passages from one or more documents. Your job is to answer the user's question accurately and completely using those passages.

Rules:
1. SYNTHESIZE across all passages — do not stop at the first relevant chunk. Combine information from multiple passages when needed.
2. CALCULATIONS: If the answer requires arithmetic (percentages, totals, averages), perform it step by step and show your work.
3. TIMELINE REASONING: If the question asks what happened first or involves dates, compare dates explicitly (e.g. "April 14 comes before June 9, therefore X happened first").
4. AGGREGATION: If the question asks to "list all", "summarize every", or "compare", scan ALL passages and compile a complete answer — do not stop after finding one example.
5. INFERENCE: You may draw logical conclusions from the context. If the answer is implied but not stated verbatim, reason it out and flag it as an inference.
6. CITATIONS: Cite every factual claim with [Source N] where N matches the passage number.
7. FORMAT: Use markdown — **bold** key terms, bullet lists for enumerations, tables for comparisons.
8. LAST RESORT: Only say information is unavailable if it genuinely cannot be found or inferred from ANY passage after careful review. Never refuse a question answerable by combining passages."""


def build_rag_prompt(
    query: str,
    chunks: list[RetrievedChunk],
    conversation_history: list[dict] | None = None,
) -> list[dict]:
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(
            f"[Source {i}] Document: {chunk.doc_id} | Page: {chunk.page_number} | "
            f"Relevance: {chunk.score:.2f}\n{chunk.text}"
        )
    context_block = "\n\n---\n\n".join(context_parts)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if conversation_history:
        for msg in conversation_history[-6:]:
            if msg.get("role") in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    # Detect query type to give the model the right framing
    q_lower = query.lower()
    is_broad = any(w in q_lower for w in [
        "summarize", "summary", "all", "every", "list", "compare",
        "overview", "total", "how many", "count", "history", "timeline",
        "throughout", "across", "replace", "replaced", "migration",
    ])
    is_math = any(w in q_lower for w in [
        "percent", "%", "half", "total", "average", "sum", "how much",
        "budget", "cost", "calculate",
    ])
    is_temporal = any(w in q_lower for w in [
        "first", "last", "before", "after", "when", "earliest", "latest",
        "which came", "order", "sequence",
    ])

    extra_instructions = []
    if is_broad:
        extra_instructions.append(
            f"This is a broad question — scan ALL {len(chunks)} passages and compile a complete answer."
        )
    if is_math:
        extra_instructions.append(
            "This question requires calculation — show your arithmetic step by step."
        )
    if is_temporal:
        extra_instructions.append(
            "This question involves time order — compare dates explicitly before answering."
        )

    instruction_block = ""
    if extra_instructions:
        instruction_block = "\n\nSpecific guidance:\n" + "\n".join(f"- {i}" for i in extra_instructions)

    user_content = f"""Retrieved context ({len(chunks)} passages):

{context_block}

---

Question: {query}{instruction_block}

Answer using the passages above. Cite each claim with [Source N]."""

    messages.append({"role": "user", "content": user_content})
    return messages


def build_title_prompt(first_message: str) -> str:
    return (
        f"Generate a concise 4-6 word title for a conversation starting with this question: "
        f'"{first_message[:200]}". Return ONLY the title, no quotes or punctuation at the end.'
    )
