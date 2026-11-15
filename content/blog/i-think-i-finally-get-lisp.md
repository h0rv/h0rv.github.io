---
title: "I Think I Finally Get Lisp"
date: 2026-11-15
---

[![Lisp by Randall Munroe (xkcd #224): enlightenment and a universe hacked together with Perl.](/static/xkcd-lisp.jpg "Lisp by Randall Munroe (xkcd #224), CC BY-NC 2.5. We lost the documentation on quantum mechanics. You'll have to decode the regexes yourself.")](https://xkcd.com/224/)

I've been working in Python heavily for the past two years, and a lot of that time has gone into trying to make things simpler. Sans I/O, protocols, adapters, leaning on the type system, finding patterns and libraries to keep things DRY. I've also been reading about higher-level stuff like model-driven development and the BEAM. I've been thinking about this stuff so hard.

AI coding agents have made all of it more obvious. I'm literally not writing any code myself anymore, just reviewing it. Making business changes is still a struggle, because people don't think about coupling, and the fix is usually more patterns and abstractions to fight against the complexity we already have. Meanwhile the agent is like "yeah sure, I'll implement that change across all these 20 services, no problem." That's just the reality we're at, and it sucks.

Earlier today I watched Rich Hickey's [Simple Made Easy](https://www.youtube.com/watch?v=LKtk3HCgTa8) and [Clojure, Made Simple](https://www.youtube.com/watch?v=028LZLUB24s), and holy shit. His point about types and tests being guardrails really clicked. They're useful, but they don't actually make the thing underneath any less complex. Same with state. We have state poisoned everywhere, and to reproduce a bug you need to reproduce all of that state, which is basically impossible. I'd read Paul Graham's [Beating the Averages](https://paulgraham.com/avg.html) before, but I don't think I really got it until today.

Then I started looking at actual Clojure code, and it's all just data:

```clojure
;; Malli: a schema is a vector
(def Payer [:map [:id :int] [:name :string]])

;; HoneySQL: a query is a map
(sql/format {:select [:id :name] :from [:payers]})

;; Hiccup: HTML is vectors
(h/html [:ul (for [p payers] [:li (:name p)])])

;; instructor-clj: the same Malli schema, now for LLM output
(ic/instruct "We just added Acme Health, id 42" Payer
             :provider :openai :api-key api-key)
```

[Malli](https://github.com/metosin/malli), [HoneySQL](https://github.com/seancorfield/honeysql), [Hiccup](https://github.com/weavejester/hiccup), and [instructor-clj](https://github.com/unravel-team/instructor-clj) are all separate libraries, but since everything is plain data they just fit together.

Then there's [Pathom](https://pathom3.wsscode.com/), which is insane. You describe the data you want and it figures out how to get it. Like, I want payer data, give me payer data. I don't care if it comes from a file, an HTTP request, a queue, Postgres, SQLite, or a floppy disk. I don't care if it's in the same service, a different process, on Temporal, or across the world in a different language. This is the data I want, in this shape, and I can process it. I don't give a shit where it comes from. Every change is just a low-risk, confident change. This guy might actually be a genius. The data-oriented approach to dependency injection is also insane.

Having been a platform/DevOps engineer before, this is the part that got me. Whether we're on serverless, GCP, or AWS leaks into the code, and it shouldn't. It makes moving actual infrastructure hard, let alone moving modules of code from one service to another. Hickey has a line in [Simple Made Easy](https://www.youtube.com/watch?v=LKtk3HCgTa8&t=3014s) that I can't stop thinking about:

> "I don't know, I don't want to know."
>
> — [Rich Hickey](https://www.youtube.com/watch?v=LKtk3HCgTa8&t=3014s)

It just makes complete sense.

<figure class="slide-figure">
  <a href="/static/simple-made-easy-braid.webp?v=2" title="View the full-size braid illustration">
    <img src="/static/simple-made-easy-braid.webp?v=2" width="410" height="634" alt="Six diagrams show four independent strands becoming a tightly interwoven braid." />
  </a>
  <figcaption>Complecting independent concerns makes them harder to change separately.<br />— <a href="https://www.infoq.com/presentations/Simple-Made-Easy/">Rich Hickey, Simple Made Easy</a></figcaption>
</figure>

None of this is baked into Clojure. It's all libraries, but because the language itself is data, extending it this way feels natural. Even static typing isn't built in. It could just be a library, which is so cool and makes complete sense. I've spent years finding patterns in Python to get some of this, and Clojure just inverts all of it. I've understood code as data and syntax trees for a while, but seeing what it enables is something else.

I always thought programming in a Lisp would be extremely impractical, and I never thought I'd get over the parentheses. Now it reads fine, and this might be the most elegant language I've ever seen. I think this is the [Lisp enlightenment](http://www.catb.org/~esr/faqs/hacker-howto.html) people talk about. Maybe this is the endgame, I don't know.

I haven't even built a real Clojure application yet, so [this xkcd](https://xkcd.com/224/) feels pretty appropriate. All right, now I need to go back and actually finish [SICP](https://web.mit.edu/6.001/6.037/sicp.pdf).
