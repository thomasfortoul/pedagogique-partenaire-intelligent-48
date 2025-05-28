import unittest
from models import Course, TaskDocument, UserInteractionState

class TestModels(unittest.TestCase):
    def test_course(self):
        course = Course(
            course_id="C1",
            name="Linear Algebra",
            summary="Intro to linear algebra.",
            objectives=["Understand matrices", "Apply vector spaces"],
            blooms_levels=["Understand", "Apply"]
        )
        self.assertEqual(course.name, "Linear Algebra")
        self.assertIn("Apply", course.blooms_levels)

    def test_task_document(self):
        doc = TaskDocument(
            doc_id="D1",
            course_id="C1",
            doc_type="exam",
            content="Q1: ...",
            objectives=["Understand matrices"],
            blooms_levels=["Understand"]
        )
        self.assertEqual(doc.doc_type, "exam")
        self.assertIn("Understand matrices", doc.objectives)

    def test_user_interaction_state(self):
        state = UserInteractionState(
            user_id="U1",
            current_course_id="C1",
            current_task_id="D1"
        )
        self.assertEqual(state.current_course_id, "C1")
        self.assertIsInstance(state.chat_context, dict)

if __name__ == "__main__":
    unittest.main() 