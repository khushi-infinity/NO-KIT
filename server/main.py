import os
from typing import Any, Protocol
import json
import re
import urllib.error
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    from .challenges import infer_properties, normalize_materials, rank_challenges
    from .main_models import AttemptRequest, Challenge, ChallengeRequest, DetectRequest, DetectionResponse, DiscoveryRequest, HintRequest, MaterialDetection, PublicChallenge
except ImportError:
    from challenges import infer_properties, normalize_materials, rank_challenges
    from main_models import AttemptRequest, Challenge, ChallengeRequest, DetectRequest, DetectionResponse, DiscoveryRequest, HintRequest, MaterialDetection, PublicChallenge


class AIProvider(Protocol):
    def detectMaterials(self, image: str) -> DetectionResponse: ...
    def generateChallenges(self, materials: list[str]) -> list[Challenge]: ...
    def evaluateAttempt(self, image: str, challenge: Challenge, result: str | None = None) -> dict[str, Any]: ...
    def generateHint(self, context: HintRequest) -> dict[str, Any]: ...
    def explainDiscovery(self, context: DiscoveryRequest) -> dict[str, Any]: ...


class DemoProvider:
    def detectMaterials(self, image: str) -> DetectionResponse:
        return DetectionResponse(materials=[MaterialDetection(name="cardboard", confidence=.94, properties=["flat", "lightweight", "cuttable"]), MaterialDetection(name="straw", confidence=.91, properties=["hollow", "rigid", "lightweight"]), MaterialDetection(name="pencil", confidence=.88, properties=["rigid", "rollable", "lightweight"]), MaterialDetection(name="tape", confidence=.97, properties=["connective", "flexible"]), MaterialDetection(name="paper", confidence=.89, properties=["flat", "lightweight", "foldable"])])

    def generateChallenges(self, materials: list[str]) -> list[Challenge]:
        return rank_challenges(materials)

    def evaluateAttempt(self, image: str, challenge: Challenge, result: str | None = None) -> dict[str, Any]:
        return {"status": "observed", "message": "This looks testable. Your observation is the useful part.", "result": result}

    def generateHint(self, context: HintRequest) -> dict[str, Any]:
        level = min(context.hintLevel, 3)
        return {"hint": context.challenge.hints[level - 1], "hintLevel": level, "revealedSolution": False}

    def explainDiscovery(self, context: DiscoveryRequest) -> dict[str, Any]:
        return {"title": f"You built a {context.challenge.hiddenSolution}.", "explanation": "The larger tail catches more wind. That force turns the smaller pointer into the wind.", "concepts": context.challenge.scienceConcepts}


class OpenWeightProvider:
    def __init__(self) -> None:
        self.base_url = os.getenv("AI_BASE_URL", "").rstrip("/")
        self.api_key = os.getenv("AI_API_KEY", "")
        self.vision_model = os.getenv("VISION_MODEL", "Qwen2.5-VL-7B-Instruct")
        self.text_model = os.getenv("TEXT_MODEL", "Qwen2.5-7B-Instruct")
        self.timeout = float(os.getenv("AI_TIMEOUT_SECONDS", "18"))

    def _chat_json(self, messages: list[dict[str, Any]], model: str) -> dict[str, Any]:
        if not self.base_url:
            raise RuntimeError("AI_BASE_URL is not configured")
        payload = json.dumps({"model": model, "messages": messages, "temperature": .2, "response_format": {"type": "json_object"}}).encode()
        request = urllib.request.Request(f"{self.base_url}/chat/completions", data=payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"}, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = json.loads(response.read().decode())
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            raise RuntimeError(f"Inference endpoint unavailable: {error}") from error
        content = raw.get("choices", [{}])[0].get("message", {}).get("content", "")
        content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip())
        try:
            return json.loads(content)
        except json.JSONDecodeError as error:
            raise RuntimeError("Inference response was not valid JSON") from error

    def detectMaterials(self, image: str) -> DetectionResponse:
        result = self._chat_json([{"role": "system", "content": "Identify only visible everyday materials. Return JSON with materials: [{name, confidence, properties}]. Never invent hidden objects."}, {"role": "user", "content": [{"type": "text", "text": "What safe, buildable materials are visible?"}, {"type": "image_url", "image_url": {"url": image}}]}], self.vision_model)
        return DetectionResponse.model_validate(result)

    def generateChallenges(self, materials: list[str]) -> list[Challenge]:
        candidates = rank_challenges(materials)
        result = self._chat_json([{"role": "system", "content": "Rank safe challenge candidates. Do not reveal hiddenSolution in the mission. Return JSON {challenges: [...]} matching the supplied schema."}, {"role": "user", "content": json.dumps({"materials": normalize_materials(materials), "properties": sorted(infer_properties(materials)), "candidates": [item.model_dump() for item in candidates]})}], self.text_model)
        return [Challenge.model_validate(item) for item in result["challenges"][:3]]

    def evaluateAttempt(self, image: str, challenge: Challenge, result: str | None = None) -> dict[str, Any]:
        return self._chat_json([{"role": "system", "content": "Be a Socratic maker mentor. Assess whether the attempt is testable without giving instructions or revealing the hidden solution. Return JSON with status and message."}, {"role": "user", "content": [{"type": "text", "text": json.dumps({"challenge": challenge.model_dump(exclude={"hiddenSolution"}), "testResult": result})}, {"type": "image_url", "image_url": {"url": image}}]}], self.vision_model)

    def generateHint(self, context: HintRequest) -> dict[str, Any]:
        return self._chat_json([{"role": "system", "content": "Give exactly one short Socratic hint. Do not reveal the solution. Use the smallest nudge that enables the next observation. Return JSON {hint, hintLevel, revealedSolution:false}."}, {"role": "user", "content": json.dumps({"challenge": context.challenge.model_dump(exclude={"hiddenSolution"}), "attempt": context.attempt, "hintLevel": context.hintLevel})}], self.text_model)

    def explainDiscovery(self, context: DiscoveryRequest) -> dict[str, Any]:
        return self._chat_json([{"role": "system", "content": "Explain the discovered science in two short sentences and list concepts. The learner has already succeeded."}, {"role": "user", "content": json.dumps(context.challenge.model_dump())}], self.text_model)


def get_provider() -> AIProvider:
    if os.getenv("DEMO_MODE", "true").lower() == "true" or os.getenv("AI_PROVIDER", "demo").lower() == "demo":
        return DemoProvider()
    return OpenWeightProvider()


def guarded(operation: Any, fallback: Any) -> Any:
    try:
        return operation()
    except Exception as error:
        if os.getenv("DEMO_MODE", "true").lower() == "true":
            return fallback()
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {error}") from error


app = FastAPI(title="NO-KIT API", version="0.2.0")
origins = [item.strip() for item in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "mode": "demo" if os.getenv("DEMO_MODE", "true").lower() == "true" else "provider-ready"}


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "NO-KIT", "message": "The screen is the shortest part."}


@app.post("/api/materials/detect", response_model=DetectionResponse)
def detect_materials(request: DetectRequest) -> DetectionResponse:
    demo = DemoProvider()
    return guarded(lambda: get_provider().detectMaterials(request.image), lambda: demo.detectMaterials(request.image))


@app.post("/api/challenges", response_model=list[PublicChallenge])
def generate_challenges(request: ChallengeRequest) -> list[PublicChallenge]:
    demo = DemoProvider()
    challenges = guarded(lambda: get_provider().generateChallenges(request.materials), lambda: demo.generateChallenges(request.materials))
    return [PublicChallenge.model_validate(challenge.model_dump(exclude={"hiddenSolution"})) for challenge in challenges]


@app.post("/api/attempt/evaluate")
def evaluate_attempt(request: AttemptRequest) -> dict[str, Any]:
    return guarded(lambda: get_provider().evaluateAttempt(request.image, request.challenge, request.result), lambda: DemoProvider().evaluateAttempt(request.image, request.challenge, request.result))


@app.post("/api/hint")
def generate_hint(request: HintRequest) -> dict[str, Any]:
    return guarded(lambda: get_provider().generateHint(request), lambda: DemoProvider().generateHint(request))


@app.post("/api/discovery")
def explain_discovery(request: DiscoveryRequest) -> dict[str, Any]:
    return guarded(lambda: get_provider().explainDiscovery(request), lambda: DemoProvider().explainDiscovery(request))