from dataclasses import dataclass
from typing import Any

try:
    from .main_models import Challenge
except ImportError:
    from main_models import Challenge


PROPERTY_MAP: dict[str, set[str]] = {
    "cardboard": {"rigid", "flat", "lightweight", "cuttable"},
    "paper": {"flat", "lightweight", "foldable", "absorbent"},
    "straw": {"hollow", "rigid", "lightweight", "rollable"},
    "pencil": {"rigid", "rollable", "lightweight"},
    "stick": {"rigid", "rollable", "lightweight"},
    "tape": {"connective", "flexible"},
    "string": {"flexible", "connective"},
    "bottle": {"container", "waterproof", "transparent", "rollable"},
    "plastic bottle": {"container", "waterproof", "transparent", "rollable"},
    "cup": {"container", "rigid", "lightweight"},
    "stones": {"heavy", "rigid"},
    "stone": {"heavy", "rigid"},
    "coins": {"heavy", "reflective"},
    "cloth": {"flexible", "absorbent"},
    "sand": {"heavy", "rollable"},
    "gravel": {"heavy", "rigid"},
}


def normalize_materials(materials: list[str]) -> list[str]:
    aliases = {"card board": "cardboard", "plastic": "bottle", "sticks": "stick", "papers": "paper", "rubberband": "rubber bands"}
    return list(dict.fromkeys(aliases.get(item.strip().lower(), item.strip().lower()) for item in materials if item.strip()))


def infer_properties(materials: list[str]) -> set[str]:
    properties: set[str] = set()
    for material in normalize_materials(materials):
        properties.update(PROPERTY_MAP.get(material, set()))
    return properties


def _challenge(**values: Any) -> Challenge:
    return Challenge(**values)


CURATED_CHALLENGES = [
    _challenge(challengeTitle="Wind Hacker", mission="Build something that can show which direction the wind is coming from.", difficulty=2, minutes=15, requiresOutside=True, availableMaterials=["cardboard", "paper", "straw", "stick", "pencil", "tape"], scienceConcepts=["wind", "force", "surface area", "aerodynamics"], safety=["Test in an open, familiar area.", "Keep builds away from roads and power lines."], hiddenSolution="wind vane", hints=["What could move when air pushes it?", "One part needs to catch the breeze. Which part should be bigger?", "Make the two ends different: a broad tail and a light pointer."], testProtocol=["Find somewhere you can feel the wind.", "Put your build down and watch whether it settles."], successCriteria=["The build rotates in moving air and settles with a consistent direction."]),
    _challenge(challengeTitle="Shadow Clock", mission="Use a shadow to tell which part of the day it is.", difficulty=2, minutes=20, requiresOutside=True, availableMaterials=["stick", "pencil", "stones", "chalk", "paper"], scienceConcepts=["Earth rotation", "sunlight", "shadows", "time"], safety=["Never look directly at the sun.", "Stay in a safe outdoor space."], hiddenSolution="sundial", hints=["What stays still while its shadow moves?", "Mark where the shadow points now.", "Return later and compare the direction and length."], testProtocol=["Place the upright object in sunlight.", "Mark its shadow, then compare after time passes."], successCriteria=["The shadow changes position predictably as time passes."]),
    _challenge(challengeTitle="Rain Measurer", mission="Make a tool that can compare how much rain falls.", difficulty=1, minutes=10, requiresOutside=True, availableMaterials=["bottle", "marker", "ruler", "tape"], scienceConcepts=["precipitation", "measurement", "scale"], safety=["Do not drink collected water.", "Place it away from traffic and drains."], hiddenSolution="rain gauge", hints=["What shape can catch and hold falling water?", "How could equal marks turn water height into a number?", "A level container makes comparisons fair."], testProtocol=["Place the container in an open area.", "Mark and compare the water level after rain."], successCriteria=["The tool collects water and gives repeatable level readings."]),
    _challenge(challengeTitle="Tree Height", mission="Estimate the height of a tree without climbing it.", difficulty=3, minutes=20, requiresOutside=True, availableMaterials=["stick", "pencil", "measuring tape", "stones"], scienceConcepts=["similar triangles", "geometry", "estimation"], safety=["Do not climb trees or enter roads.", "Keep a safe distance from the tree."], hiddenSolution="similar-triangle sighting tool", hints=["Can a small object copy the same angle as the tree?", "What distances can you measure safely from the ground?", "Compare the small triangle to the large one."], testProtocol=["Stand back and line up the stick with the tree.", "Measure your distance and use proportional reasoning."], successCriteria=["The estimate is close enough to check against a later measurement."]),
    _challenge(challengeTitle="Bridge Breaker", mission="Build a bridge that holds a target weight of coins.", difficulty=2, minutes=20, requiresOutside=False, availableMaterials=["paper", "cardboard", "tape", "coins"], scienceConcepts=["compression", "tension", "folding", "structures"], safety=["Use coins only as test weights.", "Keep fingers clear when testing collapse."], hiddenSolution="folded beam bridge", hints=["A flat sheet bends easily. What shape resists bending?", "Where should folds or supports go?", "Spread the load instead of placing it on one weak point."], testProtocol=["Span the gap with the bridge.", "Add one coin at a time and observe the first failure."], successCriteria=["The bridge holds the target number of coins for ten seconds."]),
    _challenge(challengeTitle="Sound Phone", mission="Send a voice several metres without electronics.", difficulty=1, minutes=15, requiresOutside=True, availableMaterials=["cups", "string", "tape"], scienceConcepts=["vibration", "sound waves", "tension"], safety=["Use soft cups and keep string away from necks.", "Do not use near roads or bikes."], hiddenSolution="cup-and-string telephone", hints=["Sound is a vibration. What could carry the vibration?", "What happens when the line is loose?", "Keep the path straight and the string tight."], testProtocol=["Stand a few metres apart.", "Speak into one cup while the other person listens."], successCriteria=["A short message can be understood across the line."]),
    _challenge(challengeTitle="Water Filter Experiment", mission="Compare how different layers change cloudy water.", difficulty=2, minutes=25, requiresOutside=False, availableMaterials=["bottle", "cloth", "gravel", "sand", "tape"], scienceConcepts=["filtration", "particle size", "observation"], safety=["EXPERIMENT WATER: DO NOT DRINK.", "Wash hands after handling the materials."], hiddenSolution="layered water filter", hints=["Which particles are larger, and which layer could catch them first?", "Try layers in a deliberate order.", "Compare the input and output, but do not call it safe water."], testProtocol=["Use muddy water made for the experiment.", "Compare clarity after passing through layers."], successCriteria=["The output looks different and the learner can explain why; it is never consumed."]),
    _challenge(challengeTitle="Paper Glider", mission="Make something that stays in the air as long as possible.", difficulty=1, minutes=15, requiresOutside=True, availableMaterials=["paper", "tape"], scienceConcepts=["lift", "drag", "weight", "iteration"], safety=["Throw only in a clear area.", "Never aim at people or animals."], hiddenSolution="paper glider", hints=["How can a fold make a surface meet the air?", "What happens when the front is too heavy?", "Change one fold at a time and compare flights."], testProtocol=["Choose a clear launch direction.", "Time three flights and compare one change."], successCriteria=["One version stays airborne longer than the first attempt."]),
]


def _matches(challenge: Challenge, materials: list[str]) -> bool:
    available = set(normalize_materials(materials))
    return len(set(challenge.availableMaterials) & available) >= 2


def rank_challenges(materials: list[str], limit: int = 3) -> list[Challenge]:
    normalized = normalize_materials(materials)
    properties = infer_properties(normalized)
    scored: list[tuple[int, Challenge]] = []
    forbidden = ("fire", "weapon", "mains", "dangerous chemical", "drink", "climb")
    eligible = [challenge for challenge in CURATED_CHALLENGES if _matches(challenge, normalized) and not any(word in " ".join(challenge.safety).lower() for word in forbidden)]
    for challenge in eligible or CURATED_CHALLENGES:
        material_score = len(set(challenge.availableMaterials) & set(normalized)) * 12
        property_score = len(properties & {"rigid", "flat", "connective", "container", "flexible", "hollow"}) * 2
        feasibility_score = 20 if _matches(challenge, normalized) else 0
        learning_score = len(challenge.scienceConcepts) * 2
        outdoor_score = 5 if challenge.requiresOutside else 2
        safety_score = 5 if challenge.safety else 0
        scored.append((material_score + property_score + feasibility_score + learning_score + outdoor_score + safety_score, challenge))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [challenge for _, challenge in scored[:limit]]