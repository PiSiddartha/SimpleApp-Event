"""
Materials repository layer.
Data access for material operations.
"""

import logging
from typing import Optional, List

from shared.db import execute_query
from shared.models import Material, MaterialRepository as IMaterialRepository

logger = logging.getLogger(__name__)


class MaterialRepository(IMaterialRepository):
    """Repository for material data operations."""
    
    def get_by_id(self, material_id: str) -> Optional[Material]:
        """Get material by ID."""
        result = execute_query(
            "SELECT * FROM materials WHERE id = %s",
            (material_id,),
            fetch="one"
        )
        
        return self._row_to_material(result) if result else None
    
    def create(self, material: Material) -> Material:
        """Create a new material."""
        execute_query(
            """
            INSERT INTO materials (
                id, event_id, title, file_url, file_type, uploaded_by, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                material.id,
                material.event_id,
                material.title,
                material.file_url,
                material.file_type,
                material.uploaded_by,
                material.created_at,
            ),
            fetch="none"
        )
        
        logger.info(f"Created material: {material.id}")
        return material
    
    def delete(self, material_id: str) -> bool:
        """Delete a material."""
        execute_query(
            "DELETE FROM materials WHERE id = %s",
            (material_id,),
            fetch="none"
        )
        
        logger.info(f"Deleted material: {material_id}")
        return True
    
    def list_by_event(self, event_id: str) -> List[Material]:
        """List materials for an event."""
        results = execute_query(
            "SELECT * FROM materials WHERE event_id = %s ORDER BY created_at DESC",
            (event_id,),
            fetch="all"
        )
        
        return [self._row_to_material(row) for row in results]
    
    def _row_to_material(self, row: dict) -> Material:
        """Convert database row to Material model."""
        return Material(
            id=row["id"],
            event_id=row["event_id"],
            title=row["title"],
            file_url=row["file_url"],
            file_type=row.get("file_type"),
            uploaded_by=row.get("uploaded_by"),
            created_at=row.get("created_at"),
        )
