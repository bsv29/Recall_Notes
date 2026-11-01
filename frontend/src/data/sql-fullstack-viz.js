export const C_SQL = [
{id:"sql-basics", t:"SELECT, WHERE & sorting", lvl:"B",
 hook:"SQL is written SELECT-first but runs FROM-first.",
 sum:"Query rows and columns from tables with filtering, sorting and limits.",
 pts:[
  "Shape: `SELECT cols FROM table WHERE condition ORDER BY col LIMIT n`.",
  "Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
  "Filters: `=`, `<>`, `BETWEEN`, `IN (...)`, `LIKE 'A%'`, `IS NULL`.",
  "`NULL` means unknown: test with `IS NULL`, never `= NULL`.",
  "`DISTINCT` removes duplicate rows; `AS` creates aliases.",
  "Common types: `INT`, `DECIMAL`, `VARCHAR(n)`, `DATE`, `BOOLEAN`."
 ],
 code:`SELECT name, salary AS monthly
FROM employees
WHERE dept IN ('IT', 'HR')
  AND salary BETWEEN 30000 AND 80000
  AND manager_id IS NOT NULL
ORDER BY salary DESC
LIMIT 5;`,
 traps:["`WHERE col = NULL` never matches; use `IS NULL`.","A SELECT alias can’t be used in WHERE, because WHERE runs first."],
 cards:[["Logical order of a SQL query?","FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."],["Rows with a missing email?","WHERE email IS NULL."],["What does LIKE 'A%' match?","Values starting with A."]],
 quiz:[["Which clause runs first?",["SELECT","WHERE","FROM","ORDER BY"],2,"FROM picks the table first."],["`WHERE x = NULL` returns…",["rows where x is null","no rows","all rows","an error"],1,"Comparisons with NULL are unknown, so nothing matches."]],
 vis:{type:"flow", steps:["FROM","WHERE","GROUP BY","HAVING","SELECT","ORDER BY","LIMIT"]},
 prac:[{type:"bug", lines:["SELECT name","FROM users","WHERE email = NULL;"], bug:2, fix:"WHERE email IS NULL;", explain:"Use `IS NULL` to test for missing values."}]},
{id:"sql-joins", t:"Joins", lvl:"I",
 hook:"INNER keeps matches; LEFT keeps everything on the left.",
 sum:"Combine rows from related tables using keys.",
 pts:[
  "`INNER JOIN`: only rows that match in both tables.",
  "`LEFT JOIN`: every left row; unmatched right columns become `NULL`.",
  "`RIGHT JOIN` mirrors LEFT; `FULL OUTER JOIN` keeps all rows from both.",
  "`CROSS JOIN` makes every combination; a **self join** joins a table to itself (employee → manager).",
  "Join on keys: primary key ↔ foreign key.",
  "Find unmatched rows: `LEFT JOIN ... WHERE right.id IS NULL`."
 ],
 code:`-- customers with their orders, including customers with none
SELECT c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;

-- customers who never ordered
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
 traps:["Filtering the right table in WHERE turns a LEFT JOIN into an INNER JOIN; put that condition in ON.","Joining on non-unique keys multiplies rows."],
 cards:[["INNER vs LEFT JOIN?","INNER keeps only matches; LEFT keeps all left rows with NULLs where nothing matches."],["Customers with no orders?","LEFT JOIN orders and keep rows where orders.id IS NULL."],["What is a self join?","Joining a table to itself, e.g. employees to their managers."]],
 quiz:[["All employees, even without a department:",["INNER JOIN","LEFT JOIN from employees","CROSS JOIN","UNION"],1,"LEFT keeps every employee."],["CROSS JOIN of 3 rows and 4 rows gives…",["7","12","3","4"],1,"Every combination: 3 × 4."]],
 vis:{type:"compare", cols:[{h:"INNER JOIN", items:["A ∩ B","only matching rows"]},{h:"LEFT JOIN", items:["all of A","plus matches from B","NULL where no match"]},{h:"FULL OUTER JOIN", items:["all of A and B","NULLs on both sides"]}]},
 prac:[{type:"order", lines:["SELECT e.name, d.name AS dept","FROM employees e","LEFT JOIN departments d","  ON d.id = e.dept_id","ORDER BY e.name;"], explain:"SELECT, FROM, JOIN … ON, then ORDER BY."}]},
{id:"sql-agg", t:"GROUP BY, HAVING & subqueries", lvl:"I",
 hook:"WHERE filters rows; HAVING filters groups.",
 sum:"Summarize data with aggregates and nest queries inside each other.",
 pts:[
  "Aggregates: `COUNT(*)`, `SUM`, `AVG`, `MIN`, `MAX`.",
  "`GROUP BY` makes one row per group; every selected non-aggregated column must be grouped.",
  "`HAVING` filters after grouping: `HAVING COUNT(*) > 5`.",
  "`COUNT(col)` skips NULLs; `COUNT(*)` counts all rows.",
  "Subqueries can sit in `WHERE` (`IN (SELECT ...)`), in `FROM` (derived tables), or refer to the outer row (correlated).",
  "CTEs (`WITH name AS (...)`) make complex queries readable."
 ],
 code:`WITH dept_pay AS (
  SELECT dept, AVG(salary) AS avg_sal, COUNT(*) AS n
  FROM employees
  GROUP BY dept
  HAVING COUNT(*) >= 3
)
SELECT dept, ROUND(avg_sal, 0) AS avg_sal
FROM dept_pay
WHERE avg_sal > (SELECT AVG(salary) FROM employees)
ORDER BY avg_sal DESC;`,
 traps:["Using an aggregate in WHERE fails; use HAVING.","Selecting a column that isn’t in GROUP BY is an error in strict SQL."],
 cards:[["WHERE vs HAVING?","WHERE filters rows before grouping; HAVING filters groups after."],["COUNT(*) vs COUNT(col)?","COUNT(*) counts rows; COUNT(col) ignores NULLs in col."],["What is a CTE?","A named temporary result defined with WITH and used in the main query."]],
 quiz:[["Departments with more than 10 people:",["WHERE COUNT(*) > 10","HAVING COUNT(*) > 10","GROUP BY > 10","LIMIT 10"],1,"Filter groups with HAVING."],["AVG ignores…",["zeros","NULLs","duplicates","negatives"],1,"Aggregates skip NULLs."]],
 vis:{type:"flow", steps:["All rows","WHERE drops rows","GROUP BY buckets rows","Aggregate each bucket","HAVING drops groups"]},
 prac:[{type:"bug", lines:["SELECT dept, COUNT(*)","FROM employees","WHERE COUNT(*) > 5","GROUP BY dept;"], bug:2, fix:"(move it after GROUP BY as) HAVING COUNT(*) > 5", explain:"Aggregates can’t be used in WHERE. Filter groups with HAVING after GROUP BY."}]},
{id:"sql-adv", t:"Window functions, indexes & transactions", lvl:"A",
 hook:"Window functions aggregate without collapsing rows.",
 sum:"Rank and compare rows, make queries fast, and keep data consistent.",
 pts:[
  "Window functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, `SUM() OVER (...)`.",
  "`OVER (PARTITION BY dept ORDER BY salary DESC)` defines groups and order without merging rows.",
  "Indexes (B-trees) speed up WHERE, JOIN and ORDER BY but slow down writes; inspect with `EXPLAIN`.",
  "**ACID** transactions: Atomicity, Consistency, Isolation, Durability; `BEGIN`, `COMMIT`, `ROLLBACK`.",
  "Normalization (1NF, 2NF, 3NF) removes duplication; denormalize deliberately for read speed.",
  "Top-N per group: rank in a CTE, then filter `rnk <= N`."
 ],
 code:`WITH ranked AS (
  SELECT name, dept, salary,
         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT * FROM ranked WHERE rnk <= 2;

BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;`,
 traps:["You can’t filter on a window function in the same query’s WHERE; wrap it in a CTE.","Indexing every column slows inserts and updates."],
 cards:[["RANK vs DENSE_RANK vs ROW_NUMBER?","With ties: RANK leaves gaps (1, 1, 3), DENSE_RANK doesn’t (1, 1, 2), ROW_NUMBER is always unique."],["What does ACID mean?","Atomicity, Consistency, Isolation, Durability."],["When does an index help?","Selective lookups in WHERE, JOIN and ORDER BY on large tables."]],
 quiz:[["Salaries 100, 100, 90 with DENSE_RANK give…",["1, 2, 3","1, 1, 3","1, 1, 2","1, 2, 2"],2,"No gaps after ties."],["Second-highest salary per department:",["GROUP BY + MAX","window function + filter","LIMIT 2","DISTINCT"],1,"Rank within partitions, then filter."]],
 vis:{type:"compare", cols:[{h:"GROUP BY", items:["collapses rows","one row per group"]},{h:"Window function", items:["keeps every row","adds a computed column","ranks, running totals, LAG"]}]},
 prac:[{type:"blank", code:"SELECT name, dept,\n  ROW_NUMBER() OVER (____ BY dept ORDER BY salary DESC) AS rn\nFROM employees;", answer:["PARTITION"], explain:"`PARTITION BY` restarts the numbering for each department."}]}
];

export const C_JFS = [
{id:"jfs-arch", t:"Full-stack architecture", lvl:"B",
 hook:"Browser → REST API → service → database, and back as JSON.",
 sum:"A Java full-stack app pairs a React (or Angular) frontend with a Spring Boot backend and a SQL database.",
 pts:[
  "The frontend renders the UI and calls the backend over HTTP with JSON.",
  "The backend (Spring Boot) exposes REST endpoints, runs business logic and talks to the database.",
  "Layered backend: **Controller** (HTTP) → **Service** (business rules) → **Repository** (data access).",
  "Database: MySQL or PostgreSQL through JPA/Hibernate.",
  "Build with Maven or Gradle; ship as a JAR, often inside Docker.",
  "HTTP methods: GET reads, POST creates, PUT/PATCH update, DELETE removes. Status codes: 200, 201, 400, 401, 403, 404, 500."
 ],
 code:`GET    /api/products        → 200  [ {...}, {...} ]
GET    /api/products/7      → 200  {...}   or 404
POST   /api/products        → 201  {...}   body: new product
PUT    /api/products/7      → 200  {...}
DELETE /api/products/7      → 204`,
 traps:["Business logic inside controllers is hard to test and reuse.","Returning 200 for errors hides failures from the frontend."],
 cards:[["Controller vs service vs repository?","Controller handles HTTP; service holds business logic; repository accesses the database."],["Status code for a created resource?","201 Created."],["PUT vs PATCH?","PUT replaces the whole resource; PATCH updates part of it."]],
 quiz:[["Which layer holds business rules?",["Controller","Service","Repository","Entity"],1,"The service layer."],["A request without login gets…",["401","403","404","500"],0,"401 Unauthorized; 403 means logged in but not allowed."]],
 vis:{type:"flow", steps:["React UI","HTTP + JSON","@RestController","@Service","JpaRepository","MySQL / PostgreSQL"]},
 prac:[{type:"order", lines:["Browser sends GET /api/products","Controller receives the request","Service applies business rules","Repository queries the database","Controller returns JSON with 200"], explain:"A request flows down the layers and the response flows back up."}]},
{id:"jfs-spring", t:"Spring Boot REST APIs", lvl:"I",
 hook:"Annotations wire it all: @RestController, @Service, constructor injection.",
 sum:"Build REST endpoints with Spring Boot, dependency injection and validation.",
 pts:[
  "`@SpringBootApplication` turns on auto-configuration and component scanning.",
  "`@RestController` with `@GetMapping`/`@PostMapping`; read input with `@PathVariable`, `@RequestParam`, `@RequestBody`.",
  "**Dependency injection:** Spring creates beans and passes them in; prefer constructor injection.",
  "`ResponseEntity` controls status and headers; `@RestControllerAdvice` handles exceptions globally.",
  "Validation: `@Valid` with `@NotBlank`, `@Email`, `@Size` on DTOs.",
  "Settings live in `application.properties` / `application.yml`, with profiles for dev and prod."
 ],
 code:`@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return service.find(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductDto dto) {
        return ResponseEntity.status(201).body(service.create(dto));
    }
}`,
 traps:["Field injection (`@Autowired` on fields) hides dependencies and makes testing harder.","Returning JPA entities directly can leak fields or loop on relations; use DTOs."],
 cards:[["What is dependency injection?","The framework creates objects and supplies their dependencies instead of your code calling new."],["@PathVariable vs @RequestParam?","PathVariable reads /products/7; RequestParam reads ?page=2."],["How do you handle exceptions globally?","@RestControllerAdvice with @ExceptionHandler methods."]],
 quiz:[["Read JSON from the request body:",["@RequestParam","@RequestBody","@PathVariable","@Header"],1,"@RequestBody."],["Preferred injection style:",["field","constructor","static","global"],1,"Constructor injection."]],
 vis:{type:"tree", root:"Spring container (beans)", kids:[{n:"ProductController", k:["needs ProductService"]},{n:"ProductService", k:["needs ProductRepository"]}]},
 prac:[{type:"blank", code:"@GetMapping(\"/{id}\")\npublic Product get(@____ Long id) {\n    return service.find(id);\n}", answer:["PathVariable"], explain:"`@PathVariable` binds `{id}` from the URL."}]},
{id:"jfs-jpa", t:"JPA, Hibernate & databases", lvl:"I",
 hook:"Entities are tables; repositories write the SQL for you.",
 sum:"Map Java classes to tables and query them with Spring Data JPA.",
 pts:[
  "`@Entity`, `@Id`, `@GeneratedValue`, `@Column` map a class to a table.",
  "`JpaRepository<Product, Long>` gives `save`, `findById`, `findAll`, `deleteById` and paging.",
  "Derived queries from method names: `findByCategoryNameAndPriceLessThan(...)`; custom ones with `@Query`.",
  "Relations: `@OneToMany`, `@ManyToOne`, `@ManyToMany`; prefer `LAZY` fetching.",
  "`@Transactional` wraps a method in a database transaction.",
  "**N+1 problem:** one query for a list plus one per item; fix with `JOIN FETCH` or entity graphs."
 ],
 code:`@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;
    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;
}

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryNameAndPriceLessThan(String name, BigDecimal max);
}`,
 traps:["EAGER fetching everywhere loads half the database.","Using `double` for money causes rounding errors; use `BigDecimal`."],
 cards:[["What is the N+1 problem?","One query for the list plus one per item for its relation; fix with JOIN FETCH."],["What does JpaRepository give you?","CRUD, paging and sorting methods without writing SQL."],["LAZY vs EAGER?","LAZY loads relations when accessed; EAGER loads them immediately."]],
 quiz:[["Annotation for the primary key:",["@Key","@Id","@Primary","@Column"],1,"@Id."],["Java type for money:",["double","float","BigDecimal","int"],2,"Exact decimal arithmetic."]],
 vis:{type:"compare", cols:[{h:"Java (JPA)", items:["@Entity Product","field price","@ManyToOne category"]},{h:"Database", items:["table product","column price","foreign key category_id"]}]},
 prac:[{type:"bug", lines:["@Entity","public class Order {","    private Long id;","    private BigDecimal total;","}"], bug:2, fix:"    @Id @GeneratedValue private Long id;", explain:"Every entity needs an `@Id` primary key."}]},
{id:"jfs-adv", t:"Security, testing & deployment", lvl:"A",
 hook:"Authenticate who, authorize what, test it, ship it in a container.",
 sum:"Secure the API with JWT, test each layer, and deploy with Docker.",
 pts:[
  "Spring Security is a filter chain: **authentication** (who you are) vs **authorization** (what you may do).",
  "Stateless JWT auth: login returns a signed token; the frontend sends `Authorization: Bearer <token>`.",
  "Hash passwords with `BCryptPasswordEncoder`; never store plain text.",
  "Configure CORS so the frontend’s origin may call the API.",
  "Testing: JUnit 5 + Mockito for services, `@WebMvcTest` for controllers, `@DataJpaTest` for repositories.",
  "Deploy: `mvn package` → JAR → Docker image → cloud; automate with GitHub Actions."
 ],
 code:`@Bean
SecurityFilterChain security(HttpSecurity http) throws Exception {
    return http
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}`,
 traps:["Tokens in localStorage are exposed to XSS; httpOnly cookies are safer.","Disabling CSRF is fine for stateless token APIs, not for cookie-session apps."],
 cards:[["Authentication vs authorization?","Authentication proves identity; authorization decides permissions."],["What is inside a JWT?","A header, a payload of claims and a signature, base64url-encoded."],["Why BCrypt?","Slow, salted hashing that resists brute force."]],
 quiz:[["403 Forbidden means…",["not logged in","logged in but not allowed","not found","server error"],1,"An authorization failure."],["Test only the web layer:",["@SpringBootTest","@WebMvcTest","@DataJpaTest","@Entity"],1,"@WebMvcTest."]],
 vis:{type:"flow", steps:["POST /login","Check BCrypt hash","Issue signed JWT","Client sends Bearer token","JWT filter validates","Controller runs"]},
 prac:[{type:"order", lines:["User submits email and password","Server checks the BCrypt hash","Server returns a signed JWT","Browser stores the token","Later requests send the Bearer token"], explain:"Login issues a token; every later request proves identity with it."}]}
];

export const C_PFS = [
{id:"pfs-arch", t:"Full stack with Python", lvl:"B",
 hook:"React in front, FastAPI or Django behind, PostgreSQL underneath.",
 sum:"A Python full-stack app pairs a JavaScript frontend with a Python web API and a database.",
 pts:[
  "Frontend: React (or Django templates) renders the UI.",
  "Backend: **FastAPI** (async, fast, type hints), **Django** (batteries included: ORM, admin, auth) or **Flask** (minimal).",
  "The API returns JSON; the frontend calls it with `fetch` or axios.",
  "ORM: SQLAlchemy (FastAPI, Flask) or the Django ORM maps classes to tables.",
  "Servers: `uvicorn` (ASGI) for FastAPI; `gunicorn` (WSGI) for Django and Flask.",
  "Secrets such as database URLs live in environment variables (`.env`)."
 ],
 code:`React  --fetch("/api/todos")-->  FastAPI (uvicorn)
                                   |
                                   v
                              SQLAlchemy ORM
                                   |
                                   v
                              PostgreSQL`,
 traps:["Hard-coding secrets in code leaks them to Git.","Forgetting CORS blocks the React dev server from calling the API."],
 cards:[["Django vs FastAPI?","Django: a full framework with ORM, admin and auth. FastAPI: lightweight, async, auto docs from type hints."],["ASGI vs WSGI?","ASGI supports async and websockets; WSGI is the older synchronous standard."],["Where do secrets go?","Environment variables or a secrets manager, never source code."]],
 quiz:[["Server used to run FastAPI:",["npm","uvicorn","Apache Tomcat","Maven"],1,"uvicorn (ASGI)."],["Python framework with a built-in admin panel:",["Flask","FastAPI","Django","Streamlit"],2,"Django."]],
 vis:{type:"flow", steps:["React UI","fetch / axios (JSON)","FastAPI route","Service logic","SQLAlchemy","PostgreSQL"]},
 prac:[{type:"order", lines:["React calls fetch('/api/todos')","uvicorn hands the request to FastAPI","The route function queries the database","FastAPI returns JSON","React updates state and re-renders"], explain:"The request goes down to the database and the JSON comes back up."}]},
{id:"pfs-fastapi", t:"FastAPI REST APIs", lvl:"I",
 hook:"Type hints in, validation and docs out.",
 sum:"Build validated, documented APIs with FastAPI and Pydantic.",
 pts:[
  "Routes: `@app.get('/items/{id}')`, `@app.post(...)`; path and query parameters come from function arguments.",
  "**Pydantic** models validate request bodies and shape responses (`response_model`).",
  "Interactive docs are generated at `/docs` (Swagger UI) and `/redoc`.",
  "Use `async def` for I/O-bound routes; raise `HTTPException(status_code=404)` for errors.",
  "Dependency injection with `Depends()` for DB sessions and the current user.",
  "`CORSMiddleware` allows the frontend’s origin."
 ],
 code:`from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Todo(BaseModel):
    title: str
    done: bool = False

todos: dict[int, Todo] = {}

@app.post("/todos/{todo_id}", status_code=201)
def create(todo_id: int, todo: Todo):
    todos[todo_id] = todo
    return todo

@app.get("/todos/{todo_id}")
def read(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Not found")
    return todos[todo_id]`,
 traps:["Blocking calls (like `time.sleep` or sync DB drivers) inside `async def` freeze the server.","Returning ORM objects without a response model can leak fields."],
 cards:[["How does FastAPI validate input?","With Pydantic models built from your type hints."],["Where are FastAPI’s docs?","/docs (Swagger UI) and /redoc."],["What is Depends()?","FastAPI’s dependency injection, e.g. for DB sessions or auth."]],
 quiz:[["A wrong type in the JSON body returns…",["500","422","200","301"],1,"422 Unprocessable Entity."],["Return a 404 in FastAPI:",["return 404","raise HTTPException(status_code=404)","abort(404)","throw 404"],1,"HTTPException."]],
 vis:{type:"flow", steps:["HTTP request","Path, query, body parsed","Pydantic validates","Your function runs","response_model shapes JSON"]},
 prac:[{type:"blank", code:"from pydantic import BaseModel\n\nclass User(____):\n    name: str\n    age: int", answer:["BaseModel"], explain:"Pydantic models subclass `BaseModel`."}]},
{id:"pfs-django", t:"Django & its ORM", lvl:"I",
 hook:"Models → migrations → views → URLs → templates.",
 sum:"Django’s MTV pattern, ORM and admin let you build data-driven apps fast.",
 pts:[
  "MTV: **Model** (data), **Template** (HTML), **View** (logic); `urls.py` routes requests to views.",
  "Models define tables; `makemigrations` then `migrate` applies schema changes.",
  "QuerySets: `Post.objects.filter(published=True).order_by('-created')`; they’re lazy until used.",
  "The admin site generates CRUD screens for registered models.",
  "Django REST Framework (DRF): serializers and viewsets for JSON APIs.",
  "`select_related` (foreign keys) and `prefetch_related` (many-relations) prevent N+1 queries."
 ],
 code:`# models.py
class Post(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    published = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

# views.py
def feed(request):
    posts = (Post.objects.filter(published=True)
             .select_related("author")
             .order_by("-created")[:20])
    return render(request, "feed.html", {"posts": posts})`,
 traps:["Touching `post.author` in a loop without `select_related` causes N+1 queries.","Forgetting to run migrations leaves the database out of sync."],
 cards:[["What is MTV?","Model, Template, View: Django’s version of MVC."],["select_related vs prefetch_related?","select_related joins foreign keys in one query; prefetch_related runs a second query for many-relations."],["Are QuerySets lazy?","Yes, they only hit the database when evaluated."]],
 quiz:[["Command that creates migration files:",["migrate","makemigrations","runserver","collectstatic"],1,"makemigrations."],["Avoid N+1 on a ForeignKey:",["prefetch_related","select_related","all()","raw()"],1,"select_related joins it."]],
 vis:{type:"flow", steps:["URL","urls.py","View","Model (ORM) ↔ DB","Template → HTML"]},
 prac:[{type:"order", lines:["Edit models.py","python manage.py makemigrations","python manage.py migrate","python manage.py runserver"], explain:"Change the model, create the migration, apply it, then run the server."}]},
{id:"pfs-adv", t:"Auth, background jobs & deployment", lvl:"A",
 hook:"Hash passwords, sign tokens, containerize, ship.",
 sum:"Production concerns: authentication, background work, caching, testing and deployment.",
 pts:[
  "Auth: OAuth2 password flow + JWT in FastAPI; Django sessions or DRF tokens.",
  "Hash passwords with bcrypt or argon2 (`passlib`); never store them in plain text.",
  "Background work: FastAPI `BackgroundTasks` for small jobs; Celery + Redis for heavy ones.",
  "Cache hot data in Redis; rate-limit public endpoints.",
  "Testing: `pytest` with FastAPI’s `TestClient` or Django’s `TestCase`.",
  "Deploy: Docker image → Render, Railway or AWS; Nginx in front; CI with GitHub Actions."
 ],
 code:`from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2 = OAuth2PasswordBearer(tokenUrl="token")

def current_user(token: str = Depends(oauth2)):
    payload = decode_jwt(token)          # verify signature and expiry
    if payload is None:
        raise HTTPException(status_code=401)
    return payload["sub"]

@app.get("/me")
def me(user: str = Depends(current_user)):
    return {"user": user}`,
 traps:["Long-running work inside a request handler times out; move it to a background worker.","Committing `.env` files leaks credentials."],
 cards:[["Why Celery?","To run heavy or scheduled jobs outside the request, in worker processes."],["How are passwords stored safely?","As salted, slow hashes (bcrypt or argon2)."],["How do you test FastAPI endpoints?","pytest with TestClient."]],
 quiz:[["Message broker for Celery:",["SQLite","Redis or RabbitMQ","localStorage","CSV"],1,"A broker such as Redis or RabbitMQ."],["Missing or invalid token:",["401","200","302","201"],0,"401 Unauthorized."]],
 vis:{type:"flow", steps:["Code","pytest in CI","Docker image","Deploy (Render, AWS)","Nginx → uvicorn"]},
 prac:[{type:"order", lines:["FROM python:3.12-slim","WORKDIR /app","COPY requirements.txt .","RUN pip install -r requirements.txt","COPY . .","CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\"]"], explain:"Install dependencies before copying the code so Docker can cache that layer."}]}
];

export const C_MPL = [
{id:"mpl-basics", t:"Figures, axes & line plots", lvl:"B",
 hook:"A Figure is the page; Axes are the plots on it.",
 sum:"Matplotlib draws charts; its object-oriented API gives you full control.",
 pts:[
  "`fig, ax = plt.subplots()` creates a Figure and one Axes; you draw on `ax`.",
  "Lines: `ax.plot(x, y, label=..., color=..., linestyle='--', marker='o')`.",
  "Label everything: `ax.set_title`, `ax.set_xlabel`, `ax.set_ylabel`, `ax.legend()`.",
  "`plt.show()` displays; `fig.savefig('plot.png', dpi=200, bbox_inches='tight')` saves.",
  "The pyplot style (`plt.plot`) is quick; the OO style (`ax.plot`) scales to many plots."
 ],
 code:`import matplotlib.pyplot as plt
epochs = [1, 2, 3, 4, 5]
train = [0.9, 0.6, 0.45, 0.38, 0.33]
val = [0.95, 0.7, 0.58, 0.55, 0.56]

fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(epochs, train, marker="o", label="train loss")
ax.plot(epochs, val, marker="o", linestyle="--", label="val loss")
ax.set_xlabel("epoch"); ax.set_ylabel("loss"); ax.set_title("Training curve")
ax.legend()
fig.savefig("loss.png", dpi=200, bbox_inches="tight")`,
 traps:["Calling `savefig` after `show` can save a blank image.","Unlabeled axes make a chart meaningless."],
 cards:[["Figure vs Axes?","The Figure is the whole canvas; an Axes is one plot area with its own axes."],["Save a chart without clipped labels?","fig.savefig(path, bbox_inches='tight')."],["Validation loss rises while training loss falls. What is it?","Overfitting."]],
 quiz:[["Create a figure and one axes:",["plt.figure(1)","fig, ax = plt.subplots()","plt.axes()","plt.new()"],1,"plt.subplots()."],["Show the legend:",["ax.legend()","ax.labels()","ax.key()","plt.title()"],0,"ax.legend()."]],
 vis:{type:"stack", layers:["Figure (the canvas)","Axes (one plot)","Axis, ticks, labels","Lines, bars, text"]},
 prac:[{type:"blank", code:"fig, ax = plt.____(figsize=(6, 4))\nax.plot(x, y)", answer:["subplots"], explain:"`plt.subplots()` returns the figure and the axes."}]},
{id:"mpl-charts", t:"Choosing the right chart", lvl:"I",
 hook:"Trend → line, compare → bar, relate → scatter, spread → histogram.",
 sum:"Pick the chart type that answers your question.",
 pts:[
  "Line: change over time (`ax.plot`).",
  "Bar: compare categories (`ax.bar`, or `ax.barh` for long labels).",
  "Scatter: the relationship between two numeric variables (`ax.scatter`, color with `c=`).",
  "Histogram: the distribution of one variable (`ax.hist(data, bins=30)`).",
  "Box plot: median, quartiles and outliers (`ax.boxplot`).",
  "Pie charts are hard to read; prefer bars."
 ],
 code:`import numpy as np
rng = np.random.default_rng(0)
fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))
axes[0].bar(["A", "B", "C"], [12, 30, 18])
axes[1].scatter(rng.normal(size=100), rng.normal(size=100), alpha=0.6)
axes[2].hist(rng.normal(70, 10, 1000), bins=30)
for ax, t in zip(axes, ["bar", "scatter", "hist"]):
    ax.set_title(t)
fig.tight_layout()`,
 traps:["Too few or too many histogram bins hide the shape.","Bar charts that don’t start at zero exaggerate differences."],
 cards:[["Which chart shows a distribution?","A histogram (or a box plot / KDE)."],["Which chart shows how two numbers relate?","A scatter plot."],["What does a box plot show?","Median, quartiles (IQR) and outliers."]],
 quiz:[["Monthly revenue over a year:",["pie","line","scatter","histogram"],1,"A trend over time."],["Compare sales across 5 products:",["bar","line","histogram","scatter"],0,"Category comparison."]],
 vis:{type:"compare", cols:[{h:"Line", items:["trend over time"]},{h:"Bar", items:["compare categories"]},{h:"Scatter", items:["two numbers together"]},{h:"Histogram", items:["spread of one number"]}]},
 prac:[{type:"blank", code:"ax.____(ages, bins=20)\nax.set_title('Age distribution')", answer:["hist"], explain:"A histogram shows a distribution."}]},
{id:"mpl-layout", t:"Subplots, styling & annotations", lvl:"I",
 hook:"A grid of axes, one story per axes.",
 sum:"Arrange several plots and style them for reports.",
 pts:[
  "`plt.subplots(2, 2)` returns a 2×2 array of axes; `sharex=True` aligns their x-axes.",
  "`fig.tight_layout()` (or `layout='constrained'`) prevents overlapping labels.",
  "Styles: `plt.style.use('seaborn-v0_8')`; colormaps such as `viridis`.",
  "Annotate: `ax.annotate('peak', xy=(x, y), xytext=..., arrowprops={...})`; reference lines with `ax.axhline(y)`.",
  "A second y-axis: `ax.twinx()`.",
  "Log scale: `ax.set_yscale('log')`."
 ],
 code:`fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), sharey=True)
ax1.plot(x, y1); ax1.set_title("Model A")
ax2.plot(x, y2, color="tab:orange"); ax2.set_title("Model B")
peak = y2.argmax()
ax2.annotate("best", xy=(x[peak], y2[peak]), xytext=(x[peak], y2[peak] + 0.1),
             arrowprops={"arrowstyle": "->"})
ax1.axhline(0.9, linestyle=":", color="gray")
fig.tight_layout()`,
 traps:["A 2D grid of axes is indexed `axes[0, 1]`, not `axes[1]`.","Two y-axes can mislead; label both clearly."],
 cards:[["Stop subplot labels overlapping?","fig.tight_layout() or constrained layout."],["Index a 2×2 axes grid?","axes[row, col]."],["Draw a horizontal reference line?","ax.axhline(y)."]],
 quiz:[["Two plots side by side:",["plt.subplots(2, 1)","plt.subplots(1, 2)","plt.plot(2)","plt.twin()"],1,"1 row, 2 columns."],["A second y-axis on the same plot:",["ax.twinx()","ax.second()","plt.y2()","ax.dual()"],0,"twinx."]],
 vis:{type:"grid", rows:2, cols:2, labels:["axes[0, 0]","axes[0, 1]","axes[1, 0]","axes[1, 1]"]},
 prac:[{type:"predict", code:"fig, axes = plt.subplots(2, 3)\nprint(axes.shape)", answer:["(2, 3)"], explain:"A 2×3 grid of axes."}]},
{id:"mpl-adv", t:"Heatmaps, images & ML visuals", lvl:"A",
 hook:"imshow paints arrays; a colorbar makes them readable.",
 sum:"Visualize matrices, images and model results the way ML interviews expect.",
 pts:[
  "`ax.imshow(array, cmap='viridis')` shows images and matrices; add `fig.colorbar(im, ax=ax)`.",
  "Confusion matrix: `imshow` plus text in each cell (or scikit-learn’s `ConfusionMatrixDisplay`).",
  "Loss and accuracy curves: plot train vs validation to spot overfitting.",
  "Decision boundaries: predict on a `meshgrid`, then draw with `contourf`.",
  "Perceptually uniform colormaps (viridis, cividis) are colorblind-friendly; avoid jet.",
  "Use SVG or PDF for reports and PNG at 200+ dpi for slides."
 ],
 code:`cm = np.array([[50, 3], [7, 40]])
fig, ax = plt.subplots()
im = ax.imshow(cm, cmap="Blues")
for i in range(2):
    for j in range(2):
        ax.text(j, i, cm[i, j], ha="center", va="center")
ax.set_xticks([0, 1], labels=["pred 0", "pred 1"])
ax.set_yticks([0, 1], labels=["true 0", "true 1"])
fig.colorbar(im, ax=ax)`,
 traps:["`imshow` puts row 0 at the top; use `origin='lower'` for math-style grids.","Rainbow colormaps like jet distort how values are perceived."],
 cards:[["Show a 2D array as an image?","ax.imshow(arr) with a colorbar."],["How do you plot a decision boundary?","Predict on a meshgrid and draw it with contourf."],["Why viridis over jet?","It’s perceptually uniform and colorblind-friendly."]],
 quiz:[["Add a color scale to imshow:",["ax.legend()","fig.colorbar(im)","ax.scale()","plt.cmap()"],1,"colorbar."],["The diagonal of a confusion matrix shows…",["errors","correct predictions","probabilities","features"],1,"Correct predictions."]],
 vis:{type:"grid", rows:2, cols:2, labels:["TN 50","FP 3","FN 7","TP 40"]},
 prac:[{type:"blank", code:"im = ax.imshow(cm, cmap=\"Blues\")\nfig.____(im, ax=ax)", answer:["colorbar"], explain:"`fig.colorbar` adds the color scale."}]}
];

export const C_SNS = [
{id:"sns-basics", t:"Seaborn basics & distributions", lvl:"B",
 hook:"Hand it a DataFrame and column names; it does the rest.",
 sum:"Seaborn is a statistical plotting library built on Matplotlib that works directly with DataFrames.",
 pts:[
  "Pattern: `sns.plotname(data=df, x='col', y='col', hue='col')`.",
  "Distributions: `histplot` (with `kde=True`), `kdeplot`, `boxplot`, `violinplot`.",
  "`hue` splits by a category with automatic colors and a legend.",
  "Themes: `sns.set_theme(style='whitegrid')`.",
  "Axes-level functions return Matplotlib axes, so `ax.set_title` still works.",
  "Practice datasets: `sns.load_dataset('tips')`."
 ],
 code:`import seaborn as sns
import matplotlib.pyplot as plt
sns.set_theme(style="whitegrid")
tips = sns.load_dataset("tips")

ax = sns.histplot(data=tips, x="total_bill", hue="time", kde=True)
ax.set_title("Bill distribution by time")
plt.show()

sns.boxplot(data=tips, x="day", y="tip")`,
 traps:["Passing raw lists instead of column names loses automatic labels.","KDE curves can show impossible values, like negative prices."],
 cards:[["What does hue do?","Colors and splits the plot by a categorical column."],["Box plot vs violin plot?","A violin adds the full distribution shape to the box plot summary."],["Is Seaborn separate from Matplotlib?","No, it’s built on Matplotlib and returns Matplotlib axes."]],
 quiz:[["Histogram with a smooth curve:",["sns.histplot(..., kde=True)","sns.lineplot","sns.barplot","sns.curve"],0,"kde=True."],["Split colors by a category column:",["style=","hue=","color=","group="],1,"hue."]],
 vis:{type:"flow", steps:["DataFrame","sns.plot(data=df, x, y, hue)","Seaborn computes statistics","Matplotlib draws it"]},
 prac:[{type:"blank", code:"sns.histplot(data=tips, x=\"total_bill\", ____=\"sex\")", answer:["hue"], explain:"`hue` splits by category."}]},
{id:"sns-rel", t:"Relationships & categories", lvl:"I",
 hook:"scatterplot to relate, barplot to compare means, countplot to count.",
 sum:"Plot relationships between variables and statistics across categories.",
 pts:[
  "`scatterplot` and `lineplot` for numeric relationships; `regplot`/`lmplot` add a regression line.",
  "`barplot` shows the **mean** per category with a confidence interval, not counts.",
  "`countplot` counts rows per category.",
  "`pointplot` compares means across groups.",
  "`style=` and `size=` add more dimensions to scatter plots."
 ],
 code:`sns.scatterplot(data=tips, x="total_bill", y="tip", hue="smoker", size="size")
sns.regplot(data=tips, x="total_bill", y="tip", scatter_kws={"alpha": 0.4})
sns.barplot(data=tips, x="day", y="total_bill")     # mean per day
sns.countplot(data=tips, x="day")                   # rows per day`,
 traps:["barplot shows averages; use countplot for frequencies.","Overplotting a large scatter hides density; use alpha or a hexbin."],
 cards:[["barplot vs countplot?","barplot: mean of y per category with a CI. countplot: number of rows per category."],["Add a regression line to a scatter?","sns.regplot or sns.lmplot."],["Show a third and fourth variable in a scatter?","hue, size and style."]],
 quiz:[["Number of orders per day:",["barplot","countplot","lineplot","heatmap"],1,"It counts rows."],["The error bars in barplot represent…",["min and max","a confidence interval","nothing","the median"],1,"A confidence interval by default."]],
 vis:{type:"compare", cols:[{h:"scatterplot", items:["x vs y","relationship"]},{h:"barplot", items:["mean of y","per category"]},{h:"countplot", items:["row count","per category"]}]},
 prac:[{type:"blank", code:"sns.____(data=tips, x=\"day\")   # how many rows per day", answer:["countplot"], explain:"`countplot` counts rows per category."}]},
{id:"sns-matrix", t:"Heatmaps & correlation", lvl:"I",
 hook:"corr() makes the matrix; heatmap makes it readable.",
 sum:"Visualize correlations and pivot tables as color-coded grids.",
 pts:[
  "`df.corr(numeric_only=True)` computes Pearson correlations from -1 to 1.",
  "`sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1)`.",
  "Use a diverging colormap centered at 0 for correlations.",
  "Pivot first, then plot: `df.pivot_table(index=, columns=, values=)`.",
  "`clustermap` groups similar rows and columns together.",
  "Correlation isn’t causation, and it only captures linear relationships."
 ],
 code:`corr = tips.corr(numeric_only=True)
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, square=True)

flights = sns.load_dataset("flights")
table = flights.pivot_table(index="month", columns="year", values="passengers")
sns.heatmap(table, cmap="viridis")`,
 traps:["Without vmin and vmax, the color scale may not center at 0.","Highly correlated features (multicollinearity) can hurt linear models."],
 cards:[["Range of Pearson correlation?","-1 (perfect negative) to 1 (perfect positive); 0 means no linear relationship."],["Colormap for correlations?","A diverging one such as coolwarm, centered at 0."],["Write numbers inside heatmap cells?","annot=True."]],
 quiz:[["A correlation of 0 means…",["no relationship at all","no linear relationship","a perfect relationship","an error"],1,"Only linear relationships are measured."],["Show values in each cell:",["annot=True","labels=True","text=True","fmt=True"],0,"annot."]],
 vis:{type:"grid", rows:3, cols:3, labels:["1.00","0.68","0.49","0.68","1.00","0.60","0.49","0.60","1.00"]},
 prac:[{type:"blank", code:"corr = df.corr(numeric_only=True)\nsns.heatmap(corr, ____=True, fmt=\".2f\")", answer:["annot"], explain:"`annot=True` writes the values in the cells."}]},
{id:"sns-adv", t:"Multi-plot grids & EDA", lvl:"A",
 hook:"pairplot for a first look, facets for one plot per group.",
 sum:"Explore whole datasets quickly with figure-level functions.",
 pts:[
  "Figure-level functions (`relplot`, `displot`, `catplot`) create their own figure and support `col=` and `row=` facets.",
  "Axes-level functions (`scatterplot`, `histplot`) draw on an existing `ax`.",
  "`pairplot(df, hue=...)` plots every pair of numeric columns.",
  "`FacetGrid` maps any plot over subsets of the data.",
  "`jointplot` shows a scatter with distributions on the margins.",
  "EDA routine: shape and types → missing values → distributions → relationships → outliers."
 ],
 code:`iris = sns.load_dataset("iris")
sns.pairplot(iris, hue="species", corner=True)

sns.relplot(data=tips, x="total_bill", y="tip", col="time", row="smoker", hue="sex")
sns.catplot(data=tips, x="day", y="tip", kind="box", col="sex")
sns.jointplot(data=tips, x="total_bill", y="tip", kind="hex")`,
 traps:["Passing `ax=` to a figure-level function doesn’t work.","pairplot on many columns is slow and unreadable; pick columns first."],
 cards:[["Figure-level vs axes-level functions?","Figure-level make their own figure with facets (relplot); axes-level draw on one ax (scatterplot)."],["Quick look at every pairwise relationship?","sns.pairplot(df, hue=...)."],["Steps of EDA?","Types and shape, missing values, distributions, relationships, outliers."]],
 quiz:[["One subplot per category:",["hue=","col=","size=","ax="],1,"col= creates facets."],["Scatter with histograms on the margins:",["jointplot","pairplot","heatmap","lineplot"],0,"jointplot."]],
 vis:{type:"flow", steps:["df.info(), describe()","Missing values","Distributions (histplot)","Relationships (pairplot, heatmap)","Outliers (boxplot)"]},
 prac:[{type:"order", lines:["df.info()","df.isnull().sum()","sns.histplot(data=df, x='age')","sns.pairplot(df, hue='target')"], explain:"Check the structure, then missing data, then distributions, then relationships."}]}
];
