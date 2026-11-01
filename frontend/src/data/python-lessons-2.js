import { PY_DOCS } from "./python-lessons-1.js";

PY_DOCS["py-ds"] = [
 {h:"Lists: ordered and changeable", b:[
  "A list is an ordered, mutable sequence that can hold any mix of types. Use it whenever order matters and the contents will change.",
  {code:`nums = [5, 2, 8]
nums.append(1)          # add to the end           -> [5, 2, 8, 1]
nums.insert(0, 9)       # insert at a position     -> [9, 5, 2, 8, 1]
nums.extend([7, 7])     # add many                 -> [..., 7, 7]
nums.remove(7)          # remove first matching value
last = nums.pop()       # remove and return the last item
del nums[0]             # delete by index
print(nums, last, nums.index(8), 2 in nums)`, out:`[5, 2, 8, 1] 7 2 True`},
  {sub:"Sorting"},
  "`list.sort()` sorts **in place** and returns `None`. `sorted(iterable)` returns a **new** list and works on anything iterable. Both accept `key=` (a function that computes what to sort by) and `reverse=True`. Python’s sort (Timsort) is **stable**: equal items keep their original order.",
  {code:`people = [("Ann", 31), ("Bob", 25), ("Cy", 31)]
by_age = sorted(people, key=lambda p: p[1])
print(by_age)
print(sorted(["b", "A", "c"], key=str.lower))
nums = [3, 1, 2]
print(nums.sort())        # None! sort() works in place
print(nums)`, out:`[('Bob', 25), ('Ann', 31), ('Cy', 31)]
['A', 'b', 'c']
None
[1, 2, 3]`},
  {warn:"`grid = [[0] * 3] * 3` creates three references to the **same** inner list; changing one row changes all three. Use `[[0] * 3 for _ in range(3)]`."}
 ]},
 {h:"Tuples: fixed records", b:[
  "A tuple is an ordered, **immutable** sequence. Use it for fixed groups of values (coordinates, database rows, function results) and as dictionary keys. A one-item tuple needs a trailing comma: `(5,)`.",
  {code:`point = (3, 4)
x, y = point                      # unpacking
first, *rest = [1, 2, 3, 4]       # star collects the rest
print(x, y, first, rest)

def min_max(xs):
    return min(xs), max(xs)       # returns a tuple
lo, hi = min_max([4, 9, 1])
print(lo, hi)

from collections import namedtuple
Point = namedtuple("Point", "x y")
p = Point(1, 2)
print(p.x, p)`, out:`3 4 1 [2, 3, 4]
1 9
1 Point(x=1, y=2)`},
  "Tuples use less memory than lists and are hashable if all their items are, which is why `(lat, lng)` can be a dictionary key but `[lat, lng]` cannot."
 ]},
 {h:"Sets: unique items, fast membership", b:[
  "A set is an unordered collection of **unique, hashable** items, backed by a hash table, so `x in s` is O(1) on average. Create an empty set with `set()`; `{}` is an empty dict.",
  {code:`a = {1, 2, 3, 3}
b = {3, 4}
print(a)                      # duplicates removed
print(a | b, a & b, a - b, a ^ b)
emails = ["x@a.com", "y@a.com", "x@a.com"]
print(len(set(emails)))       # count unique
a.add(10); a.discard(99)      # discard: no error if missing`, out:`{1, 2, 3}
{1, 2, 3, 4} {3} {1, 2} {1, 2, 4}
2`},
  {table:{head:["Operator","Method","Meaning"], rows:[["a | b","union","in either"],["a & b","intersection","in both"],["a - b","difference","in a, not in b"],["a ^ b","symmetric_difference","in exactly one"]]}},
  "`frozenset` is an immutable set and can itself be a dict key or a member of another set."
 ]},
 {h:"Dictionaries: key → value", b:[
  "A dict maps hashable keys to values, with O(1) average lookup. Since Python 3.7, dicts **keep insertion order**.",
  {code:`user = {"name": "Ann", "age": 23}
user["city"] = "Pune"               # add or update
print(user["name"])
print(user.get("email"))            # None instead of KeyError
print(user.get("email", "n/a"))     # with a default
for key, value in user.items():
    print(key, "=", value)
user.pop("age")
defaults = {"theme": "dark", "lang": "en"}
settings = defaults | {"lang": "te"}    # merge (3.9+): right side wins
print(settings)`, out:`Ann
None
n/a
name = Ann
age = 23
city = Pune
{'theme': 'dark', 'lang': 'te'}`},
  {sub:"Counting and grouping patterns"},
  {code:`words = "to be or not to be".split()
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)

groups = {}
for name in ["ann", "bob", "amy"]:
    groups.setdefault(name[0], []).append(name)
print(groups)`, out:`{'to': 2, 'be': 2, 'or': 1, 'not': 1}
{'a': ['ann', 'amy'], 'b': ['bob']}`},
  {warn:"Keys must be hashable: strings, numbers and tuples of those work; lists and dicts don’t."}
 ]},
 {h:"The collections module", b:[
  "These specialized containers save code and bugs:",
  {code:`from collections import Counter, defaultdict, deque

c = Counter("mississippi")
print(c.most_common(2))

graph = defaultdict(list)       # missing keys start as []
graph["a"].append("b")
print(dict(graph))

q = deque([1, 2, 3], maxlen=3)  # fast at both ends
q.appendleft(0)                 # pushes 3 out (maxlen)
print(q)
print(q.popleft())`, out:`[('i', 4), ('s', 4)]
{'a': ['b']}
deque([0, 1, 2], maxlen=3)
0`},
  {list:["**Counter**: counting and top-N.","**defaultdict**: grouping without `setdefault` noise.","**deque**: queues and sliding windows; `list.pop(0)` is O(n), `deque.popleft()` is O(1).","**namedtuple**: lightweight records with named fields."]}
 ]},
 {h:"Choosing the right structure", b:[
  {table:{head:["Need","Use","Why"], rows:[["Ordered items that change","list","index access O(1), append O(1)"],["Fixed record or dict key","tuple","immutable, hashable"],["Remove duplicates / fast ‘in’","set","hash table, O(1) membership"],["Look up by key","dict","hash table, O(1) lookup"],["Queue / both ends","deque","O(1) append and pop at both ends"],["Counting","Counter","built-in tallying"]]}},
  {table:{head:["Operation","list","set / dict"], rows:[["x in container","O(n)","O(1) average"],["get by index / key","O(1)","O(1) average"],["append / add","O(1) amortized","O(1) average"],["insert or pop at front","O(n)","n/a"],["sort","O(n log n)","n/a"]]}},
  {tip:"Classic interview fix: checking `if x in big_list` inside a loop is O(n²). Convert the list to a set once and it becomes O(n)."}
 ]}
];

PY_DOCS["py-func"] = [
 {h:"Defining and calling functions", b:[
  "A function packages reusable logic. `def` creates a function object and binds it to a name. `return` sends a value back and ends the function; without it the function returns `None`.",
  {code:`def area(width, height=1):
    """Return the area of a rectangle."""
    return width * height

print(area(3, 4))
print(area(5))                # uses the default height
print(area.__doc__)

def stats(xs):
    return min(xs), max(xs), sum(xs) / len(xs)   # several values = a tuple
lo, hi, mean = stats([2, 4, 9])
print(lo, hi, mean)`, out:`12
5
Return the area of a rectangle.
2 9 5.0`},
  "Functions are **first-class objects**: you can store them in variables, put them in lists, pass them to other functions and return them from functions. That’s what makes decorators and callbacks possible."
 ]},
 {h:"Every kind of parameter", b:[
  "Python’s parameter system is flexible. In a signature they must appear in this order:",
  {code:`def f(a, b, /, c, d=4, *args, e, f=6, **kwargs):
    print(a, b, c, d, args, e, f, kwargs)

f(1, 2, 3, 40, 50, 60, e=5, g=7)`, out:`1 2 3 40 (50, 60) 5 6 {'g': 7}`},
  {table:{head:["Part","Name","Rule"], rows:[["a, b, /","positional-only","must be passed by position"],["c","normal","by position or by name"],["d=4","default","optional; default evaluated once"],["*args","var-positional","extra positional args → tuple"],["e, f=6 (after *)","keyword-only","must be passed by name"],["**kwargs","var-keyword","extra keyword args → dict"]]}},
  "The same stars **unpack** when calling: `f(*my_list)` spreads a list into positional arguments, and `f(**my_dict)` spreads a dict into keyword arguments.",
  {code:`def greet(greeting, name):
    return f"{greeting}, {name}!"
args = ["Hi", "Ann"]
kw = {"name": "Bob", "greeting": "Hello"}
print(greet(*args), greet(**kw))`, out:`Hi, Ann! Hello, Bob!`}
 ]},
 {h:"The mutable default argument trap", b:[
  "Default values are evaluated **once, when the function is defined**, not on every call. A mutable default (list, dict, set) is therefore shared by every call that doesn’t pass its own.",
  {code:`def add_bad(item, bag=[]):
    bag.append(item)
    return bag

print(add_bad(1))
print(add_bad(2))        # surprise: the same list

def add_good(item, bag=None):
    if bag is None:      # create a fresh list per call
        bag = []
    bag.append(item)
    return bag

print(add_good(1), add_good(2))`, out:`[1]
[1, 2]
[1] [2]`},
  {tip:"This is one of the most asked Python interview questions. Explain the cause (evaluated once at definition) and the fix (`None` default)."}
 ]},
 {h:"Scope: the LEGB rule", b:[
  "When Python looks up a name it searches four scopes in order: **L**ocal (inside the current function), **E**nclosing (outer functions), **G**lobal (the module) and **B**uilt-in (`len`, `print`, …). The first match wins.",
  {code:`x = "global"
def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)
    inner()
    print(x)
outer()
print(x)`, out:`local
enclosing
global`},
  "Assigning to a name inside a function makes it **local** to that function. To rebind a module-level name, declare it `global`; to rebind an enclosing function’s name, declare it `nonlocal`.",
  {code:`count = 0
def bump():
    global count
    count += 1
bump(); print(count)

def counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc
c = counter(); c(); print(c())`, out:`1
2`},
  {warn:"Without `global`, `count += 1` inside the function raises `UnboundLocalError`, because the assignment makes `count` local before it has a value."}
 ]},
 {h:"Lambdas and higher-order functions", b:[
  "A `lambda` is a small anonymous function limited to **one expression**. It’s most useful as a short argument to another function.",
  {code:`square = lambda x: x * x
print(square(6))
words = ["kiwi", "fig", "banana"]
print(sorted(words, key=len))
print(max(words, key=len))
print(list(map(str.upper, words)))
print(list(filter(lambda w: len(w) > 3, words)))`, out:`36
['fig', 'kiwi', 'banana']
banana
['KIWI', 'FIG', 'BANANA']
['kiwi', 'banana']`},
  "In modern Python, comprehensions are usually clearer than `map` and `filter`: `[w.upper() for w in words]`."
 ]},
 {h:"Closures", b:[
  "A **closure** is an inner function that remembers variables from the scope where it was created, even after that outer function has returned. Python stores those variables in the function’s `__closure__` cells.",
  {code:`def make_multiplier(n):
    def multiply(x):
        return x * n        # n is remembered
    return multiply

double, triple = make_multiplier(2), make_multiplier(3)
print(double(5), triple(5))
print(double.__closure__[0].cell_contents)`, out:`10 15
2`},
  {sub:"Late binding trap"},
  "Closures look up variables **when called**, not when created. In a loop, every closure sees the loop variable’s final value:",
  {code:`funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])
funcs = [lambda i=i: i for i in range(3)]   # bind now via default
print([f() for f in funcs])`, out:`[2, 2, 2]
[0, 1, 2]`}
 ]},
 {h:"Recursion", b:[
  "A recursive function calls itself on a smaller problem until it hits a **base case**. Python’s default recursion limit is about 1000 calls, and it doesn’t optimize tail calls, so deep recursion should become a loop.",
  {code:`from functools import lru_cache

def factorial(n):
    if n <= 1:              # base case
        return 1
    return n * factorial(n - 1)

@lru_cache(maxsize=None)    # memoization: cache results
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(factorial(5), fib(80))`, out:`120 23416728348467685`},
  "Without the cache, `fib(80)` would take forever (O(2ⁿ) calls). With `lru_cache`, each value is computed once (O(n))."
 ]}
];

PY_DOCS["py-adv"] = [
 {h:"How iteration really works", b:[
  "A `for` loop works with two protocols. An **iterable** is anything with `__iter__()` (lists, strings, dicts, files). Calling `iter()` on it returns an **iterator**, an object with `__next__()` that returns one item at a time and raises `StopIteration` when it’s done.",
  {code:`it = iter([10, 20])
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("exhausted")`, out:`10
20
exhausted`},
  "So `for x in items:` is really: get an iterator with `iter(items)`, call `next()` repeatedly, and stop on `StopIteration`. An iterator remembers its position and can be used **only once**.",
  {code:`class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

print(list(Countdown(3)))`, out:`[3, 2, 1]`}
 ]},
 {h:"Generators: lazy sequences", b:[
  "A **generator function** uses `yield` instead of `return`. Calling it doesn’t run the body; it returns a generator object. Each `next()` runs the body until the next `yield`, hands out that value and **pauses**, keeping all local variables.",
  {code:`def countdown(n):
    print("start")
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(next(gen))
print(list(gen))      # continues where it paused`, out:`start
3
[2, 1]`},
  "Generators produce values **on demand**, so they use almost no memory no matter how many values they yield. That’s why they’re used for large files, streams and data pipelines.",
  {code:`import sys
big_list = [n * n for n in range(1_000_000)]
big_gen = (n * n for n in range(1_000_000))
print(sys.getsizeof(big_list) > 8_000_000, sys.getsizeof(big_gen) < 300)

def read_batches(rows, size):
    for i in range(0, len(rows), size):
        yield rows[i:i + size]
print(list(read_batches(list(range(7)), 3)))`, out:`True True
[[0, 1, 2], [3, 4, 5], [6]]`},
  "`yield from other_iterable` delegates to another generator. A generator expression `(x * x for x in data)` is the lazy cousin of a list comprehension.",
  {warn:"A generator can only be consumed once. Looping over it a second time gives nothing."}
 ]},
 {h:"itertools highlights", b:[
  {code:`from itertools import chain, islice, count, groupby, product

print(list(chain([1, 2], [3])))              # join iterables
print(list(islice(count(10, 5), 3)))         # first 3 of an infinite counter
for key, grp in groupby("aaabcc"):
    print(key, len(list(grp)), end="  ")
print()
print(list(product("ab", [1, 2])))           # cartesian product`, out:`[1, 2, 3]
[10, 15, 20]
a 3  b 1  c 2  
[('a', 1), ('a', 2), ('b', 1), ('b', 2)]`},
  {warn:"`groupby` only groups **consecutive** equal items; sort the data by the same key first."}
 ]},
 {h:"Decorators, built up step by step", b:[
  "A decorator is a function that takes a function and returns a new function that adds behavior around it. It works because functions are first-class objects. Here is the idea built from scratch:",
  {code:`import functools, time

def timer(func):                          # 1. takes a function
    @functools.wraps(func)                # 4. keep the original name and docstring
    def wrapper(*args, **kwargs):         # 2. accepts any arguments
        start = time.perf_counter()
        result = func(*args, **kwargs)    # 3. calls the original
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result                     # 5. passes the result back
    return wrapper

@timer                                    # same as: slow_add = timer(slow_add)
def slow_add(a, b):
    time.sleep(0.1)
    return a + b

print(slow_add(2, 3), slow_add.__name__)`, out:`slow_add took 0.1001s
5 slow_add`},
  {sub:"Decorators with arguments"},
  "To pass options, add one more layer: a function that receives the options and returns the decorator.",
  {code:`def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"attempt {attempt} failed: {e}")
            raise RuntimeError("all retries failed")
        return wrapper
    return decorator

@retry(times=2)
def flaky():
    raise ValueError("network down")`, out:``},
  "Stacked decorators apply **bottom-up**: with `@a` above `@b` above `def f`, Python computes `a(b(f))`.",
  {tip:"Real uses you can mention in interviews: logging, timing, retries, caching (`functools.lru_cache`), authentication checks in web frameworks, and `@torch.no_grad()` in PyTorch."}
 ]}
];

PY_DOCS["py-oop"] = [
 {h:"Classes and objects", b:[
  "A **class** is a blueprint; an **object** (instance) is a thing built from it. `__init__` runs right after an object is created and sets up its data. `self` is the object itself, passed automatically as the first argument of every instance method.",
  {code:`class BankAccount:
    bank_name = "VIT Bank"              # class attribute: shared

    def __init__(self, owner, balance=0):
        self.owner = owner              # instance attributes: per object
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        return self.balance

acc1 = BankAccount("Ann", 100)
acc2 = BankAccount("Bob")
acc1.deposit(50)
print(acc1.balance, acc2.balance, acc1.bank_name)`, out:`150 0 VIT Bank`},
  "`acc1.deposit(50)` is really `BankAccount.deposit(acc1, 50)`; that’s where `self` comes from.",
  {warn:"A mutable class attribute (like `items = []` at class level) is shared by every instance. Create per-object lists inside `__init__`."}
 ]},
 {h:"Instance, class and static methods", b:[
  {code:`class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    def to_f(self):                       # instance method: uses self
        return self.celsius * 9 / 5 + 32

    @classmethod
    def from_f(cls, f):                   # class method: alternative constructor
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_freezing(c):                   # static method: plain utility
        return c <= 0

t = Temperature.from_f(212)
print(t.celsius, t.to_f(), Temperature.is_freezing(-3))`, out:`100.0 212.0 True`},
  {table:{head:["Kind","First parameter","Use for"], rows:[["Instance method","self","work with one object’s data"],["@classmethod","cls","alternative constructors; works with subclasses"],["@staticmethod","none","helper logically related to the class"]]}}
 ]},
 {h:"Encapsulation and properties", b:[
  "Python has no truly private fields. By convention, `_name` means ‘internal, don’t touch’. `__name` triggers **name mangling** (it becomes `_ClassName__name`) to avoid clashes in subclasses.",
  "`@property` lets you expose an attribute while running code when it’s read or set, which is perfect for validation without changing how callers use the class.",
  {code:`class Product:
    def __init__(self, price):
        self.price = price          # goes through the setter

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price can't be negative")
        self._price = value

p = Product(100)
p.price = 80
print(p.price)
try:
    p.price = -5
except ValueError as e:
    print(e)`, out:`80
price can't be negative`}
 ]},
 {h:"Inheritance and super()", b:[
  "Inheritance lets a child class reuse and extend a parent. `super()` calls the parent’s version of a method. A child **overrides** a method by defining one with the same name.",
  {code:`class Employee:
    def __init__(self, name, salary):
        self.name, self.salary = name, salary
    def pay(self):
        return self.salary

class Manager(Employee):
    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)    # reuse parent setup
        self.bonus = bonus
    def pay(self):                        # override
        return super().pay() + self.bonus

staff = [Employee("Ann", 50000), Manager("Bob", 70000, 15000)]
for s in staff:
    print(s.name, s.pay())
print(isinstance(staff[1], Employee), issubclass(Manager, Employee))`, out:`Ann 50000
Bob 85000
True True`},
  {sub:"Multiple inheritance and the MRO"},
  "A class can inherit from several parents. Python decides where to look for a method with the **Method Resolution Order** (C3 linearization). `super()` follows the MRO, so in a ‘diamond’ each class runs exactly once.",
  {code:`class A:
    def hi(self): return "A"
class B(A):
    def hi(self): return "B>" + super().hi()
class C(A):
    def hi(self): return "C>" + super().hi()
class D(B, C):
    pass
print(D().hi())
print([k.__name__ for k in D.__mro__])`, out:`B>C>A
['D', 'B', 'C', 'A', 'object']`}
 ]},
 {h:"Polymorphism, duck typing and abstraction", b:[
  "**Polymorphism** means the same call works on different types. Python relies on **duck typing**: if an object has the method you call, it works, whatever its class.",
  "**Abstraction** hides details behind a simple interface. The `abc` module lets a base class declare methods that every subclass must implement:",
  {code:`from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self): ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return round(math.pi * self.r ** 2, 2)

class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

for shape in [Circle(1), Square(3)]:
    print(type(shape).__name__, shape.area())   # same call, different behavior
try:
    Shape()
except TypeError as e:
    print("TypeError:", e)`, out:`Circle 3.14
Square 9
TypeError: Can't instantiate abstract class Shape without an implementation for abstract method 'area'`},
  "Python has **no method overloading**: defining two methods with the same name keeps only the last. Use default arguments or `*args` instead."
 ]},
 {h:"Special (dunder) methods", b:[
  "Dunder methods (‘double underscore’) let your objects work with Python’s built-in syntax: `print`, `len`, `+`, `==`, `for`, `[]` and more.",
  {code:`class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):                 # developer-facing text
        return f"Vector({self.x}, {self.y})"
    def __add__(self, other):           # v1 + v2
        return Vector(self.x + other.x, self.y + other.y)
    def __eq__(self, other):            # v1 == v2
        return (self.x, self.y) == (other.x, other.y)
    def __abs__(self):                  # abs(v)
        return (self.x ** 2 + self.y ** 2) ** 0.5
    def __iter__(self):                 # x, y = v
        yield self.x
        yield self.y

v = Vector(3, 4) + Vector(0, 0)
x, y = v
print(v, abs(v), v == Vector(3, 4), x, y)`, out:`Vector(3, 4) 5.0 True 3 4`},
  {table:{head:["Method","Triggered by"], rows:[["__init__","creating an object"],["__repr__ / __str__","repr(obj) / print(obj)"],["__len__","len(obj)"],["__getitem__","obj[key], and iteration fallback"],["__eq__, __lt__","==, <"],["__add__, __mul__","+, *"],["__call__","obj(...)"],["__enter__, __exit__","with obj:"]]}},
  {tip:"`__call__` is why `model(x)` works in PyTorch: `nn.Module` defines `__call__`, which runs hooks and then your `forward`."}
 ]},
 {h:"Dataclasses and composition", b:[
  "`@dataclass` writes `__init__`, `__repr__` and `__eq__` for you, which is ideal for classes that mainly hold data.",
  {code:`from dataclasses import dataclass, field

@dataclass
class Order:
    id: int
    items: list = field(default_factory=list)   # safe mutable default
    paid: bool = False

o = Order(1)
o.items.append("pen")
print(o, o == Order(1, ["pen"]))`, out:`Order(id=1, items=['pen'], paid=False) True`},
  "**Composition vs inheritance:** inheritance models an ‘is-a’ relationship (a Manager *is an* Employee). Composition models ‘has-a’ (a Car *has an* Engine): store the other object as an attribute. Prefer composition unless the child truly is a specialized parent; it keeps classes loosely coupled."
 ]}
];
