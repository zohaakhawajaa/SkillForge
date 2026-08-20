import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from skill_analyzer import SkillAnalyzer


class SkillAnalyzerTests(unittest.TestCase):
    def test_ai_engineer_score_and_gaps(self):
        analyzer = SkillAnalyzer("Amina", ["Python", "Git"], "AI Engineer")
        self.assertEqual(analyzer.calculate_score(), 33.33)
        self.assertEqual(analyzer.identify_gaps(), ["machine learning", "docker", "mathematics", "sql"])

    def test_data_analyst_requirements(self):
        analyzer = SkillAnalyzer("Amina", ["Python", "SQL", "Excel"], "Data Analyst")
        self.assertEqual(analyzer.calculate_score(), 50.0)
        self.assertIn("statistics", analyzer.identify_gaps())

    def test_unknown_role_returns_zero_without_error(self):
        analyzer = SkillAnalyzer("Amina", ["Python"], "Game Designer")
        self.assertEqual(analyzer.calculate_score(), 0)
        self.assertEqual(analyzer.identify_gaps(), [])


if __name__ == "__main__":
    unittest.main()
