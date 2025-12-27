class WebRTCService:
    """
    Signaling only.
    No media passes through backend.
    """

    @staticmethod
    def validate_offer(offer: dict):
        if "sdp" not in offer or "type" not in offer:
            raise ValueError("Invalid SDP offer")