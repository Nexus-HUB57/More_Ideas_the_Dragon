
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160

# Wordlist extraída do script test_user_logic.py
user_wordlist = [
    "like", "just", "love", "know", "never", "want", "time", "out", "there",
    "make", "look", "eye", "down", "only", "think", "heart", "back", "then",
    "into", "about", "more", "away", "still", "them", "take", "thing", "even",
    "through", "long", "always", "world", "too", "friend", "tell", "try",
    "hand", "thought", "part", "some", "new", "little", "man", "one", "good",
    "give", "inside", "without", "see", "work", "again", "away", "another",
    "day", "must", "now", "come", "where", "after", "much", "said", "first",
    "right", "way", "before", "find", "life", "call", "here", "every", "old",
    "around", "need", "something", "last", "feel", "when", "never", "say",
    "what", "well", "people", "over", "own", "house", "between", "turn",
    "mean", "keep", "many", "help", "home", "because", "place", "while",
    "three", "believe", "seem", "next", "another", "same", "word", "show",
    "under", "each", "other", "form", "second", "another", "new", "year",
    "different", "name", "good", "sentence", "man", "think", "say", "great",
    "where", "help", "through", "much", "before", "line", "right", "too",
    "mean", "old", "any", "same", "tell", "boy", "follow", "came", "want",
    "show", "also", "around", "form", "three", "small", "set", "put", "end",
    "does", "another", "well", "large", "must", "big", "even", "such",
    "because", "turn", "here", "why", "ask", "went", "men", "read", "need",
    "land", "different", "home", "us", "move", "try", "kind", "hand", "picture",
    "again", "change", "off", "play", "spell", "air", "away", "animal", "house",
    "point", "page", "letter", "mother", "answer", "found", "study", "still",
    "learn", "should", "America", "world", "high", "every", "near", "add",
    "food", "between", "own", "below", "country", "plant", "last", "school",
    "father", "keep", "tree", "never", "start", "city", "earth", "eye", "light",
    "thought", "head", "under", "story", "saw", "left", "don't", "few", "while",
    "along", "might", "close", "something", "seem", "next", "hard", "open",
    "example", "begin", "life", "always", "those", "both", "paper", "together",
    "got", "group", "often", "run", "important", "until", "children", "side",
    "feet", "car", "mile", "night", "walk", "white", "sea", "began", "grow",
    "took", "river", "four", "carry", "state", "once", "book", "hear", "stop",
    "without", "second", "late", "miss", "idea", "enough", "eat", "face",
    "watch", "far", "Indian", "real", "almost", "let", "above", "girl",
    "sometimes", "mountain", "cut", "young", "talk", "soon", "list", "song",
    "being", "leave", "family", "it's", "body", "music", "color", "stand",
    "sun", "question", "fish", "area", "mark", "dog", "horse", "bird", "problem",
    "complete", "room", "knew", "since", "ever", "piece", "told", "usually",
    "didn't", "friend", "easy", "heard", "order", "red", "door", "sure",
    "become", "top", "ship", "across", "today", "during", "short", "better",
    "best", "however", "low", "hour", "black", "product", "happen", "whole",
    "measure", "remember", "early", "wave", "reach", "listen", "wind", "rock",
    "space", "cover", "fast", "several", "hold", "himself", "toward", "five",
    "step", "morning", "pass", "vowel", "true", "hundred", "against", "pattern",
    "numeral", "table", "north", "slow", "money", "map", "farm", "pull", "draw",
    "voice", "seen", "cold", "cry", "plan", "notice", "south", "sing", "war",
    "ground", "fall", "king", "town", "I'll", "unit", "figure", "certain",
    "field", "travel", "wood", "fire", "upon", "done", "English", "road", "halt",
    "ten", "fly", "give", "box", "finally", "wait", "correct", "oh", "quickly",
    "person", "become", "shown", "minute", "strong", "verb", "star", "front",
    "feel", "fact", "inch", "street", "decide", "contain", "course", "surface",
    "produce", "building", "ocean", "class", "note", "nothing", "rest",
    "carefully", "scientist", "inside", "wheel", "stay", "green", "known",
    "island", "week", "less", "machine", "base", "ago", "stand", "plane",
    "system", "behind", "ran", "round", "boat", "game", "force", "bring",
    "understand", "warm", "common", "bring", "explain", "dry", "though",
    "language", "shape", "deep", "thousand", "yes", "clear", "equation", "yet",
    "government", "fill", "heat", "full", "hot", "check", "object", "am",
    "rule", "among", "noun", "power", "cannot", "able", "six", "size", "dark",
    "ball", "material", "special", "heavy", "fine", "pair", "circle", "include",
    "built", "can't", "matter", "square", "syllable", "perhaps", "bill",
    "felt", "suddenly", "test", "direction", "center", "farmer", "ready",
    "anything", "divide", "general", "energy", "subject", "Europe", "moon",
    "region", "return", "believe", "dance", "member", "pick", "simple", "cell",
    "paint", "mind", "love", "cause", "rain", "exercise", "egg", "train", "blue",
    "wish", "drop", "develop", "window", "different", "distance", "heart",
    "sit", "sum", "summer", "wall", "forest", "probably", "leg", "sat",
    "main", "winter", "wide", "written", "length", "reason", "keep", "interest",
    "arm", "brother", "race", "present", "beautiful", "store", "job", "edge",
    "past", "sign", "record", "finish", "discover", "wild", "happy", "beside",
    "gone", "sky", "glass", "million", "west", "lay", "weather", "root",
    "instrument", "meet", "third", "month", "paragraph", "raise", "represent",
    "soft", "whether", "cloth", "flower", "shall", "teacher", "drive", "cross",
    "speak", "solve", "appear", "metal", "son", "either", "ice", "sleep",
    "village", "factor", "result", "jump", "snow", "ride", "care", "floor",
    "hill", "push", "baby", "buy", "century", "outside", "everything", "tall",
    "already", "instead", "phrase", "soil", "bed", "copy", "free", "hope",
    "spring", "case", "laugh", "nation", "quite", "type", "themselves",
    "temperature", "bright", "lead", "everyone", "method", "section", "lake",
    "iron", "within", "dictionary", "hair", "age", "amount", "scale", "pound",
    "although", "per", "broken", "moment", "tiny", "possible", "gold", "milk",
    "quiet", "natural", "lot", "stone", "act", "build", "middle", "speed",
    "count", "consonant", "someone", "sail", "roll", "bear", "wonder", "smile",
    "angle", "fraction", "Africa", "kill", "melody", "bottom", "trip", "hole",
    "poor", "let's", "fight", "surprise", "French", "die", "beat", "exactly",
    "remain", "dress", "cat", "couldn't", "finger", "spread", "clear",
    "wire", "lost", "brown", "wear", "garden", "equal", "sent", "choose",
    "fell", "fit", "flow", "fair", "bank", "collect", "save", "control",
    "decimal", "gentle", "woman", "captain", "practice", "separate",
    "difficult", "doctor", "please", "protect", "noon", "whose", "locate",
    'ring', 'character', 'insect', 'caught', 'period', 'indicate', 'radio',
    'spoke', 'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop',
    'modern', 'element', 'hit', 'student', 'corner', 'party', 'supply', 'bone',
    'rail', 'imagine', 'provide', 'agree', 'thus', 'capital', 'won\'t', 'chair',
    'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate',
    'guess', 'necessary', 'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat',
    'rather', 'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend',
    'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin',
    'triangle', 'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie',
    'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun', 'allow', 'print',
    'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'continue',
    'block', 'chart', 'hat', 'sell', 'success', 'company', 'subtract', 'event',
    'particular', 'deal', 'swim', 'term', 'opposite', 'wife', 'shoe', 'shoulder',
    'spread', 'arrange', 'camp', 'invent', 'cotton', 'born', 'determine', 'quart',
    'nine', 'truck', 'noise', 'level', 'chance', 'gather', 'shop', 'stretch',
    'throw', 'shine', 'property', 'column', 'molecule', 'select', 'wrong', 'gray',
    'repeat', 'require', 'broad', 'prepare', 'salt', 'nose', 'plural', 'anger',
    'claim', 'continent', 'oxygen', 'sugar', 'death', 'pretty', 'skill', 'women',
    'season', 'solution', 'magnet', 'silver', 'thank', 'branch', 'match', 'suffix',
    'especially', 'fig', 'afraid', 'huge', 'sister', 'steel', 'discuss', 'forward',
    'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'led', 'pitch',
    'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening',
    'condition', 'feed', 'tool', 'total', 'basic', 'smell', 'valley', 'nor',
    'double', 'seat', 'arrive', 'master', 'track', 'parent', 'shore', 'division',
    'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat',
    'glad', 'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper',
    'bar', 'offer', 'segment', 'slave', 'duck', 'instant', 'market', 'degree',
    'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support',
    'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log',
    'meant', 'quotient', 'teeth', 'shell', 'neck'
]

def sha256(x):
    return hashlib.sha256(x).digest()

def Hash(x):
    return sha256(sha256(x))

def ripemd160(x):
    h = RIPEMD160.new()
    h.update(x)
    return h.digest()

def hash_160(public_key):
    return ripemd160(sha256(public_key))

def hash_160_to_bc_address(h160, addrtype=0):
    vh160 = bytes([addrtype]) + h160
    h = Hash(vh160)
    addr = vh160 + h[0:4]
    return base58.b58encode(addr).decode('utf-8')

def stretch_key(seed):
    oldseed = seed
    for i in range(100000):
        seed = hashlib.sha256(seed + oldseed).digest()
    return string_to_number(seed)

def get_sequence(mpk, for_change, n):
    msg = ("%d:%d:" % (n, for_change)).encode('utf-8') + mpk
    return string_to_number(Hash(msg))

def recover():
    target_address = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    phrase_11 = "fly come chick true clear another king fear raise third down"
    words_11 = phrase_11.split()
    
    # Verificar se todas as palavras estão na wordlist
    for w in words_11:
        if w not in user_wordlist:
            print(f"Erro: Palavra '{w}' não está na wordlist do usuário.")
            return

    print(f"Iniciando busca exaustiva para a 12ª palavra usando wordlist do usuário...")
    
    for i, word in enumerate(user_wordlist):
        if i % 50 == 0:
            print(f"Progresso: {i}/{len(user_wordlist)} palavras testadas...", flush=True)
        
        full_phrase = words_11 + [word]
        
        n = len(user_wordlist)
        out = 0
        for w in reversed(full_phrase):
            out = out * n + user_wordlist.index(w)
        
        seed_hex = hex(out)[2:].rstrip('L')
        if len(seed_hex) % 2 != 0: seed_hex = '0' + seed_hex
        seed_bytes = bytes.fromhex(seed_hex)
        
        secexp = stretch_key(seed_bytes)
        master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
        mpk = master_private_key.get_verifying_key().to_string()
        order = SECP256k1.generator.order()

        for for_change in [0, 1]:
            for n_idx in range(10):
                z = get_sequence(mpk, for_change, n_idx)
                child_secexp = (secexp + z) % order
                sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
                vk = sk.get_verifying_key()
                
                pubkey = b'\x04' + vk.to_string()
                address = hash_160_to_bc_address(hash_160(pubkey))
                
                if address == target_address:
                    print(f"\n[!!!] SUCESSO ENCONTRADO!")
                    print(f"12ª Palavra: {word}")
                    print(f"Frase completa: {' '.join(full_phrase)}")
                    
                    priv_key_bytes = child_secexp.to_bytes(32, byteorder='big')
                    fullkey = b'\x80' + priv_key_bytes
                    sha256_1 = hashlib.sha256(fullkey).digest()
                    sha256_2 = hashlib.sha256(sha256_1).digest()
                    wif = base58.b58encode(fullkey + sha256_2[:4]).decode('utf-8')
                    print(f"Chave Privada (WIF): {wif}")
                    return

if __name__ == "__main__":
    recover()
