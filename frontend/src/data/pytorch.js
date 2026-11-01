export const PT = [
{id:"pt-tensors", t:"Tensors & dimensions",
 hook:"PyTorch images are channels-first: (N, C, H, W).",
 sum:"Tensors are n-dimensional arrays that run on GPUs and support automatic differentiation.",
 pts:[
  "0D scalar (a loss), 1D vector (one embedding), 2D matrix (grayscale image), 3D `(C, H, W)` RGB image, 4D `(N, C, H, W)` batch, 5D `(N, T, C, H, W)` video batch.",
  "Dimension (rank) is the number of axes: `x.ndim`; sizes come from `x.shape`.",
  "Create: `torch.tensor`, `zeros`, `ones`, `empty` (garbage values), `rand` in [0, 1), `randn`, `randint(low, high, size)`, `eye`, `full((2, 3), 5)`, `arange`.",
  "`torch.manual_seed(42)` takes one integer and makes random numbers reproducible.",
  "Tensors beat NumPy arrays for deep learning because of **GPU support** and **autograd**.",
  "PyTorch builds a **dynamic computational graph**: a fresh one on every forward pass."
 ],
 code:`import torch
torch.manual_seed(42)
img = torch.rand(3, 224, 224)          # (C, H, W)
batch = torch.rand(32, 3, 224, 224)    # (N, C, H, W)
print(batch.ndim, batch.shape[0])      # 4 32
print(torch.arange(0, 10, 3))          # tensor([0, 3, 6, 9])
print(torch.full((2, 3), 5))`,
 traps:["`(H, W, C)` is the NumPy/PIL order, not PyTorch’s.","`torch.full(2, 3, 5)` is an error; the size must be a tuple."],
 cards:[
  ["Shape of a batch of 16 RGB images, 64×64?","`(16, 3, 64, 64)`"],
  ["Two reasons tensors beat NumPy arrays for deep learning?","GPU acceleration and automatic differentiation (autograd)."],
  ["What does `torch.empty` contain?","Uninitialized memory: garbage values."]
 ],
 quiz:[
  ["A loss value is a tensor of dimension…",["0D","1D","2D","4D"],0,"A scalar."],
  ["Can `torch.randint(0, 10, (3,))` return 10?",["Yes","No"],1,"`high` is exclusive."]
 ]},
{id:"pt-ops", t:"dtype, device & operations",
 hook:"`*` is element-wise, `@` is matmul, and dtypes must match.",
 sum:"Data types, moving tensors to the GPU, element-wise and matrix operations, and reductions.",
 pts:[
  "Defaults: `torch.tensor([1, 2])` is `int64`; `torch.tensor([1.0])`, `rand` and `zeros` are `float32`.",
  "Convert with `x.to(torch.float32)`, `x.float()`, `x.long()`; float to int truncates toward zero.",
  "Device: `device = 'cuda' if torch.cuda.is_available() else 'cpu'`, then `x.to(device)`.",
  "`A @ B` is matmul (inner dims must match); `A * B` is element-wise; `A.T` or `torch.transpose(A, 0, 1)`.",
  "`det`, `inverse`, `mean` and `std` need float tensors.",
  "Reductions: `dim=0` gives one result per column, `dim=1` per row; `max(dim=...)` returns values and indices.",
  "In-place operations end in `_`: `x.add_(1)`, `x.relu_()`."
 ],
 code:`x = torch.tensor([[1, 2], [3, 4]])
print(x.dtype)                     # torch.int64
print(x.sum(dim=0))                # tensor([4, 6])
xf = x.float()
print(xf.mean(), xf @ xf)
vals, idx = xf.max(dim=1)          # per-row max and its index
device = "cuda" if torch.cuda.is_available() else "cpu"
xf = xf.to(device)`,
 traps:["`torch.tensor([1, 2, 3]).mean()` raises an error because the dtype is int.","Model and data on different devices cause a `RuntimeError`."],
 cards:[
  ["`torch.tensor([2.9, -2.9]).int()`?","`tensor([2, -2])`: truncation toward zero."],
  ["What does `sum(dim=0)` give for a 2D tensor?","One value per column."],
  ["What does a trailing `_` in a method name mean?","In-place: it modifies the tensor itself."]
 ],
 quiz:[
  ["Result shape of `(2, 3) @ (3, 4)`",["(2, 4)","(3, 3)","(2, 3)","error"],0,"The inner dims cancel."],
  ["`torch.det(torch.randint(0, 9, (3, 3)))`",["works","error: needs a float tensor","error: not square","returns an int"],1,"Convert with `.float()` first."]
 ]},
{id:"pt-shape", t:"Reshaping, joining & copies",
 hook:"`unsqueeze` adds a 1, `squeeze` removes 1s, `permute` reorders.",
 sum:"Change shapes, join tensors, and know which operations share memory.",
 pts:[
  "`view` needs contiguous memory; `reshape` always works (copying if needed).",
  "`unsqueeze(0)` adds a batch dim; `squeeze()` removes size-1 dims; `flatten(1)` keeps the batch dim.",
  "`permute(2, 0, 1)` turns `(H, W, C)` into `(C, H, W)`.",
  "`torch.cat` joins along an existing dim; `torch.stack` adds a new dim.",
  "`b = a` is the same tensor; slices and `view` share memory; `clone()` copies; `detach().clone()` also leaves the graph.",
  "`torch.from_numpy` and `.numpy()` share memory on the CPU; `torch.tensor(arr)` copies."
 ],
 code:`img = torch.rand(224, 224, 3)          # from PIL/NumPy: (H, W, C)
img = img.permute(2, 0, 1)             # (C, H, W)
batch = img.unsqueeze(0)               # (1, C, H, W)
flat = batch.flatten(1)                # (1, 150528)
a = torch.zeros(3)
b = a.clone()
b[0] = 1                               # a is unchanged`,
 traps:["`view` right after `permute` fails (non-contiguous); use `reshape` or `.contiguous()` first.","`torch.from_numpy` keeps NumPy’s `float64`; add `.float()`."],
 cards:[
  ["`cat` vs `stack`?","`cat` joins along an existing dim; `stack` creates a new dim."],
  ["`view` vs `reshape`?","`view` needs contiguous memory and always shares it; `reshape` copies when it has to."],
  ["How do you add a batch dimension to a (C, H, W) image?","`img.unsqueeze(0)` gives `(1, C, H, W)`."]
 ],
 quiz:[
  ["`torch.stack([a, b])` for two tensors of shape (3,)",["(6,)","(2, 3)","(3, 2)","error"],1,"A new dim is added."],
  ["Shape of `torch.rand(1, 3, 1).squeeze()`",["(3,)","(1, 3)","(3, 1)","(1, 3, 1)"],0,"All size-1 dims are removed."]
 ]},
{id:"pt-autograd", t:"Autograd",
 hook:"Forward builds the graph, `backward()` walks it, `.grad` keeps the answer.",
 sum:"Automatic differentiation applies the chain rule over a graph recorded during the forward pass.",
 pts:[
  "`requires_grad=True` tells PyTorch to track operations on a tensor (your weights).",
  "`grad_fn` is the function that created a tensor; tensors you create yourself (leaf tensors) have `grad_fn = None`.",
  "`loss.backward()` computes the gradients, usually from a scalar loss.",
  "`.grad` stores gradients on leaf tensors, and they **accumulate**, so zero them every step.",
  "`detach()` cuts one tensor out of the graph; `torch.no_grad()` turns tracking off for a whole block.",
  "The chain rule is used for every multi-step computation, which means every neural network."
 ],
 code:`w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
y = w * x + 1          # y.grad_fn → <AddBackward0>
y.backward()
print(w.grad)          # tensor(3.)  because dy/dw = x
with torch.no_grad():
    w -= 0.1 * w.grad  # manual update, not tracked
w.grad.zero_()`,
 traps:["Calling `backward()` twice without zeroing doubles the gradient.","In-place changes to tensors that backward still needs raise an error."],
 cards:[
  ["What does `grad_fn` store?","The function that created the tensor (its node in the backward graph)."],
  ["`detach()` vs `torch.no_grad()`?","`detach` affects one tensor; `no_grad` turns tracking off for a whole block of code."],
  ["Why zero the gradients every iteration?","`.grad` accumulates across `backward()` calls."]
 ],
 quiz:[
  ["`x = torch.tensor(3., requires_grad=True); (x ** 2).backward(); x.grad`",["3","6","9","None"],1,"d(x²)/dx = 2x = 6."],
  ["Does `model.eval()` turn off gradient tracking?",["Yes","No"],1,"It only switches dropout and batch norm; use `torch.no_grad()`."]
 ]},
{id:"pt-train", t:"nn.Module & the training loop",
 hook:"zero_grad, forward, loss, backward, step. Repeat.",
 sum:"Define models by subclassing `nn.Module`, then train them with a loss function and an optimizer.",
 pts:[
  "Subclass `nn.Module`, call `super().__init__()`, create layers in `__init__`, write the computation in `forward`.",
  "Call `model(x)`, not `model.forward(x)`: `__call__` runs hooks and then `forward`.",
  "Losses: `MSELoss` for regression, `BCEWithLogitsLoss` for binary, `CrossEntropyLoss` for multi-class (raw logits in).",
  "Optimizers: `SGD`, `Adam`, `AdamW`; the learning rate sets the step size.",
  "`model.train()` and `model.eval()` switch the behaviour of dropout and batch norm.",
  "Inference: `model.eval()` together with `torch.no_grad()`."
 ],
 code:`import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 3))
    def forward(self, x):
        return self.net(x)

model = MLP()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()
for xb, yb in loader:
    opt.zero_grad()
    loss = loss_fn(model(xb), yb)
    loss.backward()
    opt.step()`,
 traps:["Applying softmax before `CrossEntropyLoss` is wrong; it expects raw logits.","Forgetting `model.eval()` leaves dropout switched on at test time."],
 cards:[
  ["The five steps of one training iteration?","`zero_grad`, forward pass, loss, `backward`, `step`."],
  ["Which loss for 10-class classification?","`nn.CrossEntropyLoss`, with raw logits and integer class labels."],
  ["What do `train()` and `eval()` change?","The behaviour of dropout and batch norm."]
 ],
 quiz:[
  ["Leaving out `super().__init__()` in a Module causes…",["nothing","an error when assigning layers","slower training","a NaN loss"],1,"The Module’s internals were never set up."],
  ["`CrossEntropyLoss` expects its input as…",["probabilities","logits","one-hot vectors","percentages"],1,"It applies log-softmax internally."]
 ]},
{id:"pt-data", t:"Datasets, saving & GPU",
 hook:"Dataset answers ‘how many?’ and ‘give me item i’. DataLoader batches it.",
 sum:"Feed data efficiently, keep model and data on the same device, and save models the right way.",
 pts:[
  "A custom `Dataset` implements `__len__` and `__getitem__`.",
  "`DataLoader(ds, batch_size=32, shuffle=True, num_workers=4)` batches, shuffles and loads in parallel.",
  "Shuffle the training data, not the validation or test data.",
  "Move the model and every batch to the same device.",
  "Save with `torch.save(model.state_dict(), 'model.pt')`; restore into a new model with `load_state_dict`, then call `eval()`.",
  "For reproducibility, seed `random`, `numpy` and `torch`."
 ],
 code:`from torch.utils.data import Dataset, DataLoader

class TabularDS(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
    def __len__(self):
        return len(self.X)
    def __getitem__(self, i):
        return self.X[i], self.y[i]

loader = DataLoader(TabularDS(X, y), batch_size=32, shuffle=True)
torch.save(model.state_dict(), "model.pt")`,
 traps:["`torch.save(model)` ties the file to your code layout; prefer saving the `state_dict`.","Labels for `CrossEntropyLoss` must be `long` integers."],
 cards:[
  ["Which two methods does every Dataset need?","`__len__` and `__getitem__`."],
  ["How do you save and restore a model?","`torch.save(model.state_dict(), path)`; later `model.load_state_dict(torch.load(path))`."],
  ["What does `num_workers` do?","Loads batches in parallel worker processes."]
 ],
 quiz:[
  ["Turn `shuffle` on for the…",["test loader","training loader","both, always","neither"],1,"Only the training data."],
  ["`len(loader)` for 100 items with batch size 32",["3","4","32","100"],1,"ceil(100 / 32) = 4 batches."]
 ]}
];
