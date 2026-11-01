export const C_TF = [
{id:"tf-attn", t:"Attention, the core idea", lvl:"B",
 hook:"Each word asks a question (Q), every word offers a label (K) and content (V).",
 sum:"Self-attention lets every token look at every other token to build context.",
 pts:[
  "Each token’s embedding is projected into **Query**, **Key** and **Value** vectors.",
  "Scores = Q·Kᵀ / √dₖ; softmax turns the scores into attention weights.",
  "Output = weights × V: a context-aware blend of the other tokens.",
  "Dividing by √dₖ keeps softmax from saturating.",
  "Masks: padding masks ignore pad tokens; causal masks block future tokens (as in GPT).",
  "Multi-head attention runs several attentions in parallel to capture different relationships."
 ],
 code:`import torch
import torch.nn.functional as F

def attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / d_k ** 0.5
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = F.softmax(scores, dim=-1)
    return weights @ V, weights

x = torch.rand(1, 4, 8)            # batch 1, 4 tokens, dim 8
out, w = attention(x, x, x)
print(out.shape, w.shape)          # torch.Size([1, 4, 8]) torch.Size([1, 4, 4])`,
 traps:["Forgetting the causal mask lets a decoder cheat by seeing the future.","Attention costs O(n²) in sequence length, so long inputs get expensive."],
 cards:[["Attention formula?","softmax(QKᵀ / √dₖ) V."],["Why divide by √dₖ?","Large dot products push softmax into tiny gradients; scaling keeps it stable."],["What is a causal mask?","It blocks attention to future positions in decoders."]],
 quiz:[["Attention weights for one query sum to…",["0","1","dₖ","n"],1,"They come from softmax."],["Cost of self-attention in sequence length n:",["O(n)","O(n²)","O(log n)","O(1)"],1,"Every pair of tokens."]],
 vis:{type:"flow", steps:["Token embeddings","Q, K, V projections","Q·Kᵀ / √dₖ","softmax → weights","weights × V → context"]},
 prac:[{type:"predict", code:"import torch\nQ = torch.rand(2, 5, 16)\nK = torch.rand(2, 5, 16)\nprint((Q @ K.transpose(-2, -1)).shape)", answer:["torch.Size([2, 5, 5])"], explain:"Each of the 5 queries scores each of the 5 keys."}]},
{id:"tf-block", t:"The transformer block", lvl:"I",
 hook:"Attention mixes tokens; the feed-forward network thinks about each one.",
 sum:"How embeddings, positions, attention and feed-forward layers stack into a transformer.",
 pts:[
  "Input = token embeddings + **positional information** (sinusoidal, learned or rotary), since attention ignores order.",
  "One block: multi-head self-attention → add & norm → feed-forward network → add & norm.",
  "Residual connections and layer normalization keep deep stacks trainable.",
  "Encoder blocks see all tokens; decoder blocks are causal and may cross-attend to an encoder.",
  "The output head is a linear layer over the vocabulary, then softmax → next-token probabilities.",
  "Model size grows with the number of layers, the hidden size and the number of heads."
 ],
 code:`import torch.nn as nn

class Block(nn.Module):
    def __init__(self, d=256, heads=4):
        super().__init__()
        self.attn = nn.MultiheadAttention(d, heads, batch_first=True)
        self.ln1, self.ln2 = nn.LayerNorm(d), nn.LayerNorm(d)
        self.ff = nn.Sequential(nn.Linear(d, 4 * d), nn.GELU(), nn.Linear(4 * d, d))

    def forward(self, x):
        h = self.ln1(x)
        x = x + self.attn(h, h, h, need_weights=False)[0]   # residual
        return x + self.ff(self.ln2(x))                     # residual`,
 traps:["Without positional information, ‘dog bites man’ looks the same as ‘man bites dog’.","Mixing up pre-norm and post-norm changes training stability."],
 cards:[["Why positional encodings?","Self-attention is order-agnostic; positions add word order."],["Parts of a transformer block?","Multi-head attention, a feed-forward network, residual connections and layer norm."],["Encoder block vs decoder block?","Encoders attend to all tokens; decoders use a causal mask and can cross-attend."]],
 quiz:[["The feed-forward hidden size is usually…",["d","2d","4d","d / 2"],2,"Typically 4× the model dimension."],["Normalization used in transformers:",["BatchNorm","LayerNorm","none","InstanceNorm"],1,"LayerNorm."]],
 vis:{type:"stack", layers:["Linear + softmax → next token","× N blocks","Add & Norm","Feed-forward network","Add & Norm","Multi-head self-attention","Token embeddings + positions"]},
 prac:[{type:"order", lines:["Embed tokens and add positions","Multi-head self-attention","Add the residual and normalize","Feed-forward network","Add the residual and normalize again"], explain:"The order inside one transformer block."}]},
{id:"tf-families", t:"Encoders, decoders & Hugging Face", lvl:"I",
 hook:"BERT understands, GPT writes, T5 translates.",
 sum:"The three transformer families and how to use them with Hugging Face.",
 pts:[
  "**Encoder-only** (BERT, RoBERTa): trained by masked language modeling; for classification, NER and embeddings.",
  "**Decoder-only** (GPT, Llama and other chat models): trained by next-token prediction; for generation and chat.",
  "**Encoder-decoder** (T5, BART): sequence-to-sequence tasks like translation and summarization.",
  "Hugging Face basics: `AutoTokenizer`, `AutoModel...`, `pipeline`, `Trainer`, and the Model Hub.",
  "Tokenizers return `input_ids` and an `attention_mask`.",
  "Generation settings: temperature, top-k, top-p, `max_new_tokens`."
 ],
 code:`from transformers import AutoTokenizer, AutoModelForCausalLM

name = "gpt2"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)

ids = tok("Deep learning is", return_tensors="pt")
out = model.generate(**ids, max_new_tokens=20, do_sample=True, temperature=0.7, top_p=0.9)
print(tok.decode(out[0], skip_special_tokens=True))`,
 traps:["High temperature gives creative but less accurate text.","Encoder-only models can’t generate free text."],
 cards:[["Pretraining objective of BERT vs GPT?","BERT: masked language modeling. GPT: next-token prediction."],["What is the attention_mask?","1 for real tokens, 0 for padding."],["What does top-p do?","Samples from the smallest set of tokens whose probabilities add up to p."]],
 quiz:[["Model family for summarization:",["encoder-only","encoder-decoder","Word2Vec","CNN"],1,"T5 or BART."],["Temperature near 0 makes output…",["random","nearly deterministic","longer","shorter"],1,"Close to greedy decoding."]],
 vis:{type:"compare", cols:[{h:"Encoder (BERT)", items:["sees the whole input","classification, NER, embeddings"]},{h:"Decoder (GPT)", items:["causal, left to right","generation, chat"]},{h:"Encoder-decoder (T5)", items:["input → output","translation, summaries"]}]},
 prac:[{type:"blank", code:"out = model.generate(**ids, max_new_tokens=30, ____=0.2)   # less random", answer:["temperature"], explain:"Lower temperature makes output more deterministic."}]},
{id:"tf-adv", t:"Fine-tuning & efficiency", lvl:"A",
 hook:"Freeze most, train a little: LoRA makes big models affordable.",
 sum:"Adapt large transformers to your task and run them efficiently.",
 pts:[
  "Full fine-tuning updates every weight: the best fit, but the most memory.",
  "**PEFT / LoRA** trains small low-rank matrices added to frozen weights.",
  "**Quantization** (8-bit, 4-bit; QLoRA) shrinks memory with a small quality cost.",
  "A KV cache speeds up generation by reusing past keys and values.",
  "Flash attention and mixed precision (fp16 / bf16) speed up training.",
  "Evaluate on held-out data and watch for catastrophic forgetting."
 ],
 code:`from peft import LoraConfig, get_peft_model

config = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,
                    target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
model = get_peft_model(base_model, config)
model.print_trainable_parameters()   # well under 1% of all parameters`,
 traps:["Fine-tuning on a tiny dataset overfits quickly; use few epochs and a low learning rate.","Quantizing too aggressively hurts reasoning quality."],
 cards:[["What is LoRA?","Low-rank adapters trained on top of frozen weights for cheap fine-tuning."],["Why a KV cache?","To avoid recomputing keys and values for earlier tokens during generation."],["What is QLoRA?","LoRA fine-tuning on a 4-bit quantized base model."]],
 quiz:[["LoRA trains…",["all weights","small adapter matrices","only embeddings","nothing"],1,"Low-rank adapters."],["bf16 mixed precision mainly helps with…",["speed and memory","guaranteed accuracy","tokenization","data cleaning"],0,"Mixed precision."]],
 vis:{type:"compare", cols:[{h:"Full fine-tune", items:["update all weights","best fit","huge memory"]},{h:"LoRA", items:["freeze the base","train tiny adapters","cheap and swappable"]},{h:"Prompting", items:["no training","instructions + examples"]}]},
 prac:[{type:"blank", code:"for p in base_model.parameters():\n    p.____ = False        # freeze the base model", answer:["requires_grad"], explain:"Turning off `requires_grad` freezes the weights."}]}
];

export const C_LLM = [
{id:"llm-basics", t:"How LLMs work", lvl:"B",
 hook:"Predict the next token, trillions of times, then align it with people.",
 sum:"Large language models are huge decoder transformers trained to predict text.",
 pts:[
  "Text → tokens (subwords) → embeddings → transformer layers → probabilities for the next token.",
  "Training stages: **pretraining** on huge text, **instruction tuning** (SFT), **preference alignment** (RLHF, DPO).",
  "The context window is the maximum number of tokens the model sees at once (prompt + output).",
  "Decoding: greedy, or sampling controlled by temperature and top-p.",
  "Hallucination: fluent but false output, because models predict plausible text rather than checked facts.",
  "Cost and latency grow with the tokens going in and out."
 ],
 code:`# next-token prediction, conceptually
prompt = "The capital of France is"
# tokens -> model -> probabilities over the vocabulary
probs = {" Paris": 0.92, " Lyon": 0.03, " a": 0.02}
next_token = max(probs, key=probs.get)
print(prompt + next_token)     # The capital of France is Paris`,
 traps:["Treating model output as a verified fact.","Ignoring the context limit silently drops earlier text."],
 cards:[["What is a token?","A chunk of text (often a subword) the model processes; roughly three quarters of an English word on average."],["Pretraining vs SFT vs alignment?","Pretraining learns language; SFT teaches following instructions; RLHF/DPO aligns with human preferences."],["What is hallucination?","Confident output that isn’t true or grounded."]],
 quiz:[["LLMs are mainly trained to…",["classify images","predict the next token","sort data","search the web"],1,"Next-token prediction."],["RLHF uses…",["human preference data","only images","no data","SQL tables"],0,"Comparisons between outputs."]],
 vis:{type:"flow", steps:["Prompt text","Tokens","Embeddings","Transformer layers","Next-token probabilities","Sample, append, repeat"]},
 prac:[{type:"order", lines:["Pretrain on large text corpora","Supervised fine-tuning on instructions","Preference alignment (RLHF or DPO)","Evaluate and deploy"], explain:"The usual LLM training pipeline."}]},
{id:"llm-prompt", t:"Prompt engineering", lvl:"I",
 hook:"Be specific, show examples, leave room to think, ask for a format.",
 sum:"Get reliable results from LLMs with clear, structured prompts.",
 pts:[
  "Give a role and context, a precise task, constraints and the output format.",
  "**Few-shot prompting:** include worked examples of input → output.",
  "Ask for step-by-step reasoning on complex problems.",
  "Use tags or delimiters to separate instructions from data.",
  "Structured output: request JSON matching a schema, then validate it in code.",
  "System prompts set lasting behavior; temperature controls variety."
 ],
 code:`prompt = """You are a strict code reviewer.
Review the Python function inside <code> tags.
Return JSON only: {"issues": [{"line": int, "problem": str, "fix": str}]}

<code>
def avg(xs):
    return sum(xs) / len(xs)
</code>"""`,
 traps:["Vague prompts produce vague answers.","Untrusted user text pasted into a prompt without delimiters invites prompt injection."],
 cards:[["What is few-shot prompting?","Including worked examples in the prompt to show the pattern you want."],["How do you get parseable output?","Specify a JSON schema, ask for JSON only, then validate it."],["What is prompt injection?","Untrusted input that tries to override your instructions."]],
 quiz:[["Including 3 solved examples in the prompt is…",["zero-shot","few-shot","fine-tuning","RAG"],1,"Few-shot."],["For consistent, factual answers, set temperature…",["high","low","random","to 2"],1,"Lower is more deterministic."]],
 vis:{type:"stack", layers:["Output format (JSON schema)","Examples (few-shot)","Task + constraints","Context or data in tags","Role / system prompt"]},
 prac:[{type:"order", lines:["State the role","Provide the context in tags","Describe the task precisely","Add constraints","Specify the output format"], explain:"A well-structured prompt, top to bottom."}]},
{id:"llm-apps", t:"Building LLM apps", lvl:"I",
 hook:"Call the API, give it tools, keep a memory, measure everything.",
 sum:"Turn an LLM into a product with APIs, tool use, agents and evaluation.",
 pts:[
  "Call models through an API with messages (system, user, assistant) and settings like `max_tokens`.",
  "Stream tokens for responsive interfaces.",
  "**Tool use / function calling:** the model picks a tool and arguments; your code runs it and returns the result.",
  "**Agents** loop: think → act with a tool → observe → repeat until done.",
  "Memory: send the conversation history and summarize old turns to fit the context window.",
  "Evaluate with test sets, rubrics or an LLM judge; log latency, cost and failures."
 ],
 code:`from anthropic import Anthropic
client = Anthropic()                       # reads ANTHROPIC_API_KEY

resp = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=500,
    system="You are a concise SQL tutor.",
    messages=[{"role": "user", "content": "Explain LEFT JOIN in two sentences."}],
)
print(resp.content[0].text)`,
 traps:["Putting API keys in frontend code exposes them to everyone.","Letting an agent run tools with no limits or confirmations."],
 cards:[["What is function calling?","The model returns a structured tool call; your code runs it and sends back the result."],["What is an agent loop?","Reason, call a tool, observe the result, and repeat until the task is done."],["How do you evaluate an LLM app?","Test sets with expected behavior, rubrics or LLM judges, plus monitoring in production."]],
 quiz:[["Where should an API key live?",["in frontend JS","in a backend environment variable","in the URL","in an HTML comment"],1,"On the server."],["A long chat exceeds the context window. Fix:",["delete the model","summarize older turns","raise the temperature","use a CSV"],1,"Summarize or trim history."]],
 vis:{type:"cycle", steps:["User request","Model answers or calls a tool","Your code runs the tool","Result goes back to the model"]},
 prac:[{type:"order", lines:["User asks: weather in Pune?","Model returns a tool call get_weather(city='Pune')","App calls the weather API","App sends the result back to the model","Model writes the final answer"], explain:"The tool-use loop."}]},
{id:"llm-adv", t:"Customization, safety & evaluation", lvl:"A",
 hook:"Prompt first, RAG for knowledge, fine-tune for behavior.",
 sum:"Pick the right customization, keep outputs safe, and measure quality.",
 pts:[
  "Escalate in order: prompting → RAG (knowledge) → fine-tuning (style, format, behavior).",
  "Fine-tuning data: high-quality input → ideal output pairs; quality beats quantity.",
  "Guardrails: input/output filters, schema validation, refusal handling, human review for risky actions.",
  "Reduce hallucination: ground answers in sources, cite, lower temperature, allow ‘I don’t know’.",
  "Evaluation: golden datasets, exact match/F1, rubric scoring, A/B tests.",
  "Cost and latency: smaller models for simple steps, caching, batching, streaming."
 ],
 code:`def answer_with_guardrails(question, retrieve, llm):
    context = retrieve(question, k=4)
    if not context:
        return "I don't have information on that."
    reply = llm(f"Answer only from the context.\\n<context>{context}</context>\\nQ: {question}")
    if "I don't know" in reply or len(reply) > 2000:
        return "I couldn't find a reliable answer."
    return reply`,
 traps:["Fine-tuning to add facts works poorly; use RAG for knowledge.","Judging quality from a few hand-picked examples."],
 cards:[["When to fine-tune vs use RAG?","RAG for changing or private knowledge; fine-tuning for consistent style, format or behavior."],["Ways to reduce hallucination?","Ground in retrieved sources, cite, lower temperature, allow ‘I don’t know’, validate."],["What is a golden dataset?","A curated set of inputs with expected outputs, used for regression testing."]],
 quiz:[["A bot must answer from company docs that change weekly:",["fine-tune weekly","RAG","higher temperature","a bigger model only"],1,"Retrieval keeps it current."],["Make sure output is valid JSON:",["hope","validate against a schema and retry","use capital letters","shorter prompts"],1,"Validate and retry."]],
 vis:{type:"flow", steps:["Prompt engineering","+ RAG for knowledge","+ Fine-tuning for behavior","+ Guardrails and evals"]},
 prac:[{type:"order", lines:["Try a clear prompt with examples","Add retrieval if it needs private or fresh knowledge","Fine-tune only if behavior is still inconsistent","Evaluate on a golden dataset before shipping"], explain:"Escalate customization only as needed."}]}
];

export const C_RAG = [
{id:"rag-basics", t:"What RAG is", lvl:"B",
 hook:"Look it up first, then answer: retrieval + generation.",
 sum:"Retrieval-Augmented Generation feeds relevant documents to an LLM so its answers are grounded and current.",
 pts:[
  "The problem: LLMs don’t know your private or recent data and may hallucinate.",
  "RAG: retrieve relevant chunks for the question → add them to the prompt → generate an answer that cites them.",
  "Two phases: **indexing** (offline) and **querying** (online).",
  "Indexing: load → chunk → embed → store in a vector database.",
  "Querying: embed the question → similarity search → build the prompt → the LLM answers.",
  "Benefits: fresh knowledge, citations, and no retraining."
 ],
 code:`question = "What is our refund window?"
chunks = vector_db.search(embed(question), k=3)
prompt = f"""Answer using only the context. Cite the source.
<context>
{format_chunks(chunks)}
</context>
Question: {question}"""
answer = llm(prompt)`,
 traps:["Stuffing in too many chunks dilutes the answer and costs tokens.","Without ‘answer only from the context’, the model may ignore the documents."],
 cards:[["What does RAG solve?","Missing or outdated knowledge and hallucination, without retraining."],["The two phases of RAG?","Indexing (chunk, embed, store) and querying (retrieve, prompt, generate)."],["Why cite sources?","Users can verify answers, and it discourages hallucination."]],
 quiz:[["RAG adds knowledge by…",["changing the weights","putting retrieved text in the prompt","bigger GPUs","higher temperature"],1,"Context at prompt time."],["Where are the embeddings stored?",["a vector database","the model weights","a CSV only","the browser"],0,"A vector store."]],
 vis:{type:"flow", steps:["Question","Embed it","Vector search → top-k chunks","Prompt = question + chunks","LLM answer with citations"]},
 prac:[{type:"order", lines:["Load documents","Split them into chunks","Embed each chunk","Store the vectors in a database","At query time, retrieve the top-k chunks","Generate the answer with them"], explain:"Indexing first, then querying."}]},
{id:"rag-index", t:"Chunking, embeddings & vector DBs", lvl:"I",
 hook:"Good chunks in, good answers out.",
 sum:"Build the index: split documents well, embed them, and store them for fast search.",
 pts:[
  "Chunking: about 300–1000 tokens with ~10–20% overlap; split on headings and paragraphs when possible.",
  "Keep metadata (source, page, date) with every chunk for filtering and citations.",
  "Embedding models map text to vectors; use the same model for documents and queries.",
  "Similarity: cosine similarity or dot product; approximate nearest-neighbor indexes (HNSW) for speed.",
  "Vector stores: FAISS, Chroma, pgvector, Pinecone, Weaviate, Qdrant.",
  "Re-index when documents change, and remove duplicates."
 ],
 code:`from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")
chunks = ["Refunds within 30 days.", "Shipping takes 5 days.", "Support: 9am-6pm."]
vecs = model.encode(chunks, normalize_embeddings=True)

q = model.encode(["How long do I have to return an item?"], normalize_embeddings=True)
scores = vecs @ q[0]                    # cosine similarity (normalized vectors)
print(chunks[int(np.argmax(scores))])  # Refunds within 30 days.`,
 traps:["Embedding queries and documents with different models makes search meaningless.","Chunks that are too small lose context; too large dilute relevance."],
 cards:[["Why overlap chunks?","So sentences cut at a boundary still appear whole in some chunk."],["Cosine similarity of normalized vectors equals…","Their dot product."],["What is HNSW?","A graph-based approximate nearest-neighbor index for fast vector search."]],
 quiz:[["Typical chunk overlap:",["0%","10–20%","50–80%","100%"],1,"A small overlap."],["Vector search inside PostgreSQL:",["pgvector","Redis only","SQLite FTS","Excel"],0,"pgvector."]],
 vis:{type:"flow", steps:["PDFs, docs, web pages","Clean + split into chunks","Embedding model","Vectors + metadata","Vector DB (HNSW index)"]},
 prac:[{type:"blank", code:"vecs = model.encode(chunks, normalize_embeddings=True)\nscores = vecs @ q_vec\nbest = chunks[int(np.____(scores))]", answer:["argmax"], explain:"`argmax` picks the most similar chunk."}]},
{id:"rag-retr", t:"Better retrieval", lvl:"I",
 hook:"Retrieve wide, rerank narrow.",
 sum:"Improve what gets retrieved, because the answer can only be as good as its context.",
 pts:[
  "**Hybrid search** combines keyword search (BM25) with vector search, catching exact names, codes and meaning.",
  "**Reranking:** retrieve 20–50 candidates, reorder them with a cross-encoder, keep the top 3–5.",
  "Metadata filters (date, product, user permissions) narrow the search.",
  "Query rewriting, multi-query and HyDE improve recall.",
  "Parent-child chunking: search small chunks, return their larger parent section.",
  "Respect access control: users must only retrieve documents they’re allowed to see."
 ],
 code:`candidates = hybrid_search(query, k=30)            # BM25 + vectors
pairs = [(query, c.text) for c in candidates]
scores = cross_encoder.predict(pairs)               # relevance of each pair
ranked = sorted(zip(scores, candidates), key=lambda p: -p[0])
top = [c for _, c in ranked][:4]
context = "\\n\\n".join(f"[{c.source}] {c.text}" for c in top)`,
 traps:["Pure vector search misses exact identifiers like error codes.","Skipping permission filters can leak confidential documents."],
 cards:[["Why hybrid search?","Keyword search catches exact terms; vector search catches meaning."],["What does a reranker do?","Scores each query–passage pair precisely and reorders the candidates."],["What is HyDE?","Generate a hypothetical answer, embed it, and search with that vector."]],
 quiz:[["A user searches for error code ‘E1042’:",["pure vector search","hybrid search with BM25","a bigger LLM","no retrieval"],1,"Exact matches matter."],["Cross-encoders are used for…",["indexing millions fast","reranking a short list","tokenizing","storage"],1,"Precise but slower."]],
 vis:{type:"flow", steps:["Query (rewritten)","Hybrid search: top 30","Cross-encoder rerank","Top 4 chunks","Prompt"]},
 prac:[{type:"order", lines:["Rewrite the user query","Run BM25 and vector search","Merge the candidates","Rerank with a cross-encoder","Keep the top 4 for the prompt"], explain:"A strong retrieval pipeline."}]},
{id:"rag-adv", t:"Evaluating & scaling RAG", lvl:"A",
 hook:"Measure retrieval and generation separately.",
 sum:"Make RAG reliable in production with evaluation, monitoring and advanced patterns.",
 pts:[
  "Retrieval metrics: recall@k, MRR and nDCG on labeled question → relevant-chunk pairs.",
  "Generation metrics: faithfulness (grounded in the context), answer relevance, correctness.",
  "Tools: RAGAS, TruLens, or an LLM judge with a rubric.",
  "Agentic RAG: the model decides when and what to retrieve, possibly over several steps.",
  "GraphRAG uses knowledge graphs for multi-hop questions.",
  "Production: caching, streaming, citations in the UI, feedback buttons, monitoring query drift."
 ],
 code:`def recall_at_k(results, relevant, k=5):
    hits = sum(1 for q in results if set(results[q][:k]) & relevant[q])
    return hits / len(results)

results = {"q1": ["c4", "c9", "c2"], "q2": ["c7", "c1", "c3"]}
relevant = {"q1": {"c2"}, "q2": {"c5"}}
print(recall_at_k(results, relevant, k=3))   # 0.5`,
 traps:["Judging only final answers hides whether retrieval or generation failed.","Never refreshing the index lets answers go stale."],
 cards:[["What is faithfulness?","Whether every claim in the answer is supported by the retrieved context."],["What does recall@k measure?","How often a relevant chunk appears in the top k results."],["What is agentic RAG?","The model plans and triggers its own retrieval steps, possibly several times."]],
 quiz:[["The answer is fluent but not in the context. Failing metric:",["recall@k","faithfulness","latency","BLEU"],1,"It isn’t grounded."],["The right chunk is never retrieved. Fix first:",["prompt wording","retrieval and chunking","temperature","the UI"],1,"It’s a retrieval problem."]],
 vis:{type:"compare", cols:[{h:"Retrieval quality", items:["recall@k","MRR, nDCG","is the right chunk found?"]},{h:"Generation quality", items:["faithfulness","answer relevance","is the answer grounded and correct?"]}]},
 prac:[{type:"predict", code:"hits = [True, False, True, True]\nprint(sum(hits) / len(hits))", answer:["0.75"], explain:"3 of 4 queries had a relevant chunk in the top k."}]}
];
