import json
from collections import defaultdict

dictionary = defaultdict(list)
word = None
data = {"l": []}
section = None
relation = None
relations = []
part_of_speech = {"n": "noun", "v": "verb", "a": "adjective", "b": "adverb"}
pos = None
variants = []


def save_word():
    global variants, data, section
    if "synonym" not in relations:
        relations.append("synonym")
    synonyms = [
        {"t": v["w"], "g": 2 + relations.index("synonym"), "s": v["s"]}
        for v in variants]

    definition = "; ".join(v["d"] for v in variants if "d" in v)

    for v in variants:
        if not definition:
            definition = "; ".join(v2["w"] for v2 in variants if v2["w"] != v["w"])
        data2 = dict(data)
        data2.update(v)
        del data2["w"]
        data2["d"] = definition
        data2["l"] = []
        for l in data["l"] + synonyms:
            if l["t"] == v["w"]:
                continue
            data2["l"].append("|".join(map(str, (l["g"], l["s"], l["t"]))))
        dictionary[v["w"]].append(data2)
    variants = []
    data = {"l": []}
    section = None
counter = 0
for line in open("kb73-utf8.txt", encoding="utf8"):
    line = line.strip()
    if len(line) == 0:
        continue
    if line[0] == "0" and len(variants) > 0:
        save_word()
        counter += 1
    elif line[0] == "2" and section == "VARIANTS":
        w = line[11:-1]
        variants.append({"w": w})
    elif line.startswith("1 PART_OF_SPEECH"):
        if line[18] in part_of_speech:
            data["p"] = part_of_speech[line[18]]
    elif line[0] == "1":
        section = line[2:]
    elif section == "INTERNAL_LINKS" and line.startswith("2 RELATION"):
        relation = line[12:-1]
    elif section == "INTERNAL_LINKS" and relation and line.startswith("4 LITERAL"):
        target = line[11:-1]
        if relation not in relations:
            relations.append(relation)
        data["l"].append({"t": target, "g": 2 + relations.index(relation)})
    elif "definition" not in data and line.startswith("3 DEFINITION"):
        variants[-1]["d"] = line[14:-1]
    elif "sense" not in data and line.startswith("3 SENSE"):
        variants[-1]["s"] = int(line[8:])
    elif relation and line.startswith("5 SENSE"):
        data["l"][-1]["s"] = int(line[8:])
save_word()

open("dictionary.txt", mode="w", encoding="utf8").write(json.dumps({"groups": relations, "data": dictionary}, ensure_ascii=False, indent=2))
print (counter)