#!/usr/bin/env python3
"""
Tests for the RAG Framework

This module contains tests for the core RAG framework functionality.
"""

import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the module to test
try:
    from src.rag_framework import RAGFramework
except ImportError:
    # For running tests directly
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
    from rag.src.rag_framework import RAGFramework


class TestRAGFramework(unittest.TestCase):
    """Tests for the RAGFramework class"""

    def setUp(self):
        """Set up test environment"""
        # Create a framework instance for testing
        self.rag = RAGFramework()

    def test_initialization(self):
        """Test framework initialization"""
        # Check that the framework initializes with expected defaults
        self.assertEqual(self.rag.db_type, 'lancedb')
        self.assertEqual(self.rag.embed_model, 'openai')
        self.assertEqual(self.rag.llm_model, 'claude')

    @patch('rag.src.rag_framework.logger')
    def test_check_status(self, mock_logger):
        """Test status checking functionality"""
        # Mock component availability
        self.rag.anthropic = MagicMock()
        self.rag.db_module = MagicMock()
        self.rag.embeddings_module = MagicMock()

        # Check status should return ready when all components are available
        status = self.rag.check_status()
        self.assertEqual(status['status'], 'ready')
        self.assertTrue(all(status['components'].values()))

        # Test when a component is missing
        self.rag.db_module = None
        status = self.rag.check_status()
        self.assertEqual(status['status'], 'not_ready')
        self.assertFalse(status['components']['Vector DB'])

    @patch('rag.src.rag_framework.logger')
    def test_query(self, mock_logger):
        """Test query functionality"""
        # Mock component availability for successful query
        self.rag.anthropic = MagicMock()
        self.rag.db_module = MagicMock()
        self.rag.embeddings_module = MagicMock()

        # Test successful query
        result = self.rag.query("Test query")
        self.assertTrue(result['success'])
        self.assertEqual(result['query'], "Test query")
        self.assertIn('response', result['results'])

        # Test query with missing components
        self.rag.db_module = None
        result = self.rag.query("Test query with missing components")
        self.assertFalse(result['success'])
        self.assertIn('error', result)

    @patch('rag.src.rag_framework.logger')
    def test_index_directory(self, mock_logger):
        """Test directory indexing functionality"""
        # Mock component availability for successful indexing
        self.rag.anthropic = MagicMock()
        self.rag.db_module = MagicMock()
        self.rag.embeddings_module = MagicMock()
        
        # Create temporary test directory
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdirname:
            # Create some test files
            with open(os.path.join(tmpdirname, 'test.md'), 'w') as f:
                f.write('Test content')
            
            # Test successful indexing
            result = self.rag.index_directory(tmpdirname)
            self.assertTrue(result['success'])
            self.assertEqual(result['directory'], tmpdirname)
            self.assertEqual(result['documents_found'], 1)
            
            # Test with missing components
            self.rag.db_module = None
            result = self.rag.index_directory(tmpdirname)
            self.assertFalse(result['success'])
            self.assertIn('error', result)


if __name__ == '__main__':
    unittest.main()