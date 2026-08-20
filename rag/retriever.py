import os

class RAGRetriever:
    """
    RAG (Retrieval-Augmented Generation) Engine.
    This reads our local text files to give the AI factual information to ground its answers.
    """
    def __init__(self, kb_path="rag/knowledge-base"):
        self.kb_path = kb_path
        self.documents = {}
        self._load_documents()

    def _load_documents(self):
        """Loads all .txt files from the knowledge base."""
        # Fix path for running from root or from within the agent folder
        actual_path = self.kb_path
        if not os.path.exists(actual_path) and os.path.exists("../" + self.kb_path):
            actual_path = "../" + self.kb_path

        if not os.path.exists(actual_path):
            print(f"Warning: Knowledge base path {actual_path} not found.")
            return

        for filename in os.listdir(actual_path):
            if filename.endswith(".txt"):
                with open(os.path.join(actual_path, filename), 'r', encoding='utf-8') as f:
                    self.documents[filename] = f.read()

    def retrieve(self, query):
        """
        Simulates a Vector Database search.
        It finds the document that matches the user's career goal.
        """
        query = query.lower()
        results = []
        
        for name, content in self.documents.items():
            if "ai" in query and "ai" in name:
                results.append(content)
            elif "web" in query and "web" in name:
                results.append(content)
        
        if not results:
            return "General Advice: Build projects, learn Git, and practice coding daily."
        
        return "\n".join(results)
