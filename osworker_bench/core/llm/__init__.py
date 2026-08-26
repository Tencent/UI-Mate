"""Injectable LLM transports.

    from core.llm import OpenAIClient
    agent = create_agent(name="ui_mate", llm_client=OpenAIClient())
"""
from core.llm.openai_client import OpenAIClient
from core.llm.protocol import GenParams, GenResult, LLMClient

__all__ = ["GenParams", "GenResult", "LLMClient", "OpenAIClient"]
