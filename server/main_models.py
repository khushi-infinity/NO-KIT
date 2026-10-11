from typing import Any

from pydantic import BaseModel, Field


class MaterialDetection(BaseModel):
    name: str
    confidence: float = Field(ge=0, le=1)
    properties: list[str]


class DetectionResponse(BaseModel):
    materials: list[MaterialDetection]


class Challenge(BaseModel):
    challengeTitle: str
    mission: str
    difficulty: int = Field(ge=1, le=5)
    minutes: int = Field(gt=0)
    requiresOutside: bool
    availableMaterials: list[str]
    scienceConcepts: list[str]
    safety: list[str]
    hiddenSolution: str
    hints: list[str] = Field(min_length=3, max_length=3)
    testProtocol: list[str]
    successCriteria: list[str]


class PublicChallenge(BaseModel):
    challengeTitle: str
    mission: str
    difficulty: int = Field(ge=1, le=5)
    minutes: int = Field(gt=0)
    requiresOutside: bool
    availableMaterials: list[str]
    scienceConcepts: list[str]
    safety: list[str]
    hints: list[str] = Field(min_length=3, max_length=3)
    testProtocol: list[str]
    successCriteria: list[str]


class DetectRequest(BaseModel):
    image: str = Field(min_length=20)


class ChallengeRequest(BaseModel):
    materials: list[str]


class AttemptRequest(BaseModel):
    image: str
    challenge: Challenge
    result: str | None = None


class HintRequest(BaseModel):
    challenge: Challenge
    attempt: dict[str, Any] = Field(default_factory=dict)
    hintLevel: int = Field(default=1, ge=1, le=3)


class DiscoveryRequest(BaseModel):
    challenge: Challenge