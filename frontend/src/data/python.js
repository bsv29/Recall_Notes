export const PY = [
{id:"py-basics", t:"Basics & data types",
 hook:"Names point to objects. They’re labels, not boxes.",
 sum:"Python is interpreted, dynamically typed and strongly typed, and everything (numbers, functions, classes) is an object.",
 pts:[
  "**Interpreted:** source is compiled to bytecode (`.pyc`), then run by the Python Virtual Machine. No separate compile step.",
  "**Dynamically typed:** types are checked at runtime, so `x = 5` then `x = 'hi'` is fine.",
  "**Strongly typed:** `'5' + 5` raises `TypeError`; Python never mixes types silently.",
  "**Immutable:** `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`. **Mutable:** `list`, `dict`, `set`, `bytearray`.",
  "**Falsy values:** `False`, `None`, `0`, `0.0`, `''`, `[]`, `()`, `{}`, `set()`. Everything else is truthy.",
  "Prefer `isinstance(x, int)` over `type(x) == int`; it respects inheritance.",
  "`input()` always returns a `str`; `int(3.9)` truncates to `3`."
 ],
 code:`a = 10          # name a → int object 10
b = a           # b points to the same object
a += 1          # ints are immutable: a now points to 11
print(b)        # 10

print(bool([]), bool("0"))       # False True
print(type(True), True + True)   # <class 'bool'> 2`,
 traps:["`bool('False')` is `True`: any non-empty string is truthy.","`0.1 + 0.2 == 0.3` is `False` (floating-point error); use `math.isclose`."],
 cards:[
  ["Mutable vs immutable: give three of each.","Mutable: `list`, `dict`, `set`. Immutable: `int`, `str`, `tuple` (also `float`, `frozenset`)."],
  ["What does ‘dynamically typed’ mean?","The type belongs to the object and is checked at runtime; a name can point to any type."],
  ["Is Python compiled or interpreted?","Both: compiled to bytecode, which the Python Virtual Machine interprets."],
  ["What is `True + True`?","`2`, because `bool` is a subclass of `int`."]
 ],
 quiz:[
  ["What is `type((5))`?",["tuple","int","list","error"],1,"Parentheses alone don’t make a tuple; `(5,)` does."],
  ["Which of these can be a dict key?",["[1, 2]","{1: 2}","(1, 2)","{1, 2}"],2,"Keys must be hashable; a tuple of immutables is."],
  ["Output of `print(int('7') + 3.0)`?",["10","10.0","73","TypeError"],1,"int + float gives a float."]
 ]},
{id:"py-strings", t:"Strings",
 hook:"Strings never change. Every method hands you a new one.",
 sum:"Strings are immutable Unicode sequences with powerful slicing, methods and f-string formatting.",
 pts:[
  "Slicing `s[start:stop:step]`: stop is excluded; `s[::-1]` reverses.",
  "`s.split(',')` gives a list; `','.join(lst)` gives a string.",
  "`find` returns `-1` when missing; `index` raises `ValueError`.",
  "f-strings: `f'{x:.2f}'`, `f'{n:,}'`, and `f'{x=}'` for quick debugging.",
  "Build strings with `''.join(parts)`, not `+=` in a loop.",
  "Raw strings like `r'C:\\new'` ignore escape sequences; used for regex and Windows paths.",
  "`ord('A')` is `65`, `chr(65)` is `'A'`; `s.encode('utf-8')` gives `bytes`."
 ],
 code:`s = "PYTHON"
print(s[1:4], s[-1], s[::2])     # YTH N PTO
words = "a,b,c".split(",")       # ['a', 'b', 'c']
print("-".join(words))           # a-b-c
price = 1234.5
print(f"Rs {price:,.2f}")        # Rs 1,234.50`,
 traps:["`s[0] = 'J'` raises `TypeError`: strings are immutable.","`s.replace('a', 'b')` doesn’t change `s`; assign the result."],
 cards:[
  ["How do you reverse a string?","`s[::-1]`"],
  ["`find` vs `index`?","Both return the position; `find` gives `-1` if missing, `index` raises `ValueError`."],
  ["Why use `''.join()` instead of `+=` in a loop?","Strings are immutable, so `+=` builds a new string every time (O(n²)); `join` builds once."]
 ],
 quiz:[
  ["What is `'hello'[1:3]`?",["'he'","'el'","'ell'","'hel'"],1,"Indexes 1 and 2; 3 is excluded."],
  ["What does `'a-b'.split('-')` return?",["'ab'","['a', 'b']","('a', 'b')","['a-b']"],1,"`split` returns a list."],
  ["What is `len('naïve')`?",["5","6","4","error"],0,"Python counts Unicode characters, not bytes."]
 ]},
{id:"py-ds", t:"Lists, tuples, sets, dicts",
 hook:"Need order: list. Need fixed: tuple. Need unique: set. Need lookup: dict.",
 sum:"Pick the structure by what you need. Sets and dicts are hash tables, so lookups are O(1).",
 pts:[
  "**List:** ordered, mutable, duplicates allowed. `append` O(1), `insert(0, x)` O(n), `x in lst` O(n).",
  "**Tuple:** ordered, immutable, hashable if its items are; one element needs a comma: `(5,)`.",
  "**Set:** unique, unordered, O(1) membership; `a | b`, `a & b`, `a - b`, `a ^ b`.",
  "**Dict:** key → value, insertion-ordered since 3.7; `d.get(k, default)` avoids `KeyError`.",
  "`{}` is an empty dict; an empty set is `set()`.",
  "`collections`: `Counter`, `defaultdict`, `deque` (O(1) at both ends), `namedtuple`.",
  "`sort()` sorts in place and returns `None`; `sorted()` returns a new list (Timsort, stable, O(n log n))."
 ],
 code:`from collections import Counter, defaultdict, deque
nums = [3, 1, 3, 2]
print(sorted(set(nums)))                  # [1, 2, 3]
print(Counter("banana").most_common(1))   # [('a', 3)]
groups = defaultdict(list)
groups["even"].append(2)                  # no KeyError
q = deque([1, 2])
q.appendleft(0)                           # deque([0, 1, 2])`,
 traps:["`[[0] * 3] * 3` makes three references to the same row.","`lst = lst.sort()` sets `lst` to `None`."],
 cards:[
  ["`append` vs `extend`?","`append(x)` adds x as one item; `extend(it)` adds each item. `[1].append([2, 3])` gives `[1, [2, 3]]`."],
  ["Why is `x in set` O(1) but `x in list` O(n)?","Sets are hash tables: the hash jumps straight to the bucket. Lists are scanned item by item."],
  ["`remove` vs `pop` vs `del`?","`remove(x)` deletes by value; `pop(i)` by index and returns it; `del lst[i]` by index or slice and returns nothing."],
  ["When would you use a tuple over a list?","Fixed records, dict keys, function return values: immutable, lighter, hashable."]
 ],
 quiz:[
  ["What is `type({})`?",["set","dict","tuple","list"],1,"Empty braces make a dict."],
  ["`a = [1, 2]; b = a; b.append(3); print(a)`",["[1, 2]","[1, 2, 3]","[3]","error"],1,"`b` is the same list as `a`."],
  ["Best structure to check membership among 1 million IDs?",["list","tuple","set","str"],2,"O(1) hash lookup."]
 ]},
{id:"py-flow", t:"Control flow & comprehensions",
 hook:"A loop’s `else` means ‘no break happened’.",
 sum:"Branching, loops and comprehensions: the everyday building blocks, plus a few tricky operator rules.",
 pts:[
  "`for` works on any iterable; `enumerate()` gives index + value, `zip()` pairs sequences.",
  "`break` exits the loop, `continue` skips to the next iteration, `pass` does nothing.",
  "`for...else`: the `else` block runs only if the loop finished without `break`.",
  "Ternary: `a if cond else b`. The walrus `:=` assigns inside an expression.",
  "`and`/`or` short-circuit and return an operand: `0 or 5` is `5`.",
  "Comprehensions: `[f(x) for x in it if cond]`, plus dict `{k: v ...}`, set `{...}` and generator `(...)` forms.",
  "`/` always returns a float; `//` floors: `-7 // 2` is `-4`."
 ],
 code:`squares = [x * x for x in range(6) if x % 2 == 0]   # [0, 4, 16]
lengths = {name: len(name) for name in ["ann", "bob"]}
for i, v in enumerate(["a", "b"], start=1):
    print(i, v)
for n in [3, 5, 7]:
    if n % 2 == 0:
        break
else:
    print("no even number")      # runs: no break happened`,
 traps:["`-2 ** 2` is `-4`: `**` binds tighter than unary minus.","`round(2.5)` is `2`: Python rounds halves to the nearest even number."],
 cards:[
  ["When does a loop’s `else` block run?","Only when the loop finishes without hitting `break`."],
  ["What are `0 or 5` and `3 and 0`?","`5` and `0`: `or`/`and` return one of their operands."],
  ["List comprehension vs generator expression?","`[...]` builds the whole list in memory; `(...)` produces items lazily, one at a time."]
 ],
 quiz:[
  ["What is `-7 // 2`?",["-3","-4","-3.5","3"],1,"Floor division rounds toward negative infinity."],
  ["`[x for x in range(5) if x > 2]`",["[3, 4]","[2, 3, 4]","[3, 4, 5]","[0, 1, 2]"],0,"`range(5)` is 0 to 4."],
  ["`print(1 < 3 < 2)`",["True","False","error","None"],1,"Chained: `1 < 3 and 3 < 2`."]
 ]},
{id:"py-func", t:"Functions & scope",
 hook:"Defaults are made once. Never use a mutable default.",
 sum:"Functions are first-class objects with flexible arguments, LEGB scoping and closures.",
 pts:[
  "`*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict.",
  "Parameters after `*` are keyword-only; parameters before `/` are positional-only.",
  "Default values are evaluated once, at definition. Use `None` for mutable defaults.",
  "**LEGB** lookup order: Local, Enclosing, Global, Built-in. `global` and `nonlocal` allow reassignment.",
  "**Closure:** an inner function that remembers variables from its enclosing scope after it returns.",
  "Python passes object references: mutating an argument affects the caller; reassigning it doesn’t.",
  "`lambda x: x * 2` is a one-expression anonymous function; ideal as a `key=`."
 ],
 code:`def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

def multiplier(n):
    def inner(x):
        return x * n          # n is remembered (closure)
    return inner

triple = multiplier(3)
print(triple(5))                      # 15
print(sorted(["bb", "a"], key=len))   # ['a', 'bb']`,
 traps:["`def f(x, lst=[])` shares one list across every call.","`[lambda: i for i in range(3)]` all return `2` (late binding); fix with `lambda i=i: i`."],
 cards:[
  ["What are `*args` and `**kwargs`?","Extra positional arguments collected into a tuple, and extra keyword arguments collected into a dict."],
  ["Explain the LEGB rule.","Name lookup order: Local, Enclosing, Global, Built-in."],
  ["What is a closure?","A nested function that keeps access to the enclosing function’s variables after that function returns."],
  ["Is Python pass-by-value or pass-by-reference?","Pass by object reference: the function receives a reference to the same object."]
 ],
 quiz:[
  ["`def f(*a): return a` then `f(1, 2)`",["[1, 2]","(1, 2)","{1, 2}","1"],1,"`*args` is a tuple."],
  ["A function without `return` returns…",["0","an empty string","None","an error"],2,"An implicit `None`."],
  ["Which keyword reassigns an enclosing function’s variable?",["global","nonlocal","outer","static"],1,"`nonlocal`."]
 ]},
{id:"py-adv", t:"Iterators, generators, decorators",
 hook:"`yield` pauses, `return` ends. Decorators wrap without editing.",
 sum:"Lazy iteration saves memory; decorators add behaviour around a function without touching its code.",
 pts:[
  "An **iterable** has `__iter__`; an **iterator** has `__next__`, remembers its position and raises `StopIteration` at the end.",
  "**Generators** use `yield` to produce values lazily: constant memory, single pass.",
  "`map`, `filter` and `zip` return lazy iterators in Python 3.",
  "A **decorator** takes a function and returns a wrapped one: `@d` means `f = d(f)`.",
  "Use `@functools.wraps(func)` so the wrapper keeps the original name and docstring.",
  "`@functools.lru_cache` memoizes results. Recursion needs a base case (default limit about 1000)."
 ],
 code:`import functools, time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        out = func(*args, **kwargs)
        print(func.__name__, round(time.time() - start, 3))
        return out
    return wrapper

def batches(data, size):
    for i in range(0, len(data), size):
        yield data[i:i + size]

print(list(batches([1, 2, 3, 4, 5], 2)))   # [[1, 2], [3, 4], [5]]`,
 traps:["A generator is exhausted after one pass; a second loop over it yields nothing.","Forgetting `return out` in a wrapper makes the decorated function return `None`."],
 cards:[
  ["Generator vs list?","A list stores everything in memory; a generator yields one item at a time, on demand."],
  ["What does `@decorator` above `def f` mean?","`f = decorator(f)`."],
  ["Iterator vs iterable?","An iterable can produce an iterator (`__iter__`); an iterator gives the next value (`__next__`) and keeps state."]
 ],
 quiz:[
  ["`g = (x for x in [1, 2]); list(g); list(g)`: the second result is…",["[1, 2]","[]","None","an error"],1,"The generator is exhausted after one pass."],
  ["What keeps a decorated function’s `__name__`?",["@property","@functools.wraps","@staticmethod","@lru_cache"],1,"`wraps` copies the metadata."],
  ["`list(map(str, [1, 2]))`",["['1', '2']","[1, 2]","'12'","error"],0,"`map` applies `str` to each item."]
 ]},
{id:"py-oop", t:"Object-oriented programming",
 hook:"Class = blueprint, object = the thing built, `self` = this object.",
 sum:"Classes bundle data and behaviour. The four pillars are encapsulation, inheritance, polymorphism and abstraction.",
 pts:[
  "`__init__` initializes a new object; `self` refers to the current instance.",
  "Class variables are shared by all objects; instance variables (`self.x`) belong to one object.",
  "`@classmethod` receives `cls` (alternative constructors); `@staticmethod` receives nothing (utility function).",
  "**Encapsulation:** `_protected` by convention, `__private` via name mangling, `@property` for validated access.",
  "**Inheritance:** `class Dog(Animal)` plus `super().__init__()`; multiple inheritance follows the MRO (`Class.__mro__`).",
  "**Polymorphism:** method overriding and duck typing. Python has no true method overloading; the last definition wins.",
  "**Abstraction:** `abc.ABC` with `@abstractmethod` forces subclasses to implement methods.",
  "Dunder methods: `__str__`, `__repr__`, `__len__`, `__getitem__`, `__add__`, `__eq__`, `__call__`."
 ],
 code:`class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
    def speak(self):               # overriding
        return "Woof"
    def __repr__(self):
        return f"Dog({self.name!r})"

for a in [Animal("x"), Dog("Tommy", "Lab")]:
    print(a.speak())               # ... then Woof`,
 traps:["Forgetting `super().__init__()` skips the parent’s setup; in PyTorch’s `nn.Module` it crashes.","A mutable class variable (like a list) is shared by every instance."],
 cards:[
  ["Name the four pillars of OOP.","Encapsulation, inheritance, polymorphism, abstraction."],
  ["`@classmethod` vs `@staticmethod`?","A class method receives `cls` and can create instances; a static method receives nothing."],
  ["`__str__` vs `__repr__`?","`__str__` is readable, for users; `__repr__` is unambiguous, for developers, and the fallback for `str()`."],
  ["What is the MRO?","Method Resolution Order: the order Python searches classes for a method (C3 linearization)."]
 ],
 quiz:[
  ["Which dunder method makes `obj()` work?",["__init__","__call__","__new__","__run__"],1,"That’s why `model(x)` runs `forward` in PyTorch."],
  ["Two methods with the same name in one class:",["both are kept (overloading)","the last one wins","SyntaxError","the first one wins"],1,"Python has no method overloading."],
  ["`__private` attributes are…",["truly hidden","name-mangled to _Class__private","deleted after init","read-only"],1,"Name mangling, not real privacy."]
 ]},
{id:"py-errors", t:"Exceptions, files & context managers",
 hook:"`finally` always runs. `with` always cleans up.",
 sum:"Catch specific exceptions, read files safely, and guarantee cleanup with context managers.",
 pts:[
  "`try` → `except SpecificError` → `else` (runs if no error) → `finally` (always runs).",
  "Avoid a bare `except:`; it also catches `KeyboardInterrupt` and hides bugs.",
  "`raise` alone re-raises; `raise New(...) from e` chains; custom: `class MyError(Exception): pass`.",
  "**EAFP** (try and handle) is the Pythonic style; **LBYL** (check first) is the alternative.",
  "File modes: `r`, `w` (overwrites), `a`, `x` (create only), `b`, `+`. Loop over a file object to read big files line by line.",
  "Context managers implement `__enter__` and `__exit__`; `@contextmanager` builds one from a generator."
 ],
 code:`import json
try:
    with open("config.json", encoding="utf-8") as f:
        cfg = json.load(f)
except FileNotFoundError:
    cfg = {}
except json.JSONDecodeError as e:
    print("Bad JSON:", e)
else:
    print("Loaded", len(cfg), "keys")
finally:
    print("done")`,
 traps:["Opening with `'w'` erases the file immediately.","`assert` statements are removed when Python runs with `-O`; don’t use them for real validation."],
 cards:[
  ["Role of try / except / else / finally?","try: risky code. except: handle errors. else: runs if no error. finally: always runs."],
  ["What is a context manager?","An object used with `with` that guarantees setup and cleanup through `__enter__` and `__exit__`."],
  ["EAFP vs LBYL?","EAFP: try it and handle exceptions. LBYL: check conditions first. EAFP is idiomatic Python."]
 ],
 quiz:[
  ["The `finally` block runs…",["only on error","only without error","always","never after return"],2,"Even after a `return`."],
  ["Which file mode creates a file but fails if it exists?",["w","a","x","r+"],2,"Exclusive creation."],
  ["`torch.no_grad()` is used as a…",["class variable","context manager","exception","generator"],1,"It’s used with `with`."]
 ]},
{id:"py-memory", t:"Memory & internals",
 hook:"`==` asks ‘same value?’. `is` asks ‘same object?’.",
 sum:"References, copies, garbage collection and the GIL: the internals interviewers love to probe.",
 pts:[
  "`is` compares identity (same `id()`); use it only for `None`, `True` and `False`.",
  "`b = a` copies nothing. `a.copy()` or `a[:]` is shallow (nested objects shared). `copy.deepcopy` copies everything.",
  "Memory: a private heap; reference counting frees objects at zero references; a cyclic garbage collector handles reference cycles.",
  "**GIL:** only one thread runs Python bytecode at a time. Threads help I/O work; processes help CPU work.",
  "NumPy and PyTorch release the GIL inside their C/CUDA code.",
  "Hashable means a fixed hash plus equality; only hashable objects can be dict keys or set items.",
  "Small integers (-5 to 256) are cached, so never rely on `is` for numbers."
 ],
 code:`import copy
a = [[1, 2], [3, 4]]
b = a
c = a.copy()
d = copy.deepcopy(a)
a[0][0] = 99
print(b[0][0], c[0][0], d[0][0])   # 99 99 1
print(a == d, a is b)              # False True`,
 traps:["A shallow copy still shares inner lists.","`x == None` works, but `x is None` is the correct idiom."],
 cards:[
  ["Shallow vs deep copy?","Shallow: a new outer container sharing nested objects. Deep: everything copied recursively."],
  ["What is the GIL?","A lock in CPython that lets only one thread execute Python bytecode at a time."],
  ["How does Python free memory?","Reference counting (immediate) plus a generational cyclic garbage collector."]
 ],
 quiz:[
  ["CPU-heavy preprocessing in parallel: use…",["threading","multiprocessing","asyncio","a bigger loop"],1,"Separate processes, separate GILs."],
  ["`[1] == [1]` and `[1] is [1]`",["True True","True False","False False","False True"],1,"Equal values, different objects."],
  ["After `c = a.copy()` on a nested list, changing `a[0][0]`…",["doesn’t affect c","changes c too","raises an error","deletes c"],1,"A shallow copy shares the inner lists."]
 ]},
{id:"py-concurrency", t:"Concurrency",
 hook:"Waiting? Threads or async. Computing? Processes.",
 sum:"Choose threading, multiprocessing or asyncio based on whether the work is I/O-bound or CPU-bound.",
 pts:[
  "**Concurrency** is switching between tasks; **parallelism** is running them at the same time on several cores.",
  "`threading`: shared memory; best for I/O-bound work like API calls and downloads.",
  "`multiprocessing`: separate processes with separate GILs; best for CPU-bound work.",
  "`asyncio`: one thread, an event loop and `async`/`await`; thousands of concurrent I/O tasks (FastAPI uses it).",
  "`concurrent.futures` offers `ThreadPoolExecutor` and `ProcessPoolExecutor` with a simple `.map()`.",
  "**Race condition:** threads changing shared data at once; protect it with `threading.Lock()`.",
  "PyTorch’s `DataLoader(num_workers=4)` loads batches in parallel worker processes."
 ],
 code:`import asyncio

async def fetch(i):
    await asyncio.sleep(1)      # pretend network call
    return i * 2

async def main():
    results = await asyncio.gather(*(fetch(i) for i in range(5)))
    print(results)              # about 1 s total, not 5 s

asyncio.run(main())`,
 traps:["A blocking call like `time.sleep` inside `async` code freezes the whole event loop.","Threads don’t speed up pure-Python CPU work because of the GIL."],
 cards:[
  ["I/O-bound vs CPU-bound: which tool?","I/O-bound: threading or asyncio. CPU-bound: multiprocessing."],
  ["What does `await` do?","Pauses the coroutine until the awaited task finishes, letting the event loop run other tasks."],
  ["What is a race condition?","A bug where the result depends on the timing of threads accessing shared data."]
 ],
 quiz:[
  ["1,000 API calls at once: best fit?",["multiprocessing","asyncio","a for loop","recursion"],1,"I/O-bound and lightweight."],
  ["`asyncio.gather` runs coroutines…",["one after another","concurrently","in separate processes","on the GPU"],1,"Concurrently on the event loop."]
 ]}
];
