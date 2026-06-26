"""
Gemini 2.5 Flash streaming generator via LangChain.
Pluggable: swap the provider by changing the ChatModel instantiation.
"""
from collections.abc import AsyncGenerator
from functools import lru_cache

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings
from app.core.exceptions import LLMError
from app.core.logging import get_logger
from app.rag.prompts.rag_prompt import build_title_prompt

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=0.2,
        max_output_tokens=4096,
        streaming=True,
    )


def _to_langchain_messages(messages: list[dict]):
    """Convert OpenAI-style role/content dicts to LangChain message objects."""
    lc_messages = []
    for m in messages:
        role, content = m["role"], m["content"]
        if role == "system":
            lc_messages.append(SystemMessage(content=content))
        elif role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_messages.append(AIMessage(content=content))
    return lc_messages


async def stream_response(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    Stream token deltas from Gemini.
    Yields string chunks as they arrive.
    """
    llm = get_llm()
    lc_messages = _to_langchain_messages(messages)

    try:
        async for chunk in llm.astream(lc_messages):
            if chunk.content:
                yield str(chunk.content)
    except Exception as e:
        logger.error("llm_stream_error", error=str(e))
        raise LLMError(f"LLM streaming failed: {e}") from e


async def generate_title(first_message: str) -> str:
    """Generate a short session title from the first user message."""
    llm = get_llm()
    prompt = build_title_prompt(first_message)
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return str(response.content).strip()[:100]
    except Exception as e:
        logger.warning("title_generation_failed", error=str(e))
        return first_message[:60]
