# app/users/router.py
from fastapi import APIRouter, Depends
from app.users import ProfileUpdate
from app import get_current_user
from app.users import update_profile

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/me/profile")
async def update_my_profile(
    payload: ProfileUpdate,
    user=Depends(get_current_user),
):
    return await update_profile(user.id, payload)