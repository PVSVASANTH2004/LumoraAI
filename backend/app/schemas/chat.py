from datetime import datetime

from pydantic import BaseModel, Field


class ChatSessionCreateRequest(BaseModel):
    document_ids: list[str] = Field(default_factory=list, max_length=20)
    title: str = Field(default="New conversation", max_length=200)


class ChatSessionUpdateRequest(BaseModel):
    document_ids: list[str] = Field(max_length=20)


class ChatMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=8000)
    document_ids: list[str] | None = None  # override session docs for this turn


class CitationSourceResponse(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    score: float
    snippet: str
    chunk_index: int


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: list[CitationSourceResponse]
    created_at: datetime
    feedback: str | None


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    document_ids: list[str]
    message_count: int
    created_at: datetime
    updated_at: datetime


class ChatSessionDetailResponse(ChatSessionResponse):
    messages: list[ChatMessageResponse]


class ChatSessionListResponse(BaseModel):
    items: list[ChatSessionResponse]
    total: int


class MessageFeedbackRequest(BaseModel):
    feedback: str = Field(pattern="^(positive|negative)$")


# Server-Sent Events stream types
class StreamDeltaEvent(BaseModel):
    type: str = "delta"
    content: str


class StreamSourcesEvent(BaseModel):
    type: str = "sources"
    sources: list[CitationSourceResponse]


class StreamDoneEvent(BaseModel):
    type: str = "done"
    message_id: str


class StreamErrorEvent(BaseModel):
    type: str = "error"
    error: str
