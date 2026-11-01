from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserData
from ..schemas import DataIn, DataOut
from ..security import current_user

router = APIRouter(prefix="/api/data", tags=["data"])


def _row(user: User, db: Session) -> UserData:
    if user.data is None:
        user.data = UserData(progress={}, skills={}, topics={})
        db.commit()
    return user.data


@router.get("", response_model=DataOut)
def get_data(user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = _row(user, db)
    return DataOut(progress=row.progress or {}, skills=row.skills or {}, topics=row.topics or {}, updated_at=row.updated_at)


@router.put("", response_model=DataOut)
def put_data(body: DataIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = _row(user, db)
    row.progress, row.skills, row.topics = body.progress, body.skills, body.topics
    db.commit()
    db.refresh(row)
    return DataOut(progress=row.progress, skills=row.skills, topics=row.topics, updated_at=row.updated_at)
