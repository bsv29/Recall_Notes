export const C_JAVA = [
{id:"java-basics", t:"Java basics", lvl:"B",
 hook:"Write once, run anywhere: source → bytecode → JVM.",
 sum:"Java is a statically typed, object-oriented language compiled to bytecode that runs on the Java Virtual Machine.",
 pts:[
  "**JDK** (compiler + tools) contains the **JRE** (libraries) which contains the **JVM** (runs bytecode). `javac` compiles `.java` into `.class` files.",
  "**Statically typed:** every variable has a declared type: `int`, `double`, `boolean`, `char`, `String`.",
  "Primitives (`int`, `double`) hold values; objects (`String`, arrays, your classes) are references.",
  "`==` compares references for objects; use `.equals()` to compare content.",
  "Every program starts at `public static void main(String[] args)`.",
  "Integer division truncates: `7 / 2` is `3`; cast for decimals: `7 / 2.0` is `3.5`."
 ],
 code:`public class Main {
    public static void main(String[] args) {
        String a = new String("hi");
        String b = new String("hi");
        System.out.println(a == b);       // false
        System.out.println(a.equals(b));  // true
        int x = 7 / 2;
        System.out.println(x);            // 3
    }
}`,
 traps:["Comparing strings with `==` checks identity, not content.","`7 / 2` is integer division: `3`, not `3.5`."],
 cards:[["JDK vs JRE vs JVM?","JDK = tools + JRE; JRE = libraries + JVM; JVM runs bytecode."],["`==` vs `.equals()` on objects?","`==` compares references; `.equals()` compares content."],["Why is Java platform independent?","It compiles to bytecode that any JVM can run."]],
 quiz:[["`System.out.println(10 / 4);` prints",["2.5","2","3","error"],1,"Integer division truncates."],["Entry point of a Java program:",["main()","public static void main(String[] args)","start()","run()"],1,"The JVM looks for this exact signature."]],
 vis:{type:"flow", steps:["Main.java","javac compiles","Main.class (bytecode)","JVM","Runs on any OS"]},
 prac:[{type:"bug", lines:['String a = "java";','String b = new String("java");','if (a == b) {','    System.out.println("same");','}'], bug:2, fix:"if (a.equals(b)) {", explain:"`==` compares references. Use `.equals()` for string content."}]},
{id:"java-oop", t:"Classes, inheritance & interfaces", lvl:"I",
 hook:"extends = is-a with shared code; implements = keeps a promise.",
 sum:"Model things with classes, reuse code with inheritance, and decouple with interfaces.",
 pts:[
  "A class has fields, constructors and methods; `this` refers to the current object.",
  "`extends` gives single inheritance; `super(...)` calls the parent constructor.",
  "`implements` lets a class follow many interfaces; interfaces can have `default` methods (Java 8+).",
  "**Overriding** (same signature in a subclass, `@Override`) is runtime polymorphism; **overloading** (same name, different parameters) is compile-time.",
  "Access: `private` < package (default) < `protected` < `public`.",
  "An `abstract class` can hold state and constructors; an `interface` is a contract."
 ],
 code:`interface Shape { double area(); }

abstract class Base implements Shape {
    public String name() { return getClass().getSimpleName(); }
}

class Circle extends Base {
    private final double r;
    Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}

Shape s = new Circle(2);
System.out.println(s.area());   // 12.566370614359172`,
 traps:["Java has no multiple inheritance of classes; use interfaces.","Without `@Override`, a typo silently creates a new method."],
 cards:[["Overloading vs overriding?","Overloading: same name, different parameters (compile time). Overriding: subclass redefines a method (runtime)."],["Abstract class vs interface?","Abstract class can hold state and constructors (single inheritance); an interface is a contract a class can implement many of."],["What does `super()` do?","Calls the parent class constructor."]],
 quiz:[["How many classes can a Java class extend?",["One","Two","Unlimited","None"],0,"Single inheritance for classes."],["Choosing the method at runtime by object type is…",["overloading","overriding / dynamic dispatch","encapsulation","casting"],1,"Runtime polymorphism."]],
 vis:{type:"tree", root:"Shape (interface)", kids:[{n:"Base (abstract)", k:["Circle","Square"]}]},
 prac:[{type:"order", lines:["class Dog extends Animal {","    Dog(String name) {","        super(name);","    }","}"], explain:"The constructor calls `super(name)` first, inside the class body."}]},
{id:"java-coll", t:"Collections & generics", lvl:"I",
 hook:"List keeps order, Set keeps unique, Map keeps key → value.",
 sum:"The Collections Framework gives ready-made data structures; generics make them type-safe.",
 pts:[
  "`ArrayList` gives fast index access; `LinkedList` fast insert/remove at the ends.",
  "`HashSet` is unique and unordered (O(1)); `TreeSet` is sorted (O(log n)).",
  "`HashMap` maps keys to values (O(1) average); `TreeMap` keeps keys sorted; `LinkedHashMap` keeps insertion order.",
  "Generics: `List<String>` catches type errors at compile time; primitives need wrappers (`Integer`).",
  "Streams: `list.stream().filter(...).map(...).collect(Collectors.toList())`.",
  "`HashMap` keys need consistent `equals()` and `hashCode()`."
 ],
 code:`List<String> names = new ArrayList<>(List.of("ann", "bob", "al"));
Map<String, Integer> lengths = new HashMap<>();
for (String n : names) lengths.put(n, n.length());

List<String> aNames = names.stream()
    .filter(n -> n.startsWith("a"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());
System.out.println(aNames);   // [ANN, AL]`,
 traps:["Removing from a list inside a for-each loop throws `ConcurrentModificationException`.","Overriding `equals` without `hashCode` breaks `HashMap` lookups."],
 cards:[["ArrayList vs LinkedList?","ArrayList: fast random access. LinkedList: fast insert/delete at the ends, slow index access."],["HashMap vs TreeMap?","HashMap: O(1), no order. TreeMap: sorted keys, O(log n)."],["Why generics?","Compile-time type safety and no casting."]],
 quiz:[["Which keeps elements unique and sorted?",["ArrayList","HashSet","TreeSet","HashMap"],2,"TreeSet is sorted and unique."],["`List<int>` is…",["valid","invalid, use List<Integer>","a stream","an array"],1,"Generics need object types."]],
 vis:{type:"compare", cols:[{h:"List", items:["ordered","duplicates allowed","ArrayList, LinkedList"]},{h:"Set", items:["unique","HashSet O(1)","TreeSet sorted"]},{h:"Map", items:["key → value","HashMap O(1)","TreeMap sorted keys"]}]},
 prac:[{type:"predict", code:"List<Integer> xs = List.of(3, 1, 2);\nSystem.out.println(xs.stream().map(x -> x * 2).collect(Collectors.toList()));", answer:["[6, 2, 4]"], explain:"`map` doubles each item and keeps the order."}]},
{id:"java-adv", t:"Exceptions, threads & the JVM", lvl:"A",
 hook:"Checked = you must handle it; unchecked = usually your bug.",
 sum:"Handle errors properly, run work concurrently, and understand how the JVM manages memory.",
 pts:[
  "**Checked** exceptions (`IOException`) must be caught or declared with `throws`; **unchecked** ones (`NullPointerException`) extend `RuntimeException`.",
  "try-with-resources closes resources automatically: `try (var r = new FileReader(f)) { ... }`.",
  "Concurrency: `Thread`, `Runnable`, or better an `ExecutorService`; `synchronized` prevents race conditions.",
  "JVM memory: the **stack** holds method calls and local primitives; the **heap** holds objects; garbage collection frees unreachable objects.",
  "`final` can’t be reassigned; `static` belongs to the class, not to instances.",
  "`String` is immutable; use `StringBuilder` to build strings in loops."
 ],
 code:`ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> f = pool.submit(() -> 6 * 7);
try {
    System.out.println(f.get());   // 42
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
} finally {
    pool.shutdown();
}`,
 traps:["Catching `Exception` everywhere hides real bugs.","Forgetting `shutdown()` keeps the program running."],
 cards:[["Checked vs unchecked exceptions?","Checked must be handled or declared; unchecked (RuntimeException) usually signal bugs."],["Stack vs heap?","Stack: method frames and local primitives. Heap: objects, managed by the garbage collector."],["Why StringBuilder?","Strings are immutable; StringBuilder appends without creating a new object each time."]],
 quiz:[["`NullPointerException` is…",["checked","unchecked","an Error","a compile error"],1,"It extends RuntimeException."],["Where are objects allocated?",["stack","heap","registers","disk"],1,"Objects live on the heap."]],
 vis:{type:"compare", cols:[{h:"Stack", items:["method calls","local primitives","references","one per thread"]},{h:"Heap", items:["all objects","shared by threads","garbage collected"]}]},
 prac:[{type:"order", lines:["try (BufferedReader r = new BufferedReader(new FileReader(path))) {","    System.out.println(r.readLine());","} catch (IOException e) {","    System.out.println(\"read failed\");","}"], explain:"try-with-resources opens the reader and closes it for you; the catch handles the checked IOException."}]}
];

export const C_JS = [
{id:"js-basics", t:"Variables, types & functions", lvl:"B",
 hook:"const by default, let when it changes, never var.",
 sum:"JavaScript is a dynamically typed language that runs in browsers and in Node.js.",
 pts:[
  "`let` and `const` are block-scoped; `var` is function-scoped and hoisted, so avoid it.",
  "Types: `number`, `string`, `boolean`, `null`, `undefined`, `bigint`, `symbol`, and `object` (arrays and functions are objects).",
  "`===` checks value and type; `==` converts types first (`'5' == 5` is `true`). Always use `===`.",
  "Functions: declarations, expressions and arrow functions `(a, b) => a + b`.",
  "Template literals use backticks and `${...}` to insert values.",
  "Falsy values: `false`, `0`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy."
 ],
 code:`const nums = [1, 2, 3];
const double = n => n * 2;
console.log(nums.map(double));     // [ 2, 4, 6 ]
console.log('5' == 5, '5' === 5);  // true false
console.log(typeof null);          // object
let total = 0;
for (const n of nums) total += n;
console.log(total);                // 6`,
 traps:["`typeof null` is `'object'`, a historic bug.","`0.1 + 0.2 !== 0.3` because of floating-point rounding."],
 cards:[["`let` vs `const` vs `var`?","let/const are block-scoped; const can’t be reassigned; var is function-scoped and hoisted."],["`==` vs `===`?","`==` converts types first; `===` checks value and type."],["Falsy values in JS?","false, 0, '', null, undefined, NaN."]],
 quiz:[["`console.log(typeof [])`",["array","object","list","undefined"],1,"Arrays are objects."],["`'2' + 2` gives…",["4","'22'","NaN","error"],1,"+ with a string concatenates."]],
 vis:{type:"compare", cols:[{h:"var", items:["function scope","hoisted as undefined","can be redeclared"]},{h:"let", items:["block scope","can be reassigned","error if used before declaration"]},{h:"const", items:["block scope","no reassignment","object contents can still change"]}]},
 prac:[{type:"predict", code:"const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);", answer:["4"], explain:"`b` and `a` point to the same array."}]},
{id:"js-arrays", t:"Arrays, objects & destructuring", lvl:"I",
 hook:"map transforms, filter selects, reduce combines.",
 sum:"Work with collections using array methods, spread syntax and destructuring.",
 pts:[
  "`map` returns a new array of the same length; `filter` keeps matching items; `reduce` folds everything into one value.",
  "`find` returns the first match; `some`/`every` return booleans; `includes` checks membership.",
  "Destructuring: `const {name, age} = user;` and `const [first, ...rest] = arr;`.",
  "Spread copies shallowly: `{...obj, age: 30}`, `[...arr, 4]`.",
  "Objects are references: `b = a` shares the same object.",
  "`Object.keys`, `Object.values`, `Object.entries` let you loop over objects."
 ],
 code:`const users = [{name: "Ann", age: 23}, {name: "Bob", age: 31}];
const names = users.map(u => u.name);
const adults = users.filter(u => u.age > 25);
const total = users.reduce((sum, u) => sum + u.age, 0);
const {name, ...rest} = users[0];
console.log(names, adults.length, total);   // [ 'Ann', 'Bob' ] 1 54
console.log(rest);                          // { age: 23 }`,
 traps:["`reduce` without an initial value throws on an empty array.","Spread is shallow: nested objects are still shared."],
 cards:[["map vs forEach?","map returns a new array; forEach returns undefined and is for side effects."],["What does `...rest` do in destructuring?","Collects the remaining properties or items."],["Shallow vs deep copy in JS?","Spread and Object.assign copy one level; structuredClone copies deeply."]],
 quiz:[["`[1, 2, 3].filter(x => x > 1)`",["[2, 3]","[1]","true","2"],0,"Keeps the items that pass the test."],["`[1, 2, 3].reduce((a, b) => a + b, 0)`",["6","123","[1, 2, 3]","0"],0,"Sums the items."]],
 vis:{type:"flow", steps:["[1, 2, 3, 4]","filter(x > 1) → [2, 3, 4]","map(x × 10) → [20, 30, 40]","reduce(sum) → 90"]},
 prac:[{type:"blank", code:"const prices = [100, 250, 40];\nconst total = prices.____((sum, p) => sum + p, 0);\nconsole.log(total);   // 390", answer:["reduce"], explain:"`reduce` folds the array into one value."}]},
{id:"js-async", t:"Async JS & the event loop", lvl:"I",
 hook:"JavaScript has one thread; the event loop makes it feel like many.",
 sum:"Handle slow work like network calls and timers without blocking, using promises and async/await.",
 pts:[
  "The **call stack** runs synchronous code; async callbacks wait in queues until the stack is empty.",
  "**Microtasks** (promise callbacks) run before **macrotasks** (`setTimeout`).",
  "A Promise is pending, then fulfilled or rejected; chain with `.then()` and `.catch()`.",
  "`async` functions always return promises; `await` pauses until a promise settles.",
  "`Promise.all` runs in parallel and fails fast; `Promise.allSettled` waits for every result.",
  "Wrap `await` in `try/catch` to handle errors."
 ],
 code:`console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// prints A D C B

async function load() {
  try {
    const res = await fetch("/api/users");
    return await res.json();
  } catch (err) {
    console.error("failed", err);
  }
}`,
 traps:["`forEach` doesn’t wait for `await`; use `for...of` or `Promise.all`.","Forgetting `await` gives you a Promise, not the data."],
 cards:[["Microtask vs macrotask?","Microtasks (promises) run right after the current code; macrotasks (setTimeout) run later."],["What does `await` do?","Pauses the async function until the promise settles."],["Promise.all vs allSettled?","all rejects on the first failure; allSettled waits for every result."]],
 quiz:[["Order of: log A, setTimeout B, promise C, log D",["A B C D","A D C B","A D B C","A C D B"],1,"Sync code first, then microtasks, then macrotasks."],["An async function always returns…",["undefined","a Promise","a callback","an array"],1,"Async functions return promises."]],
 vis:{type:"cycle", steps:["Call stack runs sync code","Stack empty?","Run all microtasks (promises)","Run one macrotask (setTimeout)"]},
 prac:[{type:"predict", code:"console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);", answer:["1 4 3 2"], explain:"Sync logs first, then the promise microtask, then the timeout."}]},
{id:"js-adv", t:"Closures, this & prototypes", lvl:"A",
 hook:"A closure is a function plus the variables it remembers.",
 sum:"The deeper mechanics interviewers probe: scope, closures, `this` binding and prototypes.",
 pts:[
  "**Closure:** an inner function keeps access to outer variables after the outer function returns.",
  "**Hoisting:** function declarations are fully hoisted; `let`/`const` sit in the temporal dead zone until declared.",
  "`this` depends on how a function is called; arrow functions take `this` from the surrounding scope.",
  "`call`, `apply` and `bind` set `this` explicitly.",
  "Objects inherit through the **prototype chain**; `class` is syntax on top of prototypes.",
  "Debounce and throttle limit how often a function runs (search boxes, scroll handlers)."
 ],
 code:`function counter() {
  let count = 0;
  return () => ++count;
}
const next = counter();
next(); next();
console.log(next());   // 3

const user = {
  name: "Ann",
  hi() { return "Hi " + this.name; },
};
const hi = user.hi;
console.log(hi.call({name: "Bob"}));   // Hi Bob`,
 traps:["Passing `obj.method` as a callback loses `this`; use `bind` or an arrow function.","`var` in a loop with closures shares one variable; use `let`."],
 cards:[["What is a closure?","A function bundled with references to its outer scope’s variables."],["Arrow function `this`?","Arrows have no own `this`; they use the enclosing one."],["What is the prototype chain?","Objects look up missing properties on their prototype, up to Object.prototype."]],
 quiz:[["`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` prints",["0 1 2","3 3 3","undefined","0 0 0"],1,"`var` shares one `i`."],["Which creates a new function with a fixed `this`?",["call","apply","bind","new"],2,"bind returns a bound function."]],
 vis:{type:"stack", layers:["next() → ++count","inner arrow function","closure keeps count","counter() already returned"]},
 prac:[{type:"bug", lines:["for (var i = 0; i < 3; i++) {","  setTimeout(() => console.log(i), 0);","}"], bug:0, fix:"for (let i = 0; i < 3; i++) {", explain:"`var` shares one `i`, so it logs 3 three times. `let` creates a new binding for each loop."}]}
];

export const C_REACT = [
{id:"react-basics", t:"Components, JSX & props", lvl:"B",
 hook:"UI = f(state). Components are functions that return JSX.",
 sum:"React builds interfaces from reusable components that receive props and render JSX.",
 pts:[
  "A component is a function that returns JSX; its name starts with a capital letter.",
  "JSX compiles to JavaScript calls; use `className`, and put expressions inside `{}`.",
  "**Props** pass data from parent to child and are read-only.",
  "Render lists with `map` and give each item a stable `key` (not the index when items can move).",
  "Conditional rendering: `cond && <X />` or `cond ? <A /> : <B />`.",
  "Prefer composition with `children` over inheritance."
 ],
 code:`function Badge({ label, color = "gray" }) {
  return <span className={"badge " + color}>{label}</span>;
}

function UserList({ users }) {
  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>
          {u.name} {u.admin && <Badge label="admin" color="blue" />}
        </li>
      ))}
    </ul>
  );
}`,
 traps:["Using the array index as `key` breaks state when items are reordered.","`{count && <X />}` renders `0` when count is 0."],
 cards:[["Props vs state?","Props come from the parent and are read-only; state is owned and updated by the component."],["Why keys in lists?","They let React match items between renders and keep state correct."],["What does JSX compile to?","Plain JavaScript function calls that create React elements."]],
 quiz:[["In JSX, the CSS class attribute is…",["class","className","cssClass","style"],1,"`class` is a reserved word in JS."],["Props are…",["changed by the child","read-only","global","the same as state"],1,"Never modify props."]],
 vis:{type:"tree", root:"App", kids:[{n:"Header", k:["Logo","Nav"]},{n:"UserList", k:["UserItem","Badge"]}]},
 prac:[{type:"bug", lines:["{todos.map(todo => (","  <li>{todo.text}</li>","))}"], bug:1, fix:"  <li key={todo.id}>{todo.text}</li>", explain:"List items need a stable `key`."}]},
{id:"react-hooks", t:"State & hooks", lvl:"I",
 hook:"Replace state, don’t mutate it: new values trigger a re-render.",
 sum:"Hooks give function components state, side effects and references.",
 pts:[
  "`useState` returns `[value, setValue]`; calling the setter schedules a re-render.",
  "Use the updater form when the new state depends on the old: `setCount(c => c + 1)`.",
  "Never mutate state; create new arrays and objects (`[...items, x]`, `{...obj, k: v}`).",
  "`useEffect(fn, deps)` runs after render; `[]` runs once after mount; return a cleanup function.",
  "`useRef` holds a mutable value or a DOM node without causing re-renders.",
  "Rules of hooks: call them at the top level of components or custom hooks only."
 ],
 code:`function Counter() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    document.title = "Clicked " + count;
  }, [count]);

  const add = () => {
    setCount(c => c + 1);
    setItems(prev => [...prev, count]);
  };
  return <button onClick={add}>{count}</button>;
}`,
 traps:["Missing dependencies in `useEffect` cause stale values.","`items.push(x); setItems(items)` won’t re-render: same reference."],
 cards:[["Why use `setX(prev => ...)`?","Updates are batched; the updater always receives the latest value."],["What does the deps array do?","Controls when the effect re-runs: once ([]), or when listed values change."],["useRef vs useState?","Changing a ref doesn’t re-render; changing state does."]],
 quiz:[["`useEffect(fn, [])` runs…",["every render","once after mount","never","before render"],1,"Empty deps: after the first render (twice in StrictMode during development)."],["Which hook changes without re-rendering?",["useState","useRef","useEffect","useReducer"],1,"Refs are mutable boxes."]],
 vis:{type:"cycle", steps:["setState(new value)","Component re-renders","React updates the DOM","useEffect runs if deps changed"]},
 prac:[{type:"bug", lines:["const addTodo = (text) => {","  const next = todos;","  next.push({ id: Date.now(), text });","  setTodos(next);","};"], bug:1, fix:"  const next = [...todos];", explain:"Mutating the same array keeps the same reference, so React skips the update. Copy it first."}]},
{id:"react-patterns", t:"Forms, context & data fetching", lvl:"I",
 hook:"Lift state up; use context only when props drill too deep.",
 sum:"Patterns for real apps: controlled forms, shared state, routing and loading data.",
 pts:[
  "**Controlled inputs:** `value` comes from state and `onChange` updates it.",
  "**Lifting state up:** move shared state to the nearest common parent.",
  "**Context** (`createContext`, `useContext`) shares app-wide data like theme or user without prop drilling.",
  "Fetch data in `useEffect` (or with React Query/SWR) and track `loading` and `error` states.",
  "`useMemo` caches values and `useCallback` caches functions; use them when profiling shows a need.",
  "React Router: `<Routes>`, `<Route path>`, `useNavigate`, `useParams`."
 ],
 code:`const ThemeContext = createContext("light");

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);
  const theme = useContext(ThemeContext);
  if (loading) return <p>Loading…</p>;
  return <ul className={theme}>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
 traps:["One big context holding fast-changing values re-renders every consumer.","Skipping loading and error states makes the UI flash or crash."],
 cards:[["Controlled vs uncontrolled input?","Controlled: the value lives in React state. Uncontrolled: the DOM keeps it, read through a ref."],["What problem does Context solve?","Prop drilling through components that don’t use the data."],["useMemo vs useCallback?","useMemo caches a computed value; useCallback caches a function."]],
 quiz:[["Share the logged-in user across many components:",["prop drilling everywhere","Context","useRef","a global variable"],1,"Context provides it to any descendant."],["A controlled input needs…",["value and onChange","a ref only","defaultValue only","an id"],0,"State drives the value."]],
 vis:{type:"tree", root:"ThemeContext.Provider", kids:[{n:"Layout", k:["Sidebar uses the theme","Page uses the theme"]}]},
 prac:[{type:"order", lines:["const [email, setEmail] = useState(\"\");","const onChange = e => setEmail(e.target.value);","return <input value={email} onChange={onChange} />;"], explain:"Create state, write the change handler, then bind both to the input."}]},
{id:"react-adv", t:"Rendering & performance", lvl:"A",
 hook:"Renders are cheap until they aren’t: measure first, then memoize.",
 sum:"How React renders and reconciles, and how to keep large apps fast.",
 pts:[
  "**Reconciliation:** React compares the new element tree with the previous one and updates only what changed.",
  "A component re-renders when its state changes, its parent re-renders, or a context it uses changes.",
  "`React.memo` skips re-rendering when props are shallowly equal.",
  "Code splitting with `React.lazy` and `Suspense` loads parts of the app on demand.",
  "Custom hooks (`useSomething`) extract reusable stateful logic.",
  "StrictMode runs effects twice in development to surface bugs."
 ],
 code:`const Row = React.memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Chart = React.lazy(() => import("./Chart"));`,
 traps:["`React.memo` does nothing if you pass a new inline function every render; wrap it in `useCallback`.","Memoizing everything adds complexity without making things faster."],
 cards:[["What is reconciliation?","React’s diffing of the old and new trees to apply minimal DOM updates."],["When does a component re-render?","Its state changes, its parent re-renders, or a context it uses changes."],["What is a custom hook?","A function starting with `use` that reuses hook logic across components."]],
 quiz:[["React.lazy is used for…",["state","code splitting","styling","routing"],1,"Loads components on demand."],["React.memo compares props…",["deeply","shallowly","never","as JSON"],1,"Shallow comparison."]],
 vis:{type:"flow", steps:["setState","Render a new virtual tree","Diff with the previous tree","Commit minimal DOM changes"]},
 prac:[{type:"order", lines:["function useToggle(initial = false) {","  const [on, setOn] = useState(initial);","  const toggle = () => setOn(o => !o);","  return [on, toggle];","}"], explain:"A custom hook creates state, defines helpers and returns them."}]}
];

export const C_TW = [
{id:"tw-basics", t:"Utility-first basics", lvl:"B",
 hook:"Style in the markup: one class, one job.",
 sum:"Tailwind CSS builds designs from small utility classes instead of custom CSS files.",
 pts:[
  "Spacing scale: `p-4` = 1rem padding, `m-2` = 0.5rem margin; `px-`/`py-` target one axis.",
  "Colors: `bg-blue-500`, `text-gray-700`; shades run from 50 (light) to 950 (dark).",
  "Typography: `text-sm` to `text-4xl`, `font-bold`, `leading-tight`, `tracking-wide`.",
  "Sizing: `w-full`, `h-12`, `max-w-md`, `min-h-screen`.",
  "Borders and depth: `border`, `border-gray-200`, `rounded-lg`, `shadow-md`.",
  "Arbitrary values when needed: `w-[37px]`, `bg-[#0e8580]`."
 ],
 code:`<button class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
  Save
</button>

<div class="max-w-md mx-auto p-6 bg-white rounded-xl border border-gray-200">
  <h2 class="text-xl font-bold text-gray-900">Profile</h2>
  <p class="mt-2 text-sm text-gray-600">Update your details.</p>
</div>`,
 traps:["Building class names dynamically, like `bg-${color}-500`, means Tailwind never sees them; write full class names.","Many one-off arbitrary values defeat the design system."],
 cards:[["What does `p-4` mean?","Padding of 1rem (16px) on all sides."],["Why don’t dynamically built class names work?","Tailwind scans source files for complete class strings; generated ones are missing from the CSS."],["How do you use a one-off value?","Arbitrary values in brackets, e.g. `w-[37px]`."]],
 quiz:[["`mx-auto` does…",["adds vertical margin","centers a block horizontally","adds padding","nothing"],1,"Auto left and right margins."],["`text-gray-500` sets…",["background","text color","border","font size"],1,"Text color."]],
 vis:{type:"stack", layers:["margin: m-*","border: border, rounded-*","padding: p-*","content: w-*, h-*"]},
 prac:[{type:"blank", code:'<div class="max-w-md ____ p-6 bg-white rounded-xl">\n  Centered card\n</div>', answer:["mx-auto"], explain:"`mx-auto` centers a block that has a max width."}]},
{id:"tw-layout", t:"Flexbox & grid", lvl:"I",
 hook:"flex for one direction, grid for two.",
 sum:"Lay out pages with flex and grid utilities.",
 pts:[
  "`flex` with `flex-row`/`flex-col`; `items-center` aligns on the cross axis, `justify-between` on the main axis.",
  "`gap-4` spaces children in both flex and grid.",
  "`flex-1` lets an item grow; `shrink-0` stops shrinking; `flex-wrap` wraps to new lines.",
  "Grid: `grid grid-cols-3`, `col-span-2`, `grid-rows-*`.",
  "Center anything: `flex items-center justify-center` or `grid place-items-center`.",
  "Positioning: `relative`, `absolute top-0 right-0`, `sticky top-0`, `z-10`."
 ],
 code:`<nav class="flex items-center justify-between px-6 h-16 border-b">
  <span class="font-bold">Recall</span>
  <div class="flex gap-4 text-sm">
    <a href="#">Docs</a><a href="#">Pricing</a>
  </div>
</nav>

<section class="grid grid-cols-3 gap-6 p-6">
  <div class="col-span-2">Main</div>
  <aside>Sidebar</aside>
</section>`,
 traps:["`items-center` and `justify-center` swap roles when you switch to `flex-col`.","Forgetting `flex` on the parent makes the alignment classes do nothing."],
 cards:[["justify vs items?","justify-* aligns along the main axis; items-* along the cross axis."],["Flex vs grid?","Flex arranges in one direction; grid in rows and columns at once."],["How do you center a div?","Put `flex items-center justify-center` (or `grid place-items-center`) on the parent."]],
 quiz:[["Push navbar items to both ends:",["justify-between","items-between","gap-between","space-x-auto"],0,"justify-between on the flex parent."],["Three equal columns:",["flex-3","grid grid-cols-3","cols-3","grid-3"],1,"grid grid-cols-3."]],
 vis:{type:"compare", cols:[{h:"Flex (one axis)", items:["row or column","justify = main axis","items = cross axis","navbars, toolbars"]},{h:"Grid (two axes)", items:["rows and columns","grid-cols-N","col-span-N","page layouts, galleries"]}]},
 prac:[{type:"bug", lines:['<div class="items-center justify-center h-screen">','  <p>Centered?</p>','</div>'], bug:0, fix:'<div class="flex items-center justify-center h-screen">', explain:"Alignment utilities need `flex` (or grid) on the parent."}]},
{id:"tw-resp", t:"Responsive design, states & dark mode", lvl:"I",
 hook:"Mobile first: unprefixed is the phone, `md:` and up override it.",
 sum:"Variants apply styles at breakpoints, on interaction and in dark mode.",
 pts:[
  "Breakpoints are mobile-first: `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px.",
  "`w-full md:w-1/2`: full width on phones, half width from 768px up.",
  "State variants: `hover:`, `focus:`, `active:`, `disabled:`, `group-hover:`.",
  "Dark mode: `dark:bg-gray-900`.",
  "Variants stack: `md:hover:bg-blue-700`.",
  "Transitions: `transition`, `duration-200`, `ease-out`."
 ],
 code:`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <article class="group p-4 rounded-lg bg-white dark:bg-gray-800 hover:shadow-lg transition">
    <h3 class="font-semibold group-hover:text-blue-600">Card</h3>
    <button class="mt-3 px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50" disabled>
      Buy
    </button>
  </article>
</div>`,
 traps:["`sm:` means 640px and up, not ‘small screens only’.","`group-hover:` needs the `group` class on the parent."],
 cards:[["What does `md:flex` mean?","display: flex from 768px wide and up."],["Style a child when the parent is hovered?","Add `group` to the parent and `group-hover:` to the child."],["What does mobile-first mean?","Unprefixed classes apply everywhere; prefixes add overrides for larger screens."]],
 quiz:[["`hidden md:block` shows the element…",["only on phones","from 768px up","never","on hover"],1,"Hidden by default, block from md."],["Dark mode prefix:",["night:","dark:","theme:","black:"],1,"dark:"]],
 vis:{type:"flow", steps:["base: 0px+","sm: 640px+","md: 768px+","lg: 1024px+","xl: 1280px+"]},
 prac:[{type:"blank", code:'<aside class="hidden ____:block w-64">\n  Sidebar only on tablets and up\n</aside>', answer:["md"], explain:"`hidden md:block` hides it on phones and shows it from 768px."}]},
{id:"tw-adv", t:"Config, components & production", lvl:"A",
 hook:"Extend the theme once; reuse it everywhere.",
 sum:"Customize Tailwind for a design system and keep production CSS small.",
 pts:[
  "Customize the theme (v3: `theme.extend` in `tailwind.config.js`; v4: `@theme` in CSS) for brand colors, fonts and spacing.",
  "`content` paths tell Tailwind which files to scan; unused classes are never generated.",
  "`@apply` reuses utilities inside CSS; use it sparingly and prefer components.",
  "Reusable UI = React components with class variants (helpers like `clsx`, `cva`).",
  "Plugins: `@tailwindcss/forms`, `@tailwindcss/typography` (the `prose` class).",
  "`tailwind-merge` resolves conflicting classes such as `p-2 p-4`."
 ],
 code:`// tailwind.config.js (v3)
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 500: "#0e8580", 600: "#0b6d69" } },
      fontFamily: { display: ["Bricolage Grotesque", "sans-serif"] },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};`,
 traps:["Wrong `content` paths make your classes silently disappear in production.","Overusing `@apply` recreates the CSS mess Tailwind avoids."],
 cards:[["Why does Tailwind need content paths?","It scans those files to generate only the classes you use."],["`extend` vs overriding `theme`?","extend adds to the defaults; setting theme.colors directly replaces them."],["What is `prose`?","The typography plugin’s class for nicely styled article text."]],
 quiz:[["Classes missing in production usually mean…",["wrong content paths","an old browser","dark mode","no internet"],0,"Tailwind didn’t scan the file."],["Add a brand color without losing defaults:",["theme.colors","theme.extend.colors","plugins","content"],1,"Use extend."]],
 vis:{type:"flow", steps:["Your files (content paths)","Tailwind scans class names","Generates only used CSS","Small production stylesheet"]},
 prac:[{type:"order", lines:["module.exports = {","  content: [\"./src/**/*.{js,jsx}\"],","  theme: { extend: {} },","  plugins: [],","};"], explain:"A Tailwind config exports content, theme and plugins."}]}
];
