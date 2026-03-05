"""
embedding_provider.py — Abstract interface for embedding generation.
"""

from abc import ABC, abstractmethod
from typing import List

class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""
    
    @abstractmethod
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for given text."""
        pass
    
    @abstractmethod
    def get_dimension(self) -> int:
        """Return embedding dimension size."""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider name."""
        pass
