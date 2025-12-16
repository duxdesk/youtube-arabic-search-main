import json
import warnings
from typing import List, Dict, Any, Optional
from uuid import uuid5, NAMESPACE_DNS
from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    PointStruct, VectorParams, Distance, Filter, FieldCondition, MatchValue
)
from sentence_transformers import SentenceTransformer  # Optional for embeddings

# Suppress PyTorch CUDA warnings for older GPUs
warnings.filterwarnings("ignore", category=UserWarning, module="torch.cuda")

class JSONToQdrantLoader:
    """
    Loads flattened video+timestamp data from JSON into Qdrant as points with JSON payloads.
    Optional: Adds text embeddings for semantic search. Handles large files with batch upserts.
    """
    
    def __init__(self, input_file: str):
        self.input_file = input_file
        self.data: List[Dict[str, Any]] = None
        self.client: Optional[QdrantClient] = None
        self.embedder: Optional[SentenceTransformer] = None
        self.batch_size = 100  # For large files; adjust if needed
    
    def read(self) -> List[Dict[str, Any]]:
        """Read JSON into list of video dicts (stream for large files)."""
        with open(self.input_file, 'r', encoding='utf-8-sig') as f:  # FIXED: -sig strips BOM
            self.data = json.load(f)
        if not isinstance(self.data, list):
            raise ValueError("JSON must be a list of video objects.")
        print(f"Loaded {len(self.data)} videos from {self.input_file}.")
        return self.data
    
    def _init_client(self, host: str = 'localhost', port: int = 6333):
        """Initialize Qdrant client."""
        if self.client is None:
            self.client = QdrantClient(host=host, port=port)
    
    def _init_embedder(self, model_name: str = 'paraphrase-multilingual-MiniLM-L12-v2'):
        """Optional: Load embedding model on CPU (multilingual for Arabic)."""
        if self.embedder is None:
            self.embedder = SentenceTransformer(model_name, device='cpu')
    
    def load_to_qdrant(
        self, 
        collection_name: str = 'videos',
        embed_text: bool = False,
        host: str = 'localhost',
        port: int = 6333
    ) -> None:
        """
        Flatten data and upsert to Qdrant collection in batches.
        
        Args:
            collection_name: Name of the Qdrant collection.
            embed_text: If True, embed 'text' field as vectors (requires sentence-transformers).
            host/port: Qdrant server details.
        """
        if self.data is None:
            raise ValueError("Call read() first.")
        
        self._init_client(host, port)
        
        # Test connection
        try:
            self.client.get_collections()  # Quick health check
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Qdrant at {host}:{port}. Is the Docker container running? Error: {e}")
        
        # Create collection only if it doesn't exist (or recreate if vectors needed)
        try:
            if not self.client.collection_exists(collection_name):
                if embed_text:
                    self._init_embedder()
                    vector_size = self.embedder.get_sentence_embedding_dimension()  # e.g., 384
                    self.client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                    )
                    print(f"Created new collection '{collection_name}' with vectors.")
                else:
                    self.client.create_collection(collection_name=collection_name)
                    print(f"Created new collection '{collection_name}' (payload-only).")
            else:
                print(f"Collection '{collection_name}' already exists—skipping creation.")
                if embed_text:
                    self._init_embedder()  # Still init for encoding
        except Exception as e:
            print(f"Collection creation failed: {e}. Trying to delete and recreate...")
            self.client.delete_collection(collection_name)
            # Recreate
            if embed_text:
                self._init_embedder()
                vector_size = self.embedder.get_sentence_embedding_dimension()
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                )
            else:
                self.client.create_collection(collection_name=collection_name)
            print(f"Recreated collection '{collection_name}'.")
        
        # Flatten and batch upsert
        all_points = []
        for video_idx, video in enumerate(self.data):
            if video_idx % 10 == 0:  # Progress tick more frequent for 95 videos
                print(f"Processing video {video_idx + 1}/95...")
            
            video_base = {
                'youtuber_id': video.get('youtuber_id', ''),
                'video_title': video.get('video_title', ''),
                'video_url': video.get('video_url', ''),
                'video_id': video.get('video_id', ''),
                'publish_date': video.get('publish_date', ''),  # Empty if missing
                'duration': video.get('duration', ''),
                'content': video.get('content', '')  # Preserve description field
            }
            
            timestamps = video.get('timestamps', [])
            if not timestamps:
                # No timestamps: single point with empty fields
                point_key = f"{video_base['video_id']}_0"
                point_id = str(uuid5(NAMESPACE_DNS, point_key))
                payload = {**video_base, 'start_time': 0, 'end_time': 0, 'text': ''}
                vector = None
                if embed_text:
                    vector = [0.0] * self.embedder.get_sentence_embedding_dimension()  # Dummy
                all_points.append(PointStruct(id=point_id, payload=payload, vector=vector))
            else:
                for ts_idx, ts in enumerate(timestamps):
                    point_key = f"{video_base['video_id']}_{ts_idx}"
                    point_id = str(uuid5(NAMESPACE_DNS, point_key))
                    payload = {
                        **video_base,
                        'start_time': ts.get('start_time', 0),
                        'end_time': ts.get('end_time', 0),
                        'text': ts.get('text', '')
                    }
                    vector = None
                    if embed_text and payload['text']:
                        vector = self.embedder.encode(payload['text']).tolist()
                    all_points.append(PointStruct(id=point_id, payload=payload, vector=vector))
        
        # Batch upsert for large files
        total_points = len(all_points)
        for i in range(0, total_points, self.batch_size):
            batch = all_points[i:i + self.batch_size]
            self.client.upsert(collection_name=collection_name, points=batch)
            print(f"Upserted batch {i // self.batch_size + 1} ({len(batch)} points)")
        
        print(f"Loaded {total_points} points to '{collection_name}' (vectors: {embed_text})")
    
    def query_by_filter(self, collection_name: str, filter_key: str, filter_value: str, limit: int = 10) -> List[Dict]:
        """
        Example query: Filter by payload field (e.g., youtuber_id).
        
        Returns: List of matching payloads.
        """
        if self.client is None:
            raise ValueError("Initialize client via load_to_qdrant first.")
        
        filter_cond = Filter(
            must=[FieldCondition(key=filter_key, match=MatchValue(value=filter_value))]
        )
        results = self.client.scroll(
            collection_name=collection_name,
            scroll_filter=filter_cond,
            limit=limit,
            with_payload=True
        )
        return [hit.payload for hit in results[0]]  # Extract payloads
    
    def semantic_search(self, collection_name: str, query_text: str, limit: int = 5) -> List[Dict]:
        """
        If vectors enabled: Semantic search on embedded text.
        """
        if not self.embedder:
            raise ValueError("Embeddings not initialized (set embed_text=True in load).")
        
        query_vector = self.embedder.encode(query_text).tolist()
        results = self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=limit,
            with_payload=True
        )
        return [hit.payload for hit in results.points]  # Extract payloads from QueryResponse.points
    def get_full_video(self, collection_name: str, video_id: str, limit: int = None) -> Dict:
    """
    Fetch all timestamps for a video_id, sort them, and reconstruct the full video structure.
    
    Args:
        collection_name: Qdrant collection.
        video_id: The video's ID (e.g., 'InkQ8k5vIjE').
        limit: Optional max timestamps to fetch (for testing; None = all).
    
    Returns: Dict with video base + sorted 'timestamps' list.
    """
    if self.client is None:
        raise ValueError("Initialize client via load_to_qdrant first.")
    
    filter_cond = Filter(
        must=[FieldCondition(key="video_id", match=MatchValue(value=video_id))]
    )
    results = self.client.scroll(
        collection_name=collection_name,
        scroll_filter=filter_cond,
        limit=limit,  # None for all
        with_payload=True
    )
    
    timestamps = []
    for hit in results[0]:
        ts = {
            "start_time": hit.payload.get("start_time", 0),
            "end_time": hit.payload.get("end_time", 0),
            "text": hit.payload.get("text", "")
        }
        timestamps.append(ts)
    
    # Sort by start_time
    timestamps.sort(key=lambda x: x["start_time"])
    
    # Video base from first hit
    base = results[0][0].payload if results[0] else {}
    base["timestamps"] = timestamps
    base.pop("start_time", None)  # Clean up promoted fields from base
    base.pop("end_time", None)
    base.pop("text", None)
    
    return base

# Example Usage (in your app) - UPDATED FOR YOUR FILE
# Example Usage (in your app) - RECONSTRUCT FULL VIDEO
if __name__ == "__main__":
    loader = JSONToQdrantLoader('ready_to_uppload_Arnest_videso.json')
    loader.load_to_qdrant(collection_name='youtube_videos', embed_text=True)  # Init client (skip load if already done)
    
    # Reconstruct a full video (use a real video_id from dashboard or your JSON)
    sample_video_id = 'InkQ8k5vIjE'  # From your sample
    full_video = loader.get_full_video('youtube_videos', sample_video_id)
    
    print(f"Reconstructed video: {full_video['video_title']}")
    print(f"Total timestamps (sentences): {len(full_video['timestamps'])}")
    print("\nFirst 5 timestamps:")
    for i, ts in enumerate(full_video['timestamps'][:5]):
        print(f"  {i+1}. [{ts['start_time']}-{ts['end_time']}] {ts['text'][:100]}...")
    
    print(f"\nFull video URL: {full_video['video_url']}")
