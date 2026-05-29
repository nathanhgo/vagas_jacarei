class JobSyncService:
    @staticmethod
    def extract_neighborhood(text):
        """Helper para extrair bairros conhecidos de Jacareí a partir do texto descritivo"""
        if not text:
            return None
        
        bairros = [
            "Centro", "Villa Branca", "Jardim das Indústrias", "Jardim Santa Maria", 
            "Parque Califórnia", "Parque dos Sinos", "Jardim Paraíba", "Jardim Flórida", 
            "Igarapés", "Jardim Coleginho", "Cidade Salvador", "Balneário Paraíba"
        ]
        
        # Converte para minúsculo para busca case-insensitive
        text_lower = text.lower()
        for bairro in bairros:
            if bairro.lower() in text_lower:
                return bairro
        return None
