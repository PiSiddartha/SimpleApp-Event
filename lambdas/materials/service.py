"""
Materials service layer.
Business logic for material operations.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List
import os

import boto3
from botocore.exceptions import ClientError

from materials.repository import MaterialRepository
from events.repository import EventRepository

logger = logging.getLogger(__name__)

# Initialize S3 client
s3_client = boto3.client("s3")


class MaterialService:
    """Service for material-related business logic."""
    
    def __init__(self):
        self.repository = MaterialRepository()
        self.event_repo = EventRepository()
        self.bucket = os.environ.get("S3_MATERIALS_BUCKET", "payintelli-materials")
        self._engagement_service = None
    
    @property
    def engagement_service(self):
        """Lazy load engagement service to avoid circular imports."""
        if self._engagement_service is None:
            from shared.engagement import get_engagement_service
            self._engagement_service = get_engagement_service()
        return self._engagement_service
    
    def create_material(
        self,
        event_id: str,
        title: str,
        file_type: str,
        uploaded_by: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Create a material record and generate presigned upload URL.
        
        Returns:
            Dict with material details and upload URL
        """
        # Verify event exists
        event = self.event_repo.get_by_id(event_id)
        if not event:
            logger.warning(f"Event not found: {event_id}")
            return None
        
        # Generate material ID and file key
        material_id = str(uuid.uuid4())
        file_key = f"events/{event_id}/{material_id}/{title}"
        
        # Generate presigned upload URL
        upload_url = None
        try:
            upload_url = s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": file_key,
                    "ContentType": file_type,
                },
                ExpiresIn=3600,  # 1 hour
            )
        except ClientError as e:
            logger.warning(f"Failed to generate presigned URL: {e}")
            # Fallback to direct S3 URL for local testing
            upload_url = f"s3://{self.bucket}/{file_key}"
        
        # Create material record
        from shared.models import Material
        material = Material(
            id=material_id,
            event_id=event_id,
            title=title,
            file_url=f"https://{self.bucket}.s3.amazonaws.com/{file_key}",
            file_type=file_type,
            uploaded_by=uploaded_by,
        )
        
        self.repository.create(material)
        
        logger.info(f"Created material: {material_id} for event: {event_id}")
        
        return {
            "material_id": material_id,
            "title": title,
            "file_url": material.file_url,
            "upload_url": upload_url,
            "message": "Material created. Upload file using the presigned URL."
        }
    
    def get_material(self, material_id: str) -> Optional[Dict[str, Any]]:
        """Get material by ID."""
        material = self.repository.get_by_id(material_id)
        return material.to_dict() if material else None
    
    def delete_material(self, material_id: str, user_id: str) -> bool:
        """Delete a material and its S3 object."""
        material = self.repository.get_by_id(material_id)
        
        if not material:
            return False
        
        # Check ownership via event
        event = self.event_repo.get_by_id(material.event_id)
        if not event or event.created_by != user_id:
            logger.warning(f"User {user_id} not authorized to delete material {material_id}")
            return False
        
        # Delete from S3
        try:
            # Extract key from URL
            file_key = material.file_url.split(f"{self.bucket}.s3.amazonaws.com/")[-1]
            s3_client.delete_object(Bucket=self.bucket, Key=file_key)
            logger.info(f"Deleted S3 object: {file_key}")
        except ClientError as e:
            logger.warning(f"Failed to delete S3 object: {e}")
        
        # Delete from database
        return self.repository.delete(material_id)
    
    def list_materials(self, event_id: str) -> List[Dict[str, Any]]:
        """List materials for an event."""
        materials = self.repository.list_by_event(event_id)
        return [m.to_dict() for m in materials]
    
    def get_download_url(self, material_id: str, user_id: str = None) -> Optional[Dict[str, Any]]:
        """Generate presigned download URL for a material."""
        material = self.repository.get_by_id(material_id)
        
        if not material:
            return None
        
        # Extract key from URL
        try:
            file_key = material.file_url.split(f"{self.bucket}.s3.amazonaws.com/")[-1]
            
            # Generate presigned URL
            download_url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": file_key,
                },
                ExpiresIn=3600,  # 1 hour
            )
        except ClientError as e:
            logger.warning(f"Failed to generate download URL: {e}")
            download_url = material.file_url
        
        # Track engagement event (if user_id provided)
        if user_id:
            try:
                self.engagement_service.track_download(
                    user_id=user_id,
                    event_id=material.event_id,
                    material_id=material_id
                )
            except Exception as e:
                logger.warning(f"Failed to track engagement: {e}")
        
        return {
            "material_id": material_id,
            "title": material.title,
            "download_url": download_url,
            "expires_in": 3600,
        }
