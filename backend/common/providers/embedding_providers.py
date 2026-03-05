"""
embedding_providers.py — Concrete implementations of embedding providers.
"""

import logging
from typing import List
from .embedding_provider import EmbeddingProvider

logger = logging.getLogger(__name__)


class AzureOpenAIEmbeddingProvider(EmbeddingProvider):
    """Azure OpenAI embedding provider."""
    
    def __init__(self, api_key: str, endpoint: str, deployment_name: str, api_version: str = "2023-03-15-preview"):
        try:
            from openai import AzureOpenAI
            self.client = AzureOpenAI(
                api_key=api_key,
                api_version=api_version,
                azure_endpoint=endpoint
            )
            self.deployment_name = deployment_name
            self._dimension = 1536  # text-embedding-3-small with 1536 dimensions
        except ImportError:
            raise ImportError("openai package required. Install: pip install openai")
    
    def generate_embedding(self, text: str) -> List[float]:
        response = self.client.embeddings.create(
            input=text,
            model=self.deployment_name
        )
        return response.data[0].embedding
    
    def get_dimension(self) -> int:
        return self._dimension
    
    def get_provider_name(self) -> str:
        return f"AzureOpenAI-{self.deployment_name}"
