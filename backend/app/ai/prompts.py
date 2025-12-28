def build_prompt(
    language: str,
    code: str,
    instruction: str
) -> str:
    return f"""
You are a senior software engineer.
Language: {language}

Current code:
{code}

User request:
{instruction}

Respond with code only when applicable.
"""