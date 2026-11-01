import { PY } from "./python.js";
import { PY_START, PY_DOCS } from "./python-lessons-1.js";
import "./python-lessons-2.js";

PY_DOCS["py-errors"] = [
 {h:"What an exception is", b:[
  "An **exception** is Python’s way of signalling that something went wrong at runtime. When one is raised, Python stops the current code and searches back up the call stack for a handler. If none is found, the program crashes and prints a traceback.",
  "All built-in exceptions form a hierarchy. Catching a parent class also catches its children:",
  {table:{head:["Class","Examples it covers"], rows:[["BaseException","everything, including KeyboardInterrupt and SystemExit"],["Exception","all normal errors (catch this, not BaseException)"],["ArithmeticError","ZeroDivisionError, OverflowError"],["LookupError","IndexError, KeyError"],["OSError","FileNotFoundError, PermissionError"],["ValueError / TypeError","bad value / wrong type"]]}}
 ]},
 {h:"try, except, else, finally", b:[
  {code:`def safe_divide(a, b):
    try:
        result = a / b                  # code that might fail
    except ZeroDivisionError:
        print("can't divide by zero")
        return None
    except TypeError as e:              # 'as e' gives you the exception object
        print("bad types:", e)
        return None
    else:
        print("no error")               # runs only if try succeeded
        return result
    finally:
        print("cleanup always runs")    # runs no matter what, even after return

print(safe_divide(10, 2))
print(safe_divide(1, 0))`, out:`no error
cleanup always runs
5.0
can't divide by zero
cleanup always runs
None`},
  {list:["**try:** the risky code. Keep it small so you only catch errors you expect.","**except:** handlers, checked top to bottom; put specific exceptions first. Catch several with `except (ValueError, TypeError):`.","**else:** code that should run only when nothing failed.","**finally:** cleanup that must always happen (closing connections, releasing locks)."]},
  {warn:"A bare `except:` also catches `KeyboardInterrupt` and hides real bugs. Catch the specific exceptions you can actually handle."}
 ]},
 {h:"Raising exceptions and custom errors", b:[
  "Use `raise` to signal a problem yourself. Inside an `except` block, a bare `raise` re-raises the current exception; `raise NewError(...) from e` chains them so the traceback shows both.",
  {code:`class InsufficientFunds(Exception):
    """Raised when a withdrawal exceeds the balance."""
    def __init__(self, needed):
        super().__init__(f"need {needed} more")
        self.needed = needed

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise InsufficientFunds(amount - balance)
    return balance - amount

try:
    withdraw(100, 150)
except InsufficientFunds as e:
    print("Error:", e, "| needed:", e.needed)`, out:`Error: need 50 more | needed: 50`},
  "Custom exceptions make errors meaningful to callers. Create a base exception for your app (e.g. `class AppError(Exception)`) and subclass it, so callers can catch all your errors at once."
 ]},
 {h:"EAFP vs LBYL", b:[
  "Two styles of handling missing data. **LBYL** (‘look before you leap’) checks first; **EAFP** (‘easier to ask forgiveness than permission’) just tries and handles the exception. EAFP is considered Pythonic and avoids race conditions (the file could disappear between the check and the open).",
  {code:`config = {"port": 8000}
# LBYL
if "host" in config:
    host = config["host"]
else:
    host = "localhost"
# EAFP
try:
    host = config["host"]
except KeyError:
    host = "localhost"
print(host)`, out:`localhost`},
  {tip:"`assert condition, \"message\"` is for catching programmer mistakes during development. Asserts are removed when Python runs with `-O`, so never use them to validate user input."}
 ]},
 {h:"Working with files", b:[
  "`open(path, mode, encoding=...)` returns a file object. Always use it in a `with` block: the file is closed automatically, even if an error occurs.",
  {table:{head:["Mode","Meaning"], rows:[["r","read (default); error if missing"],["w","write; creates the file or ERASES existing content"],["a","append to the end"],["x","create; error if it already exists"],["b","binary (rb, wb) for images, PDFs"],["+","read and write (r+)"]]}},
  {code:`from pathlib import Path

path = Path("notes.txt")
with open(path, "w", encoding="utf-8") as f:
    f.write("line one\\n")
    f.writelines(["line two\\n", "line three\\n"])

with open(path, encoding="utf-8") as f:
    for line in f:                 # memory-efficient: one line at a time
        print(line.rstrip())

print(path.exists(), path.suffix, path.read_text(encoding="utf-8").count("\\n"))`, out:`line one
line two
line three
True .txt 3`},
  "`f.read()` returns the whole file as one string, `f.readline()` one line, and `f.readlines()` a list of lines. For big files, loop over the file object instead.",
  {sub:"JSON and CSV"},
  {code:`import json, csv

data = {"name": "Ann", "skills": ["python", "sql"]}
with open("user.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
with open("user.json", encoding="utf-8") as f:
    print(json.load(f)["skills"])

with open("scores.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerow({"name": "Ann", "score": 91})
with open("scores.csv", encoding="utf-8") as f:
    print(list(csv.DictReader(f)))`, out:`['python', 'sql']
[{'name': 'Ann', 'score': '91'}]`},
  {warn:"CSV values always come back as strings (`'91'`), so convert them yourself."}
 ]},
 {h:"Context managers", b:[
  "A context manager sets something up when a `with` block starts and guarantees cleanup when it ends, even after an exception. It’s any object with `__enter__` and `__exit__`. The easy way to write one is `contextlib.contextmanager`:",
  {code:`from contextlib import contextmanager
import time

@contextmanager
def timed(label):
    start = time.perf_counter()
    try:
        yield                       # the body of the with-block runs here
    finally:
        print(f"{label}: {time.perf_counter() - start:.2f}s")

with timed("loading"):
    time.sleep(0.2)`, out:`loading: 0.20s`},
  "Built-in examples: files, `threading.Lock()`, database connections, `decimal.localcontext()`, and `torch.no_grad()`."
 ]}
];

const PY_MODULES = {id:"py-modules", t:"Modules, packages & environments", lvl:"I",
 hook:"A module is a file, a package is a folder, a venv is a sandbox.",
 sum:"Organize code across files, install third-party libraries safely, and structure a real project.",
 pts:[
  "A **module** is a `.py` file; a **package** is a folder of modules (usually with `__init__.py`).",
  "`import x`, `from x import y`, `import numpy as np`; avoid `from x import *`.",
  "Python finds modules through `sys.path` and runs each module only once, caching it in `sys.modules`.",
  "`if __name__ == \"__main__\":` runs code only when the file is executed directly, not when imported.",
  "Virtual environments (`python -m venv .venv`) isolate each project’s packages.",
  "`pip install`, `pip freeze > requirements.txt`, `pip install -r requirements.txt`."
 ],
 code:`# utils.py
def slugify(text):
    return "-".join(text.lower().split())

if __name__ == "__main__":       # only when run directly
    print(slugify("Hello World"))

# main.py
from utils import slugify
print(slugify("Recall App"))     # recall-app`,
 traps:["Naming your file `random.py` or `json.py` shadows the standard library module.","Installing packages globally instead of in a venv causes version conflicts between projects."],
 cards:[["Module vs package?","A module is one .py file; a package is a directory of modules."],["What does `if __name__ == \"__main__\":` do?","Runs that block only when the file is executed directly, not when imported."],["Why use a virtual environment?","To give each project its own isolated set of package versions."]],
 quiz:[["How many times does a module’s top-level code run when imported twice?",["twice","once","never","each call"],1,"Modules are cached in sys.modules."],["Command to save installed packages:",["pip list > req","pip freeze > requirements.txt","pip save","python -m venv"],1,"pip freeze."]],
 vis:{type:"tree", root:"my_project/", kids:[{n:"app/ (package)", k:["__init__.py","models.py","services.py"]},{n:"tests/", k:["test_models.py"]},{n:"config files", k:["requirements.txt",".venv/ (not committed)"]}]},
 prac:[{type:"order", lines:["python -m venv .venv","source .venv/bin/activate","pip install fastapi","pip freeze > requirements.txt"], explain:"Create the environment, activate it, install packages, then record them."}],
 doc:[
  {h:"Modules and import styles", b:[
   "Any `.py` file is a **module**. Importing it runs the file once and gives you access to its names. There are several ways to import, each with a purpose:",
   {code:`import math                     # use as math.sqrt
from math import sqrt, pi       # bring specific names in
import numpy as np              # alias (community conventions: np, pd, plt)
from collections import Counter as C

print(math.floor(2.7), sqrt(16), round(pi, 2))`, out:`2 4.0 3.14`},
   {warn:"`from module import *` dumps every public name into your file, hides where names come from and can silently overwrite your own variables. Avoid it."}
  ]},
  {h:"How Python finds and loads modules", b:[
   "On `import x`, Python first checks the cache `sys.modules`. If `x` isn’t there, it searches the folders in `sys.path` in order: the script’s own folder, the `PYTHONPATH` folders, the standard library, then `site-packages` (installed packages). The first match wins.",
   "The module’s top-level code runs **once**, and the module object is cached. Importing it again anywhere in the program just reuses the cached object.",
   {code:`import sys
print(sys.path[0])                 # folder of the running script
import json
print("json" in sys.modules)`, out:`/home/bsv/projects/recall
True`},
   {warn:"If you name your own file `random.py`, then `import random` finds YOUR file first (it’s earlier in sys.path) and the standard library module becomes unreachable."}
  ]},
  {h:"Packages and project layout", b:[
   "A **package** is a folder of modules. An `__init__.py` file marks it as a regular package and runs when the package is imported; it can be empty or expose a clean API.",
   {code:`shop/
├── __init__.py          # from .cart import Cart  (re-export)
├── cart.py
├── payments/
│   ├── __init__.py
│   └── upi.py
└── utils.py`, out:``},
   {code:`from shop.cart import Cart            # absolute import (preferred)
from shop.payments.upi import pay
# inside shop/cart.py, a relative import:
from .utils import format_price
from ..config import TAX_RATE          # one level up`, out:``},
   {tip:"Use absolute imports in application code; relative imports are fine inside a package. Relative imports only work when the file is imported as part of a package, not when run directly as a script."}
  ]},
  {h:"The __name__ == \"__main__\" guard", b:[
   "Every module has a `__name__`. When you run a file directly, Python sets it to `\"__main__\"`; when the file is imported, `__name__` is the module’s name. The guard lets one file be both an importable library and a runnable script.",
   {code:`# train.py
def train(epochs):
    print(f"training for {epochs} epochs")

def main():
    train(10)

if __name__ == "__main__":
    main()          # runs on: python train.py
                    # does NOT run on: from train import train`, out:`training for 10 epochs`}
  ]},
  {h:"pip and virtual environments", b:[
   "**pip** installs packages from PyPI. A **virtual environment** is a project-specific folder with its own Python and packages, so project A can use Django 4 while project B uses Django 5.",
   {code:`python -m venv .venv                 # create
source .venv/bin/activate            # activate (Windows: .venv\\Scripts\\activate)
pip install fastapi "pandas>=2.2"    # install (with a version constraint)
pip list                             # what's installed
pip freeze > requirements.txt        # record exact versions
deactivate                           # leave the venv

# on another machine or in Docker:
pip install -r requirements.txt`, out:``},
   {list:["Add `.venv/` to `.gitignore`; commit `requirements.txt` instead.","Pin versions for reproducible builds.","Other tools you’ll meet: `conda` (common in data science, handles CUDA and C libraries), `poetry` and `uv` (dependency management and lock files)."]}
  ]},
  {h:"Standard library tour", b:[
   "Python ships with ‘batteries included’. Know these before installing anything:",
   {table:{head:["Module","Use it for"], rows:[["os, pathlib, shutil","files, folders, paths"],["sys","interpreter info, argv, exit"],["json, csv, pickle","data formats"],["datetime, time","dates, durations, timing"],["re","regular expressions"],["math, random, statistics","numbers"],["collections, itertools, functools","data structures and functional tools"],["logging","proper logs instead of print"],["argparse","command-line arguments"],["typing, dataclasses","type hints and data classes"],["concurrent.futures, asyncio, threading","concurrency"],["unittest (and pytest, third-party)","testing"]]}}
  ]}
 ]};

PY_DOCS["py-memory"] = [
 {h:"Identity vs equality", b:[
  "`==` asks whether two objects have **equal values** (it calls `__eq__`). `is` asks whether two names point to the **same object** (same `id`).",
  {code:`a = [1, 2]
b = [1, 2]
c = a
print(a == b, a is b)    # equal values, different objects
print(a is c)            # same object
x = None
print(x is None)         # the right way to test for None`, out:`True False
True
True`},
  "CPython caches small integers (−5 to 256) and some strings, so `is` can appear to work on numbers. That’s an implementation detail; never use `is` to compare numbers or strings.",
  {code:`a = 256; b = 256
print(a is b)            # True: cached
a = 257; b = 257
print(a == b)            # always use ==`, out:`True
True`}
 ]},
 {h:"Assignment, shallow copy and deep copy", b:[
  "Assignment never copies; it only adds another name. To get independent data you must copy, and the depth of the copy matters for nested structures.",
  {code:`import copy
original = [[1, 2], [3, 4]]
alias = original                 # same object
shallow = original.copy()        # new outer list, SAME inner lists
deep = copy.deepcopy(original)   # everything copied

original[0][0] = 99
original.append([5])
print(alias)
print(shallow)
print(deep)`, out:`[[99, 2], [3, 4], [5]]
[[99, 2], [3, 4]]
[[1, 2], [3, 4]]`},
  {table:{head:["Way","New outer object?","New inner objects?"], rows:[["b = a","no","no"],["a.copy(), list(a), a[:], copy.copy(a)","yes","no (shared)"],["copy.deepcopy(a)","yes","yes"]]}},
  {tip:"The shallow copy didn’t get `[5]` (its outer list is separate) but did see `99` (the inner list is shared). Explaining exactly this output is a classic interview answer."}
 ]},
 {h:"How arguments are passed", b:[
  "Python passes **references to objects** (often called ‘pass by object reference’ or ‘pass by assignment’). The parameter becomes a new name for the same object. So **mutating** the object is visible to the caller, but **rebinding** the parameter is not.",
  {code:`def mutate(lst):
    lst.append(4)          # changes the caller's list

def rebind(lst):
    lst = [0]              # only changes the local name

nums = [1, 2, 3]
mutate(nums)
rebind(nums)
print(nums)`, out:`[1, 2, 3, 4]`},
  "Immutable arguments (ints, strings, tuples) can’t be mutated, so they behave like ‘pass by value’ in practice."
 ]},
 {h:"Memory management and garbage collection", b:[
  "Every Python object lives on a private **heap** managed by the interpreter. CPython frees memory mainly with **reference counting**: each object tracks how many references point to it, and when the count drops to zero it’s freed immediately.",
  {code:`import sys
data = []
print(sys.getrefcount(data))    # +1 for the temporary argument
alias = data
print(sys.getrefcount(data))
del alias                       # removes a name, not the object`, out:`2
3`},
  "Reference counting can’t free **cycles** (A points to B, B points to A, nothing else points to either). A separate, generational **garbage collector** (the `gc` module) periodically finds and frees those.",
  {sub:"Hashability"},
  "An object is **hashable** if it has a hash that never changes during its lifetime and can be compared with `==`. Hashable objects can be dict keys and set members. Immutable built-ins are hashable; lists, dicts and sets are not. Tuples are hashable only if everything inside them is."
 ]},
 {h:"The GIL", b:[
  "CPython has a **Global Interpreter Lock (GIL)**: only one thread executes Python bytecode at a time. It keeps reference counting thread-safe and simple, at a cost: threads can’t run pure-Python CPU work in parallel on multiple cores.",
  {list:["**I/O-bound work** (network, disk, waiting) still benefits from threads, because a thread releases the GIL while it waits.","**CPU-bound work** in pure Python needs `multiprocessing` (separate processes, each with its own GIL).","**NumPy, PyTorch and other C extensions** release the GIL during heavy computations, so they do use multiple cores.","Python 3.13 added an optional experimental ‘free-threaded’ build without the GIL; the default build still has it."]}
 ]}
];

PY_DOCS["py-concurrency"] = [
 {h:"Concurrency vs parallelism", b:[
  "**Concurrency** means making progress on several tasks by switching between them (one cook juggling three pans). **Parallelism** means literally running tasks at the same time on multiple cores (three cooks).",
  "The right tool depends on what your program waits for:",
  {table:{head:["Workload","Bottleneck","Use"], rows:[["I/O-bound","waiting on network, disk, database","threading or asyncio"],["CPU-bound","calculations in Python","multiprocessing"],["Many thousands of network calls","waiting, at huge scale","asyncio"],["Heavy numeric work","math","NumPy/PyTorch (C code, releases the GIL)"]]}}
 ]},
 {h:"Threads", b:[
  "Threads share the same memory, which makes data sharing easy and also dangerous. Here 5 downloads that each wait 1 second finish in about 1 second instead of 5:",
  {code:`import threading, time

def download(i):
    time.sleep(1)                    # pretend network wait (releases the GIL)
    print(f"file {i} done")

start = time.perf_counter()
threads = [threading.Thread(target=download, args=(i,)) for i in range(5)]
for t in threads: t.start()
for t in threads: t.join()           # wait for all to finish
print(f"total {time.perf_counter() - start:.1f}s")`, out:`file 0 done
file 2 done
file 1 done
file 4 done
file 3 done
total 1.0s`},
  {sub:"Race conditions and locks"},
  "When several threads read and update the same data, updates can interleave and get lost. A `Lock` lets only one thread run a critical section at a time:",
  {code:`counter = 0
lock = threading.Lock()

def work():
    global counter
    for _ in range(100_000):
        with lock:                   # without the lock, the total can come up short
            counter += 1

ts = [threading.Thread(target=work) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print(counter)`, out:`400000`}
 ]},
 {h:"Processes", b:[
  "`multiprocessing` starts separate Python processes, each with its own memory and its own GIL, so CPU-heavy work really runs in parallel. Data passed between processes is pickled (copied), which has overhead.",
  {code:`from concurrent.futures import ProcessPoolExecutor

def heavy(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":           # required on Windows and macOS
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(heavy, [10**6, 10**6, 10**6, 10**6]))
    print(len(results))`, out:`4`},
  {tip:"`concurrent.futures` gives the same simple interface for both: `ThreadPoolExecutor` for I/O, `ProcessPoolExecutor` for CPU. Swap one for the other with a one-word change."}
 ]},
 {h:"asyncio: async and await", b:[
  "`asyncio` runs many tasks concurrently in **one thread** using an **event loop**. An `async def` function is a coroutine; `await` pauses it until a slow operation finishes, letting the loop run other coroutines meanwhile. This scales to thousands of connections, which is why FastAPI uses it.",
  {code:`import asyncio, time

async def fetch(i):
    await asyncio.sleep(1)           # non-blocking wait
    return f"result {i}"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(*(fetch(i) for i in range(5)))
    print(results)
    print(f"took {time.perf_counter() - start:.1f}s")

asyncio.run(main())`, out:`['result 0', 'result 1', 'result 2', 'result 3', 'result 4']
took 1.0s`},
  {warn:"Calling a blocking function such as `time.sleep()` or a synchronous database driver inside a coroutine freezes the whole event loop. Use `await asyncio.sleep()`, async libraries (httpx, asyncpg), or `asyncio.to_thread()` for blocking code."}
 ]},
 {h:"Choosing in practice", b:[
  {list:["Calling 50 APIs: `ThreadPoolExecutor` (simple) or `asyncio` + `httpx` (scales further).","Resizing 10,000 images in Python: `ProcessPoolExecutor`.","A web API: an async framework like FastAPI, with `async def` routes for I/O.","Training a model: PyTorch handles parallelism; `DataLoader(num_workers=4)` uses worker processes to load data."]},
  {tip:"Measure before optimizing. `time.perf_counter()` and `cProfile` show where the time actually goes."}
 ]}
];

/* attach lessons, add the two new levels, and order the course from scratch to advanced */
(function(){
  const order = ["py-start", "py-basics", "py-strings", "py-flow", "py-ds", "py-func", "py-adv", "py-oop", "py-errors", "py-modules", "py-memory", "py-concurrency"];
  const lvl = {"py-start":"B", "py-basics":"B", "py-strings":"B", "py-flow":"B", "py-ds":"B", "py-func":"I", "py-adv":"I", "py-oop":"I", "py-errors":"I", "py-modules":"I", "py-memory":"A", "py-concurrency":"A"};
  const byId = {};
  PY.concat([PY_START, PY_MODULES]).forEach(t => { byId[t.id] = t; });
  PY.length = 0;
  order.forEach(id => { const t = byId[id]; if (!t) return; if (PY_DOCS[id]) t.doc = PY_DOCS[id]; t.lvl = lvl[id]; PY.push(t); });
})();
