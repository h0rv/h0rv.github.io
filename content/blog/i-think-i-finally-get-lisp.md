---
title: "I Think I Finally Get Lisp"
date: 2026-11-15
---

[![Lisp by Randall Munroe (xkcd #224): enlightenment and a universe hacked together with Perl.](/static/xkcd-lisp.jpg "Lisp by Randall Munroe (xkcd #224), CC BY-NC 2.5. We lost the documentation on quantum mechanics. You'll have to decode the regexes yourself.")](https://xkcd.com/224/)

For the past couple of years, a lot of my work has gone into trying to keep software simple: Sans I/O, protocols, adapters, leaning on the type system. I've also been reading about ideas like model-driven development and the BEAM, looking for better ways to keep business logic from getting tangled up with everything around it.

AI coding agents have made this more pressing. I don't write code by hand anymore. I design it, review it, test it, and verify it. An agent will happily make the same change across 20 services, but a simple business change shouldn't need to touch 20 services in the first place. Most of the patterns I reach for exist to manage coupling that's already there.

Coming from platform and DevOps work, I see the same problem with infrastructure. Whether something runs on serverless, GCP, AWS, or as a Temporal workflow tends to leak into application code, which makes moving infrastructure hard and moving code between services even harder.

Earlier today I watched Rich Hickey's [Simple Made Easy](https://www.youtube.com/watch?v=LKtk3HCgTa8) and [Clojure, Made Simple](https://www.youtube.com/watch?v=028LZLUB24s), and they gave me a vocabulary for all of this. Hickey calls it complecting: braiding independent concerns together until you can't change one without the others.

<figure class="slide-figure">
  <a href="/static/simple-made-easy-braid.webp?v=2" title="View the full-size braid illustration">
    <img src="/static/simple-made-easy-braid.webp?v=2" width="410" height="634" alt="Six diagrams show four independent strands becoming a tightly interwoven braid." />
  </a>
  <figcaption>Complecting independent concerns makes them harder to change separately.<br />— <a href="https://www.infoq.com/presentations/Simple-Made-Easy/">Rich Hickey, Simple Made Easy</a></figcaption>
</figure>

He also argues that types and tests are guardrails. They're valuable, but they don't reduce the complexity underneath. The same goes for state. Once it's spread throughout a system, reproducing a bug means reconstructing all of it.

Then I started reading Clojure code, and a lot of the ecosystem is just plain data:

```clojure
;; Malli: a schema is a vector
(def User [:map [:name :string] [:email :string]])

;; HoneySQL: a query is a map
(sql/format {:select [:name :email] :from [:users]})

;; Hiccup: HTML is vectors
(h/html [:ul (for [u users] [:li (:name u)])])

;; instructor-clj: same schema, pull a User out of an email with an LLM
(ic/instruct email-body User :provider :openai :api-key api-key)
```

[Malli](https://github.com/metosin/malli), [HoneySQL](https://github.com/seancorfield/honeysql), [Hiccup](https://github.com/weavejester/hiccup), and [instructor-clj](https://github.com/unravel-team/instructor-clj) are separate libraries, but because they all work with plain data, they compose without any glue. The same schema can validate input and describe what you want back from an LLM.

[Pathom](https://pathom3.wsscode.com/) takes this further. You declare the data you need, and it works out how to get it. The code that uses user data doesn't need to know whether it came from Postgres, an HTTP call, a queue, or a floppy disk, or whether the source lives in the same process or a different service. That's the decoupling I've been trying to build by hand, and it makes changes feel low risk.

Hickey has a line in Simple Made Easy that sums it up:

> "I don't know, I don't want to know."
>
> — [Rich Hickey](https://www.youtube.com/watch?v=LKtk3HCgTa8&t=3014s)

None of this is built into Clojure, either. These are all libraries, and they feel native because Clojure code is made of the same data structures. I've spent years assembling patterns in mainstream imperative languages to approximate this, and Clojure starts from the other end. I've understood code as data in the abstract for a long time, but seeing what it enables in practice is different.

Even types work this way. I usually prefer statically typed languages, and Clojure is dynamically typed, but [Typed Clojure](https://typedclojure.org) adds a type system and type checking as a library. You just pull in a dependency. I can't think of many languages outside of Lisps where that's possible, and coming from Python, where type hints are part of the syntax and checking happens in separate tools, that's awesome.

I always assumed Lisps were impractical and that I'd never get past the parentheses. Now the code reads clearly to me, and Clojure might be the most elegant language I've seen. I'd read Paul Graham's [Beating the Averages](https://paulgraham.com/avg.html) before, but I think I finally understand it. This might be the [Lisp enlightenment](http://www.catb.org/~esr/faqs/hacker-howto.html#:~:text=LISP%20is%20worth%20learning,finally%20get%20it) people talk about.

I haven't built a real Clojure application yet, so [this xkcd](https://xkcd.com/224/) feels appropriate. Now I need to go back and actually finish [SICP](https://web.mit.edu/6.001/6.037/sicp.pdf).
