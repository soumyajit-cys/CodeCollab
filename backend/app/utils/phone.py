import hashlib

def hash_phone(phone: str) -> str:
    return hashlib.sha256(phone.encode()).hexdigest()