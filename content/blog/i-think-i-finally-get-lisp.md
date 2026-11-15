---
title: "I Think I Finally Get Lisp"
date: 2026-11-15
---

[![Lisp by Randall Munroe (xkcd #224): enlightenment and a universe hacked together with Perl.](/static/xkcd-lisp.jpg "Lisp by Randall Munroe (xkcd #224), CC BY-NC 2.5. We lost the documentation on quantum mechanics. You'll have to decode the regexes yourself.")](https://xkcd.com/224/)

I've spent the last two years writing Python and trying to make software simpler. Sans I/O, protocols, adapters, dependency injection, type systems, keeping things DRY, all of it. I've also been interested in model-driven development, the BEAM, and finding better ways to express business logic without coupling everything together.

This feels especially relevant with AI coding agents. I'm not writing code myself anymore, just reviewing it.

An agent can happily change 20 files or services, but why does a business change require touching 20 things in the first place? We keep adding more abstractions to deal with complexity we've already introduced.

Earlier today I watched Rich Hickey's [Simple Made Easy](https://www.youtube.com/watch?v=LKtk3HCgTa8) and [Clojure, Made Simple](https://www.youtube.com/watch?v=028LZLUB24s), and holy shit.

His points about types and tests being guardrails rather than actually making things simple really clicked. Same with mutable state and how difficult it can be to reproduce bugs when you can't reconstruct the state that caused them. I'd read Paul Graham's [Beating the Averages](https://paulgraham.com/avg.html) before, but I think I finally get it.

Then I started looking at actual Clojure code. [Hiccup](https://github.com/weavejester/hiccup) represents HTML as vectors, [HoneySQL](https://github.com/seancorfield/honeysql) represents SQL as data, and [Malli](https://github.com/metosin/malli) does the same with schemas.

[Pathom](https://pathom3.wsscode.com/) might be the coolest thing I've seen. You describe the data you want. Who cares if it comes from Postgres, HTTP, a file, or another process?

You could be running a test or processing the most important data in production. The code using that data shouldn't need to know the difference.

I don't want deployment details leaking into application code either. AWS, GCP, serverless, queues, containers, and service boundaries shouldn't dictate how I write business logic. Moving that code between environments or deployments shouldn't mean rewriting what it does.

Hickey puts it well in [Simple Made Easy](https://www.youtube.com/watch?v=LKtk3HCgTa8&t=3014s):

> I don't know, I don't want to know.

<figure class="slide-figure">
  <a href="https://www.youtube.com/watch?v=SxdOUGdseq4&t=1896s">
    <img src="/static/simple-made-easy-braid.webp" width="438" height="670" alt="Six diagrams show four independent strands becoming a tightly interwoven braid." />
  </a>
  <figcaption>Complecting independent concerns makes them harder to change separately. From Rich Hickey's <a href="https://www.infoq.com/presentations/Simple-Made-Easy/">Simple Made Easy</a>.</figcaption>
</figure>

These are all libraries. The language just makes it natural to represent things as ordinary data and compose functions around them.

The language itself is represented using the same kinds of data structures you're working with. I've understood code as data conceptually, but seeing what that actually enables is something else.

I think I finally had that [Lisp enlightenment](http://www.catb.org/~esr/faqs/hacker-howto.html) moment.

I used to think Lisp was unreadable and impractical because of all the parentheses. Now it's some of the most elegant code I've ever seen.

I haven't even written any real Clojure yet, so [this xkcd](https://xkcd.com/224/) feels pretty appropriate.

All right, now I need to go back and actually finish [SICP](https://web.mit.edu/6.001/6.037/sicp.pdf).
