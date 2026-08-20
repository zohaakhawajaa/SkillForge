import os
import re

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

    def retrieve(self, query, limit=2):
        """Return the most relevant local knowledge-base documents with source metadata."""
        query_terms = set(re.findall(r"[a-z0-9.+#]+", query.lower()))
        preferred_source = next((name for name in self.documents if name[:-4].replace("_", " ") in query.lower()), None)
        ranked = []
        for name, content in self.documents.items():
            terms = set(re.findall(r"[a-z0-9.+#]+", f"{name} {content}".lower()))
            # The role's own document always wins over a loosely related document.
            overlap = len(query_terms & terms) + (100 if name == preferred_source else 0)
            if overlap:
                ranked.append((overlap, name, content))
        ranked.sort(reverse=True, key=lambda item: item[0])
        if not ranked:
            return [{"source": "general-guidance", "content": "Build projects, learn Git, and practice coding daily."}]
        return [{"source": name, "content": content} for _, name, content in ranked[:limit]]
