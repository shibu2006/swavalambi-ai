"""
base_agent.py — Base Agent for vector search with pluggable providers.
"""

import logging
from typing import Optional
from common.providers.embedding_provider import EmbeddingProvider
from common.stores.vector_store import VectorStore

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base AI Agent for vector search with pluggable embedding and vector store."""
    
    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        vector_store: VectorStore,
        index_name: str
    ):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.index_name = index_name
        
        logger.info(f"BaseAgent initialized with {embedding_provider.get_provider_name()} and {vector_store.get_store_name()}")
    
    def create_index(self):
        """Create vector index."""
        dimension = self.embedding_provider.get_dimension()
        self.vector_store.create_index(self.index_name, dimension)
    
    def index_document(self, doc: dict):
        """Index a single document."""
        text = self._build_text_for_embedding(doc)
        embedding = self.embedding_provider.generate_embedding(text)
        
        metadata = {k: v for k, v in doc.items() if k != 'embedding'}
        self.vector_store.index_document(
            self.index_name,
            doc.get('id', doc.get('scheme_id', doc.get('job_id'))),
            embedding,
            metadata
        )
    
    def _build_text_for_embedding(self, doc: dict) -> str:
        """Build text for embedding - override in subclass."""
        raise NotImplementedError
    
    def calculate_eligibility_score(self, doc: dict, user_profile: dict) -> float:
        """Calculate eligibility score - override in subclass."""
        raise NotImplementedError
    
    def search(self, user_profile: dict, limit: int = 10) -> list[dict]:
        """Search using vector similarity and eligibility scoring."""
        query_text = self._build_query_text(user_profile)
        query_embedding = self.embedding_provider.generate_embedding(query_text)
        
        results = self.vector_store.search(self.index_name, query_embedding, limit=50)
        
        for doc in results:
            doc["eligibility_score"] = self.calculate_eligibility_score(doc, user_profile)
            doc["final_score"] = (doc["vector_score"] * 0.6) + (doc["eligibility_score"] * 0.4)
        
        results.sort(key=lambda x: x["final_score"], reverse=True)
        return results[:limit]
    
    def _build_query_text(self, user_profile: dict) -> str:
        """Build query text - override in subclass."""
        raise NotImplementedError
