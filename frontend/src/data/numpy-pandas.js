export const NP = [
{id:"np-arrays", t:"Arrays & dtypes",
 hook:"One type, one block of memory: that’s why NumPy is fast.",
 sum:"The `ndarray` is a fixed-type, contiguous array whose operations run as vectorized C loops.",
 pts:[
  "Create: `np.array`, `np.zeros`, `np.ones`, `np.arange`, `np.linspace(0, 1, 5)`, `np.eye`, `np.full`.",
  "Random: `rng = np.random.default_rng(42)`, then `rng.random`, `rng.normal`, `rng.integers`.",
  "Attributes: `.shape`, `.ndim`, `.dtype`, `.size`, `.itemsize`.",
  "NumPy’s default float is `float64`; PyTorch models use `float32`.",
  "Convert with `a.astype(np.float32)`; float to int truncates.",
  "Mixed inputs upcast: `np.array([1, 2.5])` is `float64`; add a string and everything becomes a string."
 ],
 code:`import numpy as np
a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape, a.ndim, a.dtype)    # (2, 3) 2 int64
b = np.linspace(0, 1, 5)           # [0. 0.25 0.5 0.75 1.]
rng = np.random.default_rng(42)
x = rng.normal(size=(2, 2))
print(a.astype(np.float32).dtype)  # float32`,
 traps:["`np.arange(0, 1, 0.1)` can surprise you with float rounding; prefer `linspace` for floats.","`np.empty` contains garbage values, not zeros."],
 cards:[
  ["Why is NumPy faster than Python lists?","Fixed dtype, contiguous memory and vectorized C loops, with no per-item Python overhead."],
  ["NumPy’s default float dtype?","`float64`."],
  ["`arange` vs `linspace`?","`arange(start, stop, step)` uses a step and excludes stop; `linspace(start, stop, num)` gives num points including stop."]
 ],
 quiz:[
  ["`np.array([1, 2.5]).dtype`",["int64","float64","object","float32"],1,"Upcast to float."],
  ["`np.zeros((2, 3)).shape`",["(3, 2)","(2, 3)","6","(2,)"],1,"Rows first, then columns."]
 ]},
{id:"np-index", t:"Indexing, views & copies",
 hook:"Slices are windows (views). Masks are photocopies.",
 sum:"Slicing returns views that share memory; boolean and fancy indexing return independent copies.",
 pts:[
  "2D indexing: `a[row, col]`, `a[1, :]` for a row, `a[:, 0]` for a column.",
  "Boolean masks: `a[a > 0]`; combine with `&`, `|`, `~` and parentheses.",
  "Fancy indexing: `a[[0, 2]]` picks rows 0 and 2.",
  "A slice is a **view** (shares memory). Masks and fancy indexing make a **copy**.",
  "`np.shares_memory(a, b)` checks; `.copy()` forces independence.",
  "`np.where(cond, x, y)` chooses element-wise; `np.where(cond)` returns the matching indices."
 ],
 code:`a = np.arange(10)
v = a[2:5]          # view
v[0] = 100
print(a[2])         # 100: the original changed
m = a[a > 5]        # copy
m[0] = -1           # a is unchanged
print(np.where(a % 2 == 0, "even", "odd")[:3])`,
 traps:["`a[a > 2 and a < 5]` raises an error; write `a[(a > 2) & (a < 5)]`.","Editing a slice silently edits the original array."],
 cards:[
  ["View or copy: slice, boolean mask, fancy index?","Slice: view. Boolean mask: copy. Fancy index: copy."],
  ["How do you combine conditions in a mask?","`(a > 2) & (a < 5)`: use `&`, `|`, `~` with parentheses, not `and`/`or`."],
  ["How do you get column 0 of a 2D array?","`a[:, 0]`"]
 ],
 quiz:[
  ["`a = np.arange(5); b = a[1:3]; b[:] = 0; print(a)`",["[0 1 2 3 4]","[0 0 0 3 4]","[0 1 0 3 4]","error"],1,"The slice is a view."],
  ["`a[[0, 0, 1]]` returns…",["a view","a copy","an error","a scalar"],1,"Fancy indexing copies."]
 ]},
{id:"np-shape", t:"Reshape, stack & axes",
 hook:"`-1` means ‘you figure it out’. `axis=0` walks down the rows.",
 sum:"Change shapes without changing the data, and combine arrays along axes.",
 pts:[
  "`reshape(2, -1)`: `-1` infers that size; the total number of elements must match.",
  "`ravel()` returns a view when possible; `flatten()` always copies.",
  "`a.T` or `transpose(axes)` reorders axes; `a[None, :]` or `np.expand_dims` adds one; `squeeze()` removes size-1 axes.",
  "`np.concatenate([a, b], axis=0)` joins along an existing axis; `np.stack` creates a new axis.",
  "`vstack` puts arrays on top of each other; `hstack` puts them side by side.",
  "`axis=0` reduces down the rows (one result per column); `axis=1` across columns (one per row)."
 ],
 code:`a = np.arange(6)
m = a.reshape(2, -1)               # (2, 3)
print(m.T.shape)                   # (3, 2)
x = np.array([1, 2]); y = np.array([3, 4])
print(np.concatenate([x, y]))      # [1 2 3 4]
print(np.stack([x, y]).shape)      # (2, 2)
print(m.sum(axis=0))               # [3 5 7]`,
 traps:["`reshape(4, 2)` on 6 elements raises `ValueError`.","`concatenate` needs matching sizes on every other axis."],
 cards:[
  ["`concatenate` vs `stack`?","`concatenate` joins along an existing axis; `stack` adds a new axis."],
  ["`ravel` vs `flatten`?","`ravel` gives a view when possible; `flatten` always copies."],
  ["What does `axis=0` mean in `sum`?","Collapse the rows: one result per column."]
 ],
 quiz:[
  ["`np.arange(12).reshape(3, -1).shape`",["(3, 4)","(4, 3)","(3, 3)","error"],0,"12 / 3 = 4."],
  ["`np.stack([a, b])` for two arrays of shape (3,)",["(6,)","(2, 3)","(3, 2)","(3,)"],1,"A new leading axis."]
 ]},
{id:"np-broadcast", t:"Broadcasting & vectorization",
 hook:"Line the shapes up from the right: equal or 1, and it stretches.",
 sum:"Arrays of different shapes combine without loops or copies, as long as their shapes are compatible.",
 pts:[
  "**Rule:** compare shapes from the right; each pair of dims must be equal or include a 1 (missing dims count as 1).",
  "`(100, 3) - (3,)` works: subtract the mean of each column.",
  "`(100, 3) + (100,)` fails; reshape the second to `(100, 1)`.",
  "`a[:, None] - b[None, :]` builds an all-pairs difference matrix.",
  "**Vectorization** replaces Python loops with array operations, often 10–100x faster.",
  "PyTorch follows exactly the same broadcasting rules."
 ],
 code:`X = np.random.rand(100, 3)
X_std = (X - X.mean(axis=0)) / X.std(axis=0)   # standardize columns
row_mean = X.mean(axis=1, keepdims=True)       # (100, 1)
X_rc = X - row_mean                            # works
a = np.array([1, 2, 3])
diff = a[:, None] - a[None, :]                 # (3, 3)`,
 traps:["Without `keepdims=True` a row mean has shape `(100,)`, which won’t broadcast against `(100, 3)`.","Broadcasting can silently build huge arrays, e.g. `(10000, 1) * (1, 10000)`."],
 cards:[
  ["State the broadcasting rule.","Compare shapes from the right; dims are compatible if they’re equal or one of them is 1."],
  ["Will `(4, 3) + (4,)` broadcast?","No: the trailing dims 3 and 4 differ. Use shape `(4, 1)`."],
  ["Why vectorize?","The work runs in optimized C instead of slow Python loops."]
 ],
 quiz:[
  ["Result shape of `(5, 1) + (1, 4)`",["(5, 4)","(5, 1)","error","(1, 4)"],0,"Both arrays stretch."],
  ["Result shape of `(2, 3) * (3,)`",["error","(2, 3)","(3, 3)","(2,)"],1,"The trailing dims match."]
 ]},
{id:"np-math", t:"Math, reductions & linear algebra",
 hook:"`*` multiplies matching elements. `@` does matrix multiplication.",
 sum:"Element-wise math, aggregations along an axis, and the linear algebra used inside every model.",
 pts:[
  "Ufuncs: `np.sqrt`, `np.exp`, `np.log`, `np.abs`, `np.round`, `np.clip(a, 0, 1)`.",
  "Reductions: `sum`, `mean`, `std`, `min`, `max`, `argmax`, `cumsum`, each with `axis`.",
  "`a @ b` (or `np.matmul`) for matrices; `np.dot` for vectors; `*` is element-wise.",
  "`np.linalg`: `inv`, `det`, `eig`, `norm`, `solve` (prefer `solve` over `inv` for Ax = b).",
  "`np.unique(a, return_counts=True)` counts values; `np.argsort` returns sorting indices.",
  "NaN-safe versions: `np.nanmean`, `np.nansum`."
 ],
 code:`A = np.array([[1., 2.], [3., 4.]])
b = np.array([5., 6.])
print(A @ A)                    # matrix product
print(A * A)                    # element-wise
x = np.linalg.solve(A, b)       # solves A x = b
print(np.argmax([3, 9, 2]))     # 1
vals, counts = np.unique([1, 1, 2], return_counts=True)`,
 traps:["`np.mean` of an array containing `NaN` is `NaN`; use `np.nanmean`.","`np.dot` on 2D arrays is matrix multiplication; prefer `@` for clarity."],
 cards:[
  ["`*` vs `@`?","`*` multiplies element-wise; `@` is matrix multiplication."],
  ["What does `argmax` return?","The index of the maximum value."],
  ["Why `np.linalg.solve` instead of `inv(A) @ b`?","It’s faster and numerically more stable."]
 ],
 quiz:[
  ["`np.argsort([30, 10, 20])`",["[1 2 0]","[0 1 2]","[10 20 30]","[2 0 1]"],0,"The indices that would sort the array."],
  ["`np.clip([-1, 5, 20], 0, 10)`",["[0 5 10]","[-1 5 20]","[0 5 20]","[1 5 10]"],0,"Values are limited to the range."]
 ]}
];

export const PD = [
{id:"pd-basics", t:"Series, DataFrames & I/O",
 hook:"A DataFrame is a dict of Series sharing one index.",
 sum:"Labeled 1D and 2D data with fast file I/O and quick ways to inspect it.",
 pts:[
  "`Series` is a 1D labeled array; a `DataFrame` is a 2D table whose columns are Series.",
  "Load with `pd.read_csv`, `read_excel`, `read_json`, `read_parquet`; save with `to_csv(index=False)`.",
  "Inspect: `head()`, `tail()`, `info()`, `describe()`, `shape`, `dtypes`, `columns`.",
  "`df['col'].value_counts()` and `nunique()` summarize categorical columns.",
  "Large files: `read_csv(..., usecols=[...], dtype=..., chunksize=100_000)`.",
  "To model input: `df.to_numpy()`, then `torch.tensor(..., dtype=torch.float32)`."
 ],
 code:`import pandas as pd
df = pd.DataFrame({
    "name": ["Ann", "Bob", "Cy"],
    "age": [23, 31, 27],
    "city": ["Pune", "Goa", "Pune"],
})
print(df.shape)                    # (3, 3)
print(df["city"].value_counts())   # Pune 2, Goa 1
df.info()`,
 traps:["`to_csv` writes the index as an extra column unless you pass `index=False`.","`df.shape` is an attribute, not a method."],
 cards:[
  ["Series vs DataFrame?","Series: a 1D labeled array. DataFrame: a 2D table whose columns are Series sharing an index."],
  ["How do you read a huge CSV?","Use `chunksize`, `usecols` and smaller `dtype`s (or Polars / Dask)."],
  ["Which call shows column types and null counts?","`df.info()`"]
 ],
 quiz:[
  ["`df['age']` returns a…",["DataFrame","Series","list","ndarray"],1,"Single brackets give a Series."],
  ["`df[['age']]` returns a…",["DataFrame","Series","list","dict"],0,"Double brackets give a DataFrame."]
 ]},
{id:"pd-select", t:"Selection: loc, iloc & filtering",
 hook:"`loc` uses labels (end included). `iloc` uses positions (end excluded).",
 sum:"Select rows and columns by label, by position or by condition, and assign without warnings.",
 pts:[
  "`df.loc[rows, cols]` is label-based, and its slice end is inclusive.",
  "`df.iloc[0:5, 1:3]` is position-based, and its slice end is exclusive.",
  "Filter: `df[df['age'] > 25]`; combine conditions with `&`, `|`, `~` and parentheses.",
  "`df.query('age > 25')` reads cleanly; `isin([...])` checks membership.",
  "`df.at[i, 'col']` and `df.iat[i, j]` get single values fast.",
  "Assign with `df.loc[mask, 'col'] = value` to avoid `SettingWithCopyWarning`."
 ],
 code:`adults = df[(df["age"] > 25) & (df["city"] == "Pune")]
print(df.loc[0:1, ["name", "age"]])   # rows 0 AND 1
print(df.iloc[0:1, 0:2])              # row 0 only
df.loc[df["age"] > 30, "senior"] = True
print(df[df["city"].isin(["Goa", "Delhi"])])`,
 traps:["`df[df.age > 25 and df.city == 'Pune']` fails; use `&` with parentheses.","Chained assignment like `df[mask]['col'] = x` may not change `df` at all."],
 cards:[
  ["`loc` vs `iloc`?","`loc`: labels, end inclusive. `iloc`: integer positions, end exclusive."],
  ["How do you avoid `SettingWithCopyWarning`?","Assign with `df.loc[mask, 'col'] = value`, or take `.copy()` of the subset first."],
  ["Filter rows where city is Pune or Goa?","`df[df['city'].isin(['Pune', 'Goa'])]`"]
 ],
 quiz:[
  ["With a default index, how many rows does `df.loc[0:2]` return?",["2","3","1","error"],1,"`loc` slices include the end."],
  ["How many rows does `df.iloc[0:2]` return?",["2","3","1","0"],0,"`iloc` slices exclude the end."]
 ]},
{id:"pd-clean", t:"Missing data & cleaning",
 hook:"Find it (`isnull`), then drop it or fill it. Never ignore it.",
 sum:"Detect, drop or impute missing values, then fix types, duplicates and messy text.",
 pts:[
  "Count missing values with `df.isnull().sum()`; the share with `df.isnull().mean()`.",
  "Drop: `dropna()` for rows, `dropna(axis=1)` for columns, `dropna(subset=['col'])`, `thresh=`.",
  "Fill: `fillna(value)`, `fillna(df['col'].median())`, `ffill()`, `bfill()`, `interpolate()`.",
  "Types: `astype('int64')`, `pd.to_numeric(errors='coerce')`, `pd.to_datetime`, `astype('category')`.",
  "Duplicates: `duplicated()` and `drop_duplicates(subset=[...])`.",
  "Text: `df['col'].str.strip().str.lower()`, `.str.contains(...)`, `.str.replace(...)`.",
  "Compute fill values on the training split only, to avoid data leakage."
 ],
 code:`df = pd.DataFrame({"age": [25, None, 40], "salary": ["50k", "60k", None]})
print(df.isnull().sum())
df["age"] = df["age"].fillna(df["age"].median())
df["salary"] = pd.to_numeric(df["salary"].str.replace("k", ""), errors="coerce") * 1000
df = df.drop_duplicates()`,
 traps:["`fillna` returns a new object; assign it back.","An integer column with a NaN becomes `float64`; use the nullable `'Int64'` type if needed."],
 cards:[
  ["How do you count missing values per column?","`df.isnull().sum()`"],
  ["Mean vs median imputation?","The median is robust to outliers; the mean is pulled by them."],
  ["What does `errors='coerce'` do?","Turns values that can’t be parsed into NaN instead of raising an error."]
 ],
 quiz:[
  ["An integer column with one NaN gets dtype…",["int64","float64","object","bool"],1,"NaN is a float."],
  ["`df.dropna(axis=1)` drops…",["rows with NaN","columns with NaN","only NaN cells","nothing"],1,"`axis=1` means columns."]
 ]},
{id:"pd-group", t:"GroupBy, merge & reshape",
 hook:"GroupBy = split, apply, combine.",
 sum:"Aggregate by groups, join tables, and reshape between long and wide formats.",
 pts:[
  "`df.groupby('city')['salary'].mean()`; several stats with `.agg(['mean', 'max'])` or named `.agg(avg=('salary', 'mean'))`.",
  "`transform` returns a value for every original row, e.g. a share of the group total.",
  "Join: `df.merge(other, on='id', how='left')`, where `how` is inner, left, right or outer.",
  "`pd.concat([a, b])` stacks rows; `axis=1` puts them side by side.",
  "`pivot_table(index=, columns=, values=, aggfunc=)` goes long to wide; `melt` goes wide to long.",
  "`sort_values('col', ascending=False)` and `nlargest(5, 'col')`."
 ],
 code:`sales = pd.DataFrame({"city": ["Pune", "Goa", "Pune"], "amt": [100, 50, 300]})
print(sales.groupby("city")["amt"].agg(["sum", "mean"]))
sales["share"] = sales["amt"] / sales.groupby("city")["amt"].transform("sum")
cities = pd.DataFrame({"city": ["Pune", "Goa"], "state": ["MH", "GA"]})
full = sales.merge(cities, on="city", how="left")`,
 traps:["Merging on keys that have duplicates multiplies the rows.","`groupby` drops NaN keys by default; pass `dropna=False` to keep them."],
 cards:[
  ["`agg` vs `transform`?","`agg` returns one row per group; `transform` returns a value for every original row."],
  ["Inner vs left join?","Inner keeps only matching keys; left keeps every row of the left table."],
  ["`pivot_table` vs `melt`?","`pivot_table` reshapes long to wide; `melt` reshapes wide to long."]
 ],
 quiz:[
  ["Keep all rows of the left table:",["how='inner'","how='left'","how='outer'","how='cross'"],1,"A left join."],
  ["Length of `groupby(...).transform('sum')` output equals…",["the number of groups","the number of rows","1","the number of columns"],1,"It’s aligned to the original rows."]
 ]},
{id:"pd-perf", t:"Apply, vectorization & speed",
 hook:"Vectorize first, `apply` last, loops never.",
 sum:"Fast pandas code avoids row-by-row Python and uses the right dtypes.",
 pts:[
  "Vectorized column math like `df['a'] * df['b']` runs in C and is the fastest option.",
  "Use `np.where` or `np.select` for conditional columns instead of `apply`.",
  "`Series.map(dict)` for lookups; `.apply(func)` runs Python for every element (slow).",
  "`iterrows()` is the slowest choice; avoid it on large data.",
  "Save memory with `astype('category')` for repeated strings and smaller numeric dtypes.",
  "Use the `.str` and `.dt` accessors for vectorized text and date work."
 ],
 code:`import numpy as np
df["total"] = df["price"] * df["qty"]                    # vectorized
df["band"] = np.where(df["total"] > 1000, "high", "low")
df["state"] = df["city"].map({"Pune": "MH", "Goa": "GA"})
df["month"] = pd.to_datetime(df["date"]).dt.month
df["city"] = df["city"].astype("category")`,
 traps:["`map(dict)` gives NaN for any value missing from the dict.","`apply(axis=1)` over millions of rows can take minutes."],
 cards:[
  ["Rank by speed: apply, iterrows, vectorized.","Vectorized (fastest), then apply, then iterrows (slowest)."],
  ["How do you add a conditional column quickly?","`np.where(cond, a, b)`, or `np.select` for several conditions."],
  ["Why use `astype('category')`?","Repeated strings are stored as integer codes: less memory and faster groupby."]
 ],
 quiz:[
  ["Fastest way to add two columns:",["iterrows","apply(axis=1)","df['a'] + df['b']","a for loop"],2,"Vectorized."],
  ["`s.map({'a': 1})` on the value `'b'` gives…",["'b'","1","NaN","an error"],2,"Missing keys become NaN."]
 ]}
];
