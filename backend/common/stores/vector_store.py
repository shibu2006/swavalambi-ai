"""
vector_store.py — Abstract interface for vector storage and search.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any

class VectorStore(ABC):
    """Abstract base class for vector storage providers."""
    
    @abstractmethod
    def create_index(self, index_name: str, dimension: int) -> None:
        """Create vector index."""
        pass
    
    @abstractmethod
    def index_document(self, index_name: str, doc_id: str, embedding: List[float], metadata: Dict[str, Any]) -> None:
        """Index a document with its embedding."""
        pass
    
    @abstractmethod
    def search(self, index_name: str, query_embedding: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Search for similar vectors."""
        pass
    
    @abstractmethod
    def delete_index(self, index_name: str) -> None:
        """Delete an index."""
        pass
    
    @abstractmethod
    def get_store_name(self) -> str:
        """Return store name."""
        pass
