/* Full Python lessons: scratch to advanced. Each section is a list of blocks:
   "text" = paragraph, {sub} = small heading, {code, out} = example with output,
   {tip} / {warn} = callouts, {list} = bullet list, {table:{head, rows}} = table. */

export const PY_START = {id:"py-start", t:"Getting started with Python", lvl:"B",
 hook:"Python reads like English: indentation is the grammar.",
 sum:"What Python is, how your code actually runs, and how to write, run and read your first programs.",
 pts:[
  "Python is a high-level, interpreted, general-purpose language used for web backends, automation, data analysis and AI.",
  "CPython compiles your `.py` file to bytecode, and the Python Virtual Machine runs that bytecode.",
  "Run code in the interactive shell (REPL), as a script (`python app.py`), or in a Jupyter notebook.",
  "Indentation (4 spaces) defines blocks; a colon `:` starts a block.",
  "`print()` shows output; `input()` reads text from the keyboard and always returns a `str`.",
  "Read error messages from the bottom line up: the last line names the error type."
 ],
 code:`name = input("Your name: ")       # input always returns a string
age = int(input("Your age: "))     # convert to int before doing math
print("Hello,", name)
print(f"Next year you will be {age + 1}")`,
 traps:["Mixing tabs and spaces causes `IndentationError` or `TabError`.","`input()` returns a string, so `input() + 1` raises `TypeError`."],
 cards:[["How does Python run your code?","CPython compiles source to bytecode, and the Python Virtual Machine executes the bytecode."],["What defines a block in Python?","Indentation after a line ending with a colon."],["What type does input() return?","Always `str`."]],
 quiz:[["What does `print(1, 2, sep='-')` print?",["1 2","1-2","12","1,2"],1,"`sep` is placed between the values."],["Which error does bad indentation raise?",["NameError","IndentationError","TypeError","ValueError"],1,"IndentationError (a subclass of SyntaxError)."]],
 vis:{type:"flow", steps:["hello.py (source)","CPython compiler","Bytecode (.pyc)","Python Virtual Machine","Output"]},
 prac:[{type:"predict", code:"print(\"a\", \"b\", sep=\"\", end=\"!\")", answer:["ab!"], explain:"`sep=\"\"` removes the space and `end=\"!\"` replaces the newline."}],
 doc:[
  {h:"What Python is and why it’s everywhere", b:[
   "Python is a **high-level** language, which means you write instructions close to plain English and Python handles details like memory management for you. It’s **general-purpose**: the same language builds websites (Django, FastAPI), automates boring tasks, analyses data (Pandas, NumPy) and trains AI models (PyTorch, scikit-learn).",
   "Python is popular because the syntax is short and readable, the standard library covers most everyday needs, and there is a package for almost everything on PyPI (the Python Package Index). The trade-off is speed: pure Python is slower than C or Java, which is why heavy number-crunching libraries like NumPy are written in C underneath.",
   {table:{head:["Area","What Python is used for","Key libraries"], rows:[["Web backends","APIs and websites","FastAPI, Django, Flask"],["Data","Cleaning, analysis, charts","Pandas, NumPy, Matplotlib"],["AI / ML","Models, deep learning, LLM apps","scikit-learn, PyTorch, Transformers"],["Automation","Scripts, scraping, file work","os, pathlib, requests"]]}}
  ]},
  {h:"How Python runs your code", b:[
   "When you run `python hello.py`, the standard interpreter **CPython** does two things. First it **compiles** your source code into **bytecode**, a lower-level set of instructions (it caches these as `.pyc` files in `__pycache__`). Then the **Python Virtual Machine (PVM)** executes that bytecode line by line.",
   "That’s why Python is called **interpreted**: there’s no separate compile step you run yourself, and many errors only appear when that line actually runs. Other implementations exist, such as PyPy (faster, with a just-in-time compiler), but CPython is the one you install from python.org.",
   {tip:"Interview phrasing: ‘Python is both compiled and interpreted. Source is compiled to bytecode, which the Python Virtual Machine interprets.’"}
  ]},
  {h:"Installing and running Python", b:[
   "Install Python 3 from python.org (tick ‘Add Python to PATH’ on Windows), then check it in a terminal:",
   {code:`python --version        # or python3 --version on macOS/Linux`, out:`Python 3.12.4`},
   "There are three common ways to run code:",
   {list:["**Interactive shell (REPL):** type `python` and press Enter. Each line runs immediately, which is perfect for experimenting. Exit with `exit()`.","**Script file:** save code in `app.py` and run `python app.py`. This is how real programs run.","**Jupyter notebook:** code in cells with output shown below each cell; popular for data analysis and ML."]},
   "Use an editor such as VS Code with the Python extension for syntax highlighting, error hints and a debugger."
  ]},
  {h:"Your first program: syntax rules", b:[
   {code:`# This is a comment: Python ignores everything after #
print("Hello, world!")

temperature = 31
if temperature > 30:
    print("It's hot")      # indented = inside the if block
    print("Drink water")
print("Done")              # not indented = runs after the if`, out:`Hello, world!
It's hot
Drink water
Done`},
   "Three rules matter from day one. **Statements end at the end of the line** (no semicolons needed). **A colon starts a block** (after `if`, `for`, `while`, `def`, `class`). **Indentation defines the block**: every line in the block must be indented by the same amount, and the standard is 4 spaces.",
   "Other languages use braces `{ }` for blocks; Python uses indentation, so indentation isn’t just style, it changes what the program does.",
   {warn:"Never mix tabs and spaces. Set your editor to insert 4 spaces when you press Tab."}
  ]},
  {h:"print() and input() in detail", b:[
   "`print()` accepts any number of values and converts each to text. Two useful keyword arguments control the output: `sep` (what goes between values, default a space) and `end` (what goes at the end, default a newline).",
   {code:`print("a", "b", "c")             # a b c
print("a", "b", "c", sep="-")    # a-b-c
print("Loading", end="...")
print("done")                    # Loading...done
x = 7
print(f"x is {x} and x squared is {x ** 2}")`, out:`a b c
a-b-c
Loading...done
x is 7 and x squared is 49`},
   "`input(prompt)` shows the prompt, waits for the user to press Enter, and returns what they typed **as a string**. To do math you must convert it:",
   {code:`age = input("Age: ")       # user types 21
print(type(age))            # <class 'str'>
age = int(age)              # now it's an int
print(age + 1)`, out:`<class 'str'>
22`},
   {warn:"`int(\"21.5\")` raises `ValueError`. Use `float()` for decimals, and wrap conversions in `try/except` when the input comes from users."}
  ]},
  {h:"Reading error messages", b:[
   "Errors are normal; the skill is reading them. Python prints a **traceback**: the path through your code that led to the error. **Read it from the bottom up.** The last line tells you the error type and message; the lines above show the file and line number.",
   {code:`numbers = [1, 2, 3]
print(numbers[5])`, out:`Traceback (most recent call last):
  File "app.py", line 2, in <module>
    print(numbers[5])
IndexError: list index out of range`},
   {table:{head:["Error","Typical cause"], rows:[["SyntaxError","Missing colon, bracket or quote"],["IndentationError","Inconsistent indentation"],["NameError","Using a variable before defining it, or a typo"],["TypeError","Wrong type, e.g. `\"5\" + 5`"],["ValueError","Right type, bad value, e.g. `int(\"abc\")`"],["IndexError / KeyError","Missing list position / dictionary key"],["AttributeError","Method doesn’t exist, e.g. `5.upper()`"]]}}
  ]},
  {h:"Naming and style (PEP 8)", b:[
   "Variable names may contain letters, digits and underscores, can’t start with a digit, are case-sensitive (`age` and `Age` are different) and can’t be keywords like `if` or `class`.",
   "PEP 8 is Python’s official style guide. Following it makes your code look professional in interviews and code reviews:",
   {list:["`snake_case` for variables and functions: `total_price`, `get_user()`","`PascalCase` for classes: `BankAccount`","`UPPER_CASE` for constants: `MAX_RETRIES = 3`","4 spaces per indent, lines under about 79–99 characters","Descriptive names: `student_count` beats `sc`"]}
  ]}
 ]};

export const PY_DOCS = {};

PY_DOCS["py-basics"] = [
 {h:"Variables are names, not boxes", b:[
  "In many languages a variable is a box that holds a value. In Python, a variable is a **name that points to an object**. The statement `x = 10` creates an int object `10` somewhere in memory and binds the name `x` to it.",
  {code:`a = [1, 2, 3]
b = a            # b points to the SAME list
b.append(4)
print(a)         # a sees the change
print(id(a) == id(b))`, out:`[1, 2, 3, 4]
True`},
  "`id(obj)` returns the object’s identity (its memory address in CPython). Two names with the same `id` refer to the same object. This one idea explains copying, function arguments and most ‘weird’ Python bugs.",
  {sub:"Assignment shortcuts"},
  {code:`x = y = 0              # both names point to 0
a, b = 1, 2            # multiple assignment (tuple unpacking)
a, b = b, a            # swap without a temp variable
count = 5
count += 1             # same as count = count + 1`, out:``},
  {tip:"Python is **dynamically typed**: the type belongs to the object, not the name. `x = 5` then `x = \"hi\"` is allowed. It is also **strongly typed**: it won’t silently combine `\"5\" + 5`."}
 ]},
 {h:"Numbers: int, float, complex", b:[
  "**int** has unlimited precision: `2 ** 100` just works. **float** is a 64-bit IEEE-754 double, so it has rounding error. **complex** numbers are written like `3 + 4j`.",
  {code:`print(2 ** 100)
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
import math
print(math.isclose(0.1 + 0.2, 0.3))`, out:`1267650600228229401496703205376
0.30000000000000004
False
True`},
  {table:{head:["Operator","Meaning","Example","Result"], rows:[["/","True division (always float)","7 / 2","3.5"],["//","Floor division","7 // 2  and  -7 // 2","3  and  -4"],["%","Remainder (sign follows divisor)","7 % 3  and  -7 % 3","1  and  2"],["**","Power","2 ** 10","1024"],["abs(), round()","Absolute value, rounding","round(2.5)","2 (banker’s rounding)"]]}},
  "`//` rounds **down toward negative infinity**, not toward zero, which is why `-7 // 2` is `-4`. `round()` uses **banker’s rounding**: halves go to the nearest even number, so `round(2.5)` is `2` and `round(3.5)` is `4`.",
  {tip:"For money, use `decimal.Decimal(\"0.10\")` instead of floats to avoid rounding errors."}
 ]},
 {h:"Booleans, None and truthiness", b:[
  "`bool` has two values, `True` and `False`, and is actually a subclass of `int` (`True + True == 2`). `None` represents ‘no value’; functions without a `return` return `None`.",
  "Every object has a **truth value**, used by `if` and `while`. These are **falsy**; everything else is truthy:",
  {list:["`False` and `None`","Zero of any number type: `0`, `0.0`, `0j`","Empty collections: `\"\"`, `[]`, `()`, `{}`, `set()`, `range(0)`"]},
  {code:`items = []
if not items:
    print("No items yet")
name = ""
print(name or "Anonymous")   # or returns the first truthy value
print(bool("False"))         # non-empty string is truthy`, out:`No items yet
Anonymous
True`},
  {warn:"Check for None with `is None`, not `== None`. `None` is a singleton, and `==` can be overridden by classes."}
 ]},
 {h:"Type conversion", b:[
  "Python converts automatically only when it’s safe (int + float → float). Everything else is **explicit**:",
  {code:`print(int("42") + 1)       # str -> int
print(int(3.99))           # truncates toward zero
print(float("2.5"))
print(str(100) + "%")
print(list("abc"))
print(bool(0), bool(" "))  # a space is not empty`, out:`43
3
2.5
100%
['a', 'b', 'c']
False True`},
  "`int(\"3.5\")` fails with `ValueError` because the string isn’t a whole number; use `int(float(\"3.5\"))` if that’s really what you want. `int()` **truncates** (3.99 → 3, −3.99 → −3); it does not round."
 ]},
 {h:"Mutable vs immutable types", b:[
  "An **immutable** object can never change after it’s created; any ‘change’ creates a new object. A **mutable** object can be changed in place.",
  {table:{head:["Immutable","Mutable"], rows:[["int, float, complex, bool","list"],["str","dict"],["tuple, frozenset","set"],["bytes","bytearray, most custom objects"]]}},
  {code:`s = "hi"
print(id(s))
s += "!"          # creates a NEW string
print(id(s))      # different id

nums = [1, 2]
before = id(nums)
nums.append(3)    # changes the SAME list
print(id(nums) == before)`, out:`140210452710000
140210452713456
True`},
  "Why it matters: only immutable (more precisely, **hashable**) objects can be dictionary keys or set members; immutable objects are safe to share; and mutating a list inside a function affects the caller (see Memory & internals)."
 ]},
 {h:"Checking types", b:[
  "`type(x)` returns the exact type. `isinstance(x, T)` checks whether x is a T **or a subclass of T**, and accepts a tuple of types. Prefer `isinstance` in real code.",
  {code:`print(type(True))
print(isinstance(True, int))      # bool is a subclass of int
print(isinstance(3.0, (int, float)))`, out:`<class 'bool'>
True
True`}
 ]}
];

PY_DOCS["py-strings"] = [
 {h:"Creating strings", b:[
  "A string (`str`) is an **immutable sequence of Unicode characters**. Single and double quotes are identical; pick one and use the other inside. Triple quotes span multiple lines and are used for docstrings.",
  {code:`a = 'single'
b = "double with 'quotes' inside"
c = """multi
line"""
path = r"C:\\new\\table"     # raw string: backslashes stay literal
print("Tab:\\tEnd")
print("Line1\\nLine2")`, out:`Tab:	End
Line1
Line2`},
  {table:{head:["Escape","Meaning"], rows:[["\\n","newline"],["\\t","tab"],["\\\\","backslash"],["\\' and \\\"","quotes"]]}},
  {tip:"Use raw strings `r\"...\"` for regular expressions and Windows paths so backslashes aren’t treated as escapes."}
 ]},
 {h:"Indexing and slicing", b:[
  "Each character has a position, counting from **0** on the left and from **−1** on the right.",
  {table:{head:["Character","P","Y","T","H","O","N"], rows:[["Index","0","1","2","3","4","5"],["Negative","-6","-5","-4","-3","-2","-1"]]}},
  "Slicing `s[start:stop:step]` returns a new string from `start` up to **but not including** `stop`. Missing values default to the beginning, the end and a step of 1. Slices never raise IndexError; out-of-range bounds are clipped.",
  {code:`s = "PYTHON"
print(s[0], s[-1])     # first, last
print(s[1:4])          # index 1,2,3
print(s[:2], s[3:])    # first two, from 3 on
print(s[::2])          # every second char
print(s[::-1])         # reversed
print(s[2:100])        # clipped, no error`, out:`P N
YTH
PY HON
PTO
NOHTYP
THON`},
  {warn:"`s[10]` raises IndexError, but `s[10:20]` returns an empty string."}
 ]},
 {h:"Essential string methods", b:[
  "Methods never change the original (strings are immutable); they return new strings. Group them in your head by job:",
  {table:{head:["Job","Methods"], rows:[["Case","lower(), upper(), title(), capitalize(), casefold()"],["Clean","strip(), lstrip(), rstrip(), removeprefix(), removesuffix()"],["Search","find() (−1 if missing), index() (error if missing), count(), startswith(), endswith(), in"],["Split / join","split(sep), rsplit(), splitlines(), sep.join(iterable)"],["Replace","replace(old, new, count)"],["Check","isdigit(), isalpha(), isalnum(), isspace(), isupper()"]]}},
  {code:`line = "  Alice,  23 , Pune  "
parts = [p.strip() for p in line.split(",")]
print(parts)
name, age, city = parts
print(name.upper(), int(age) + 1, city.lower())
print("-".join(["2026", "10", "31"]))
print("banana".count("a"), "banana".find("z"))`, out:`['Alice', '23', 'Pune']
ALICE 24 pune
2026-10-31
3 -1`}
 ]},
 {h:"Formatting with f-strings", b:[
  "f-strings (Python 3.6+) put expressions inside `{}`. After a colon you can add a **format spec**: width, alignment, precision and more.",
  {code:`name, price, qty = "Pen", 12.5, 1200
print(f"{name} costs {price:.2f}")       # 2 decimals
print(f"{qty:,}")                        # thousands separator
print(f"{0.257:.1%}")                    # percentage
print(f"|{name:<8}|{name:>8}|{name:^8}|") # left, right, center
print(f"{7:03d}")                        # zero padding
print(f"{price=}")                        # debug: shows name and value`, out:`Pen costs 12.50
1,200
25.7%
|Pen     |     Pen|  Pen   |
007
price=12.5`},
  "Older styles still appear in existing code: `\"{} costs {}\".format(name, price)` and `\"%s costs %.2f\" % (name, price)`. Use f-strings in new code; they’re the fastest and most readable."
 ]},
 {h:"Building strings efficiently", b:[
  "Because strings are immutable, `result += piece` in a loop creates a brand-new string every time, copying all previous characters: O(n²) work for n pieces. Collect pieces in a list and join once.",
  {code:`# slow for many pieces
out = ""
for i in range(5):
    out += str(i)

# fast and idiomatic
out = "".join(str(i) for i in range(5))
print(out)`, out:`01234`}
 ]},
 {h:"Unicode, bytes and encodings", b:[
  "`str` holds Unicode text. `bytes` holds raw bytes (what files and networks actually carry). Convert with `encode` and `decode`; UTF-8 is the standard encoding.",
  {code:`word = "naïve"
print(len(word))                 # characters
data = word.encode("utf-8")
print(data, len(data))           # ï takes 2 bytes
print(data.decode("utf-8"))
print(ord("A"), chr(97))`, out:`5
b'na\\xc3\\xafve' 6
naïve
65 a`},
  {tip:"Always pass `encoding=\"utf-8\"` when opening text files, so your code behaves the same on Windows and Linux."}
 ]}
];

PY_DOCS["py-flow"] = [
 {h:"if, elif, else", b:[
  "Python checks conditions top to bottom and runs **only the first** block whose condition is truthy. `elif` and `else` are optional.",
  {code:`marks = 72
if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
elif marks >= 60:
    grade = "C"
else:
    grade = "F"
print(grade)

status = "pass" if marks >= 40 else "fail"   # conditional expression
print(status)`, out:`C
pass`},
  "Conditions can be any expression; Python uses its truth value. `if items:` means ‘if the list is not empty’ and is the Pythonic way to write it."
 ]},
 {h:"Comparison and logical operators", b:[
  "Comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`) return booleans and can be **chained**: `0 < x < 10` means `0 < x and x < 10`.",
  "`and`, `or`, `not` **short-circuit**: they stop as soon as the result is known, and `and`/`or` return one of their operands, not necessarily `True` or `False`.",
  {code:`x = 5
print(1 < x < 10)
print(0 or "default")      # first truthy operand
print(3 and 0)             # first falsy operand
print(None and 1/0)        # 1/0 never runs (short-circuit)`, out:`True
default
0
None`},
  {table:{head:["Expression","Returns"], rows:[["a or b","a if a is truthy, else b"],["a and b","a if a is falsy, else b"],["not a","True or False"]]}}
 ]},
 {h:"for loops and iteration", b:[
  "`for` loops over **any iterable**: lists, strings, ranges, dictionaries, files, generators. You get the items directly; there’s no index unless you ask for one.",
  {code:`for ch in "hey":
    print(ch, end=" ")
print()
for i in range(2, 10, 3):          # start, stop (excluded), step
    print(i, end=" ")
print()
for i, fruit in enumerate(["apple", "kiwi"], start=1):
    print(i, fruit)
for name, score in zip(["A", "B"], [90, 80]):
    print(name, score)
scores = {"ann": 91, "bob": 78}
for name, score in scores.items():
    print(f"{name}: {score}")`, out:`h e y
2 5 8
1 apple
2 kiwi
A 90
B 80
ann: 91
bob: 78`},
  {tip:"Need the index too? Use `enumerate()`, not `range(len(items))`. Looping two lists together? Use `zip()`; it stops at the shorter one."}
 ]},
 {h:"while loops", b:[
  "`while` repeats as long as its condition stays truthy. Use it when you don’t know in advance how many iterations you need.",
  {code:`balance, years = 1000, 0
while balance < 2000:
    balance *= 1.08
    years += 1
print(years, round(balance, 2))

while True:                 # loop until something tells you to stop
    cmd = "quit"            # pretend this came from input()
    if cmd == "quit":
        break`, out:`10 2158.92`},
  {warn:"If nothing inside the loop changes the condition, it runs forever. Make sure every path moves toward the exit."}
 ]},
 {h:"break, continue, pass and loop-else", b:[
  {list:["`break` exits the loop immediately.","`continue` skips the rest of this iteration and moves to the next.","`pass` does nothing; it’s a placeholder where a statement is required.","A loop’s `else` block runs **only if the loop finished without `break`**."]},
  {code:`for n in [4, 9, 12]:
    if n % 2:
        continue          # skip odd numbers
    print("even:", n)

def find(items, target):
    for i, x in enumerate(items):
        if x == target:
            print("found at", i)
            break
    else:
        print("not found")

find([3, 5, 7], 5)
find([3, 5, 7], 8)`, out:`even: 4
even: 12
found at 1
not found`}
 ]},
 {h:"match: structural pattern matching", b:[
  "Python 3.10 added `match`, which compares a value against patterns. It’s more powerful than a switch: it can unpack sequences and dictionaries.",
  {code:`def handle(cmd):
    match cmd.split():
        case ["go", direction]:
            return f"moving {direction}"
        case ["quit" | "exit"]:
            return "bye"
        case _:
            return "unknown command"

print(handle("go north"))
print(handle("exit"))`, out:`moving north
bye`}
 ]},
 {h:"Comprehensions", b:[
  "A comprehension builds a collection in one expression: `[expression for item in iterable if condition]`. They are shorter and usually faster than a loop with `append`.",
  {code:`nums = range(10)
squares = [n * n for n in nums]
evens = [n for n in nums if n % 2 == 0]
labels = ["even" if n % 2 == 0 else "odd" for n in range(3)]
lengths = {w: len(w) for w in ["hi", "hello"]}       # dict
unique = {c for c in "banana"}                       # set
total = sum(n * n for n in nums)                     # generator, no list
matrix = [[1, 2], [3, 4]]
flat = [x for row in matrix for x in row]            # nested
print(evens, labels, lengths, sorted(unique), total, flat)`, out:`[0, 2, 4, 6, 8] ['even', 'odd', 'even'] {'hi': 2, 'hello': 5} ['a', 'b', 'n'] 285 [1, 2, 3, 4]`},
  "Note the two different `if` positions: a filter goes **at the end** (`... for n in nums if cond`), while choosing between two values goes **at the front** (`a if cond else b for n in nums`).",
  {warn:"If a comprehension needs more than one condition and a nested loop, write a normal loop. Readability beats cleverness."}
 ]}
];
