"""
Course repository layer.
Data access for course operations.
"""

import logging
import uuid
from typing import Optional, List, Dict, Any

from shared.db import execute_query
from shared.models import (
    Course,
    CourseStatus,
    CourseHighlight,
    CoursePhase,
    CoursePhaseItem,
    CourseBenefit,
    CourseAudience,
    CourseCareerOutcome,
    CourseCertificate,
    CourseRepository as ICourseRepository,
)

logger = logging.getLogger(__name__)


def _row_to_course(row: dict) -> Course:
    """Convert database row to Course model."""
    status = row.get("status", "draft")
    try:
        status_enum = CourseStatus(status) if status else CourseStatus.DRAFT
    except ValueError:
        status_enum = CourseStatus.DRAFT
    return Course(
        id=str(row["id"]),
        title=row["title"],
        slug=row.get("slug"),
        short_description=row.get("short_description"),
        full_description=row.get("full_description"),
        status=status_enum,
        display_order=int(row.get("display_order") or 0),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


class CourseRepository(ICourseRepository):
    """Repository for course data operations."""

    def get_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Get course by ID with all nested data."""
        course_row = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one",
        )
        if not course_row:
            return None

        course = _row_to_course(dict(course_row))
        result = course.to_dict()
        result["highlights"] = self._get_highlights(course_id)
        result["phases"] = self._get_phases_with_items(course_id)
        result["benefits"] = self._get_benefits(course_id)
        result["audience"] = self._get_audience(course_id)
        result["career_outcomes"] = self._get_career_outcomes(course_id)
        result["certificate"] = self._get_certificate(course_id)
        return result

    def _get_highlights(self, course_id: str) -> List[dict]:
        rows = execute_query(
            "SELECT * FROM course_highlights WHERE course_id = %s ORDER BY sort_order, id",
            (course_id,),
            fetch="all",
        )
        return [
            {
                "id": str(r["id"]),
                "course_id": str(r["course_id"]),
                "label": r["label"],
                "value": r["value"],
                "sort_order": r.get("sort_order", 0),
            }
            for r in (rows or [])
        ]

    def _get_phases_with_items(self, course_id: str) -> List[dict]:
        phase_rows = execute_query(
            "SELECT * FROM course_phases WHERE course_id = %s ORDER BY sort_order, id",
            (course_id,),
            fetch="all",
        )
        phases = []
        for pr in phase_rows or []:
            phase_id = str(pr["id"])
            item_rows = execute_query(
                "SELECT * FROM course_phase_items WHERE phase_id = %s ORDER BY sort_order, id",
                (phase_id,),
                fetch="all",
            )
            phase_items = [
                {
                    "id": str(ir["id"]),
                    "phase_id": str(ir["phase_id"]),
                    "item_type": ir["item_type"],
                    "text": ir["text"],
                    "sort_order": ir.get("sort_order", 0),
                }
                for ir in (item_rows or [])
            ]
            phases.append({
                "id": phase_id,
                "course_id": str(pr["course_id"]),
                "title": pr["title"],
                "subtitle": pr.get("subtitle"),
                "sort_order": pr.get("sort_order", 0),
                "phase_items": phase_items,
            })
        return phases

    def _get_benefits(self, course_id: str) -> List[dict]:
        rows = execute_query(
            "SELECT * FROM course_benefits WHERE course_id = %s ORDER BY sort_order, id",
            (course_id,),
            fetch="all",
        )
        return [
            {
                "id": str(r["id"]),
                "course_id": str(r["course_id"]),
                "title": r["title"],
                "description": r.get("description"),
                "icon": r.get("icon"),
                "sort_order": r.get("sort_order", 0),
            }
            for r in (rows or [])
        ]

    def _get_audience(self, course_id: str) -> List[dict]:
        rows = execute_query(
            "SELECT * FROM course_audience WHERE course_id = %s ORDER BY sort_order, id",
            (course_id,),
            fetch="all",
        )
        return [
            {
                "id": str(r["id"]),
                "course_id": str(r["course_id"]),
                "title": r["title"],
                "description": r.get("description"),
                "sort_order": r.get("sort_order", 0),
            }
            for r in (rows or [])
        ]

    def _get_career_outcomes(self, course_id: str) -> List[dict]:
        rows = execute_query(
            "SELECT * FROM course_career_outcomes WHERE course_id = %s ORDER BY sort_order, id",
            (course_id,),
            fetch="all",
        )
        return [
            {
                "id": str(r["id"]),
                "course_id": str(r["course_id"]),
                "text": r["text"],
                "sort_order": r.get("sort_order", 0),
            }
            for r in (rows or [])
        ]

    def _get_certificate(self, course_id: str) -> Optional[dict]:
        row = execute_query(
            "SELECT * FROM course_certificate WHERE course_id = %s",
            (course_id,),
            fetch="one",
        )
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "course_id": str(row["course_id"]),
            "title": row.get("title"),
            "provider": row.get("provider"),
            "description": row.get("description"),
            "image_url": row.get("image_url"),
        }

    def list(
        self,
        limit: int = 50,
        status_filter: Optional[str] = None,
        full: bool = False,
    ) -> List[Dict[str, Any]]:
        """List courses; if full=True return full payload per course."""
        if status_filter and status_filter in ("draft", "published"):
            rows = execute_query(
                """
                SELECT * FROM courses
                WHERE status = %s
                ORDER BY display_order ASC, created_at DESC
                LIMIT %s
                """,
                (status_filter, limit),
                fetch="all",
            )
        else:
            rows = execute_query(
                """
                SELECT * FROM courses
                ORDER BY display_order ASC, created_at DESC
                LIMIT %s
                """,
                (limit,),
                fetch="all",
            )
        rows = rows or []
        if full:
            return [self.get_by_id(str(r["id"])) for r in rows]
        return [_row_to_course(dict(r)).to_dict() for r in rows]

    def create(self, course: Course, children: Dict[str, Any]) -> Course:
        """Create course and all child rows."""
        execute_query(
            """
            INSERT INTO courses (
                id, title, slug, short_description, full_description,
                status, display_order, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """,
            (
                course.id,
                course.title,
                course.slug,
                course.short_description,
                course.full_description,
                course.status.value if course.status else CourseStatus.DRAFT.value,
                course.display_order,
            ),
            fetch="none",
        )
        course_id = course.id

        for i, h in enumerate(children.get("highlights") or []):
            execute_query(
                """
                INSERT INTO course_highlights (id, course_id, label, value, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, h.get("label", ""), h.get("value", ""), i),
                fetch="none",
            )

        for i, ph in enumerate(children.get("phases") or []):
            phase_id = str(uuid.uuid4())
            execute_query(
                """
                INSERT INTO course_phases (id, course_id, title, subtitle, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (phase_id, course_id, ph.get("title", ""), ph.get("subtitle"), i),
                fetch="none",
            )
            for j, it in enumerate(ph.get("phase_items") or []):
                execute_query(
                    """
                    INSERT INTO course_phase_items (id, phase_id, item_type, text, sort_order)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (str(uuid.uuid4()), phase_id, it.get("item_type", "what_you_learn"), it.get("text", ""), j),
                    fetch="none",
                )

        for i, b in enumerate(children.get("benefits") or []):
            execute_query(
                """
                INSERT INTO course_benefits (id, course_id, title, description, icon, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, b.get("title", ""), b.get("description"), b.get("icon"), i),
                fetch="none",
            )

        for i, a in enumerate(children.get("audience") or []):
            execute_query(
                """
                INSERT INTO course_audience (id, course_id, title, description, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, a.get("title", ""), a.get("description"), i),
                fetch="none",
            )

        for i, c in enumerate(children.get("career_outcomes") or []):
            execute_query(
                """
                INSERT INTO course_career_outcomes (id, course_id, text, sort_order)
                VALUES (%s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, c.get("text", ""), i),
                fetch="none",
            )

        cert = children.get("certificate")
        if cert and (cert.get("title") or cert.get("provider") or cert.get("description") or cert.get("image_url")):
            execute_query(
                """
                INSERT INTO course_certificate (id, course_id, title, provider, description, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    str(uuid.uuid4()),
                    course_id,
                    cert.get("title"),
                    cert.get("provider"),
                    cert.get("description"),
                    cert.get("image_url"),
                ),
                fetch="none",
            )

        logger.info("Created course: %s", course_id)
        return course

    def update(self, course_id: str, course: Course, children: Dict[str, Any]) -> Optional[Course]:
        """Update course and replace all child rows."""
        existing = execute_query("SELECT id FROM courses WHERE id = %s", (course_id,), fetch="one")
        if not existing:
            return None

        execute_query(
            """
            UPDATE courses SET
                title = %s, slug = %s, short_description = %s, full_description = %s,
                status = %s, display_order = %s, updated_at = NOW()
            WHERE id = %s
            """,
            (
                course.title,
                course.slug,
                course.short_description,
                course.full_description,
                course.status.value if course.status else CourseStatus.DRAFT.value,
                course.display_order,
                course_id,
            ),
            fetch="none",
        )

        execute_query("DELETE FROM course_highlights WHERE course_id = %s", (course_id,), fetch="none")
        execute_query("DELETE FROM course_phases WHERE course_id = %s", (course_id,), fetch="none")
        execute_query("DELETE FROM course_benefits WHERE course_id = %s", (course_id,), fetch="none")
        execute_query("DELETE FROM course_audience WHERE course_id = %s", (course_id,), fetch="none")
        execute_query("DELETE FROM course_career_outcomes WHERE course_id = %s", (course_id,), fetch="none")
        execute_query("DELETE FROM course_certificate WHERE course_id = %s", (course_id,), fetch="none")

        for i, h in enumerate(children.get("highlights") or []):
            execute_query(
                """
                INSERT INTO course_highlights (id, course_id, label, value, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, h.get("label", ""), h.get("value", ""), i),
                fetch="none",
            )

        for i, ph in enumerate(children.get("phases") or []):
            phase_id = str(uuid.uuid4())
            execute_query(
                """
                INSERT INTO course_phases (id, course_id, title, subtitle, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (phase_id, course_id, ph.get("title", ""), ph.get("subtitle"), i),
                fetch="none",
            )
            for j, it in enumerate(ph.get("phase_items") or []):
                execute_query(
                    """
                    INSERT INTO course_phase_items (id, phase_id, item_type, text, sort_order)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (str(uuid.uuid4()), phase_id, it.get("item_type", "what_you_learn"), it.get("text", ""), j),
                    fetch="none",
                )

        for i, b in enumerate(children.get("benefits") or []):
            execute_query(
                """
                INSERT INTO course_benefits (id, course_id, title, description, icon, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, b.get("title", ""), b.get("description"), b.get("icon"), i),
                fetch="none",
            )

        for i, a in enumerate(children.get("audience") or []):
            execute_query(
                """
                INSERT INTO course_audience (id, course_id, title, description, sort_order)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, a.get("title", ""), a.get("description"), i),
                fetch="none",
            )

        for i, c in enumerate(children.get("career_outcomes") or []):
            execute_query(
                """
                INSERT INTO course_career_outcomes (id, course_id, text, sort_order)
                VALUES (%s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), course_id, c.get("text", ""), i),
                fetch="none",
            )

        cert = children.get("certificate")
        if cert and (cert.get("title") or cert.get("provider") or cert.get("description") or cert.get("image_url")):
            execute_query(
                """
                INSERT INTO course_certificate (id, course_id, title, provider, description, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    str(uuid.uuid4()),
                    course_id,
                    cert.get("title"),
                    cert.get("provider"),
                    cert.get("description"),
                    cert.get("image_url"),
                ),
                fetch="none",
            )

        logger.info("Updated course: %s", course_id)
        return course

    def delete(self, course_id: str) -> bool:
        """Delete course (CASCADE deletes children)."""
        execute_query("DELETE FROM courses WHERE id = %s", (course_id,), fetch="none")
        logger.info("Deleted course: %s", course_id)
        return True

    def register(self, course_id: str, user_id: str) -> bool:
        """Register user for course (idempotent)."""
        reg_id = str(uuid.uuid4())
        try:
            execute_query(
                """
                INSERT INTO course_registrations (id, course_id, user_id)
                VALUES (%s, %s, %s)
                ON CONFLICT (course_id, user_id) DO NOTHING
                """,
                (reg_id, course_id, user_id),
                fetch="none",
            )
        except Exception as e:
            logger.warning("Course registration insert: %s", e)
            return False
        return True
