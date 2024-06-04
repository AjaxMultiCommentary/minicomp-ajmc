# Kōdōn (κώδων)

> φώνημ᾽ ἀκούω καὶ ξυναρπάζω φρενὶ  
> χαλκοστόμου κώδωνος ὡς Τυρσηνικῆς.

> I hear your voice and grasp it in my mind, / like the voice of a bronze-belled Tyrrhenian trumpet. – Sophocles, _Ajax_ ll. 16–17

Part of the [Ajax Multi-Commentary](https://github.com/AjaxMultiCommentary/) project, Kōdōn (Greek for the "bell of a trumpet") is a minimal computing platform for authoring and compiling (multi-)commentaries.

## What is a multi-commentary?

A multi-commentary pulls glossae from more than one commentary at once, applying these comments to lemmata in a shared edition of the text. (In future iterations, a multi-commentary might also entail multiple editions of a text.)

By creating a shared edition for all of the comments to cite simultaneously, a multi-commentary enables the reader to explore hundreds of years of a commentary tradition at a glance, gleaning new insights into how the commentaries interact with the critical text and with each other.

## How does it work?

The multi-commentary platform works by combining editions, commentaries, and (optionally) translations into a reading environment.

### Editions

Editions are [TEI XML](https://tei-c.org). Kōdōn will parse properly formatted TEI for canonical references using the `<refsDecl>` element in the TEI header. For now, because Kōdōn focuses on amplifying commentaries, each canonical reference mainly consists of its CTS URN citation — e.g., for line 17 of Sophocles' _Ajax_ `urn:cts:greekLit:tlg0011.tlg003.perseus-grc2:17` — and the plain text reference to the line.

There is, however, rudimentary support for handling TEI's `<del>` and `<add>` elements, with plans to support additional markup in the future.

### Commentaries

Each commentary consists of a series of glosses that point to canonical references in the editions. Citations to critical editions must be formatted as CTS URNs. For example, to cite the word κώδωνος at Sophocles, _Ajax_ l. 17, you would use the following URN: `urn:cts:greekLit:tlg0011.tlg003.perseus-grc2:17@κώδωνος`.

**TODO**: Should we continue to support the slide-based short syntax for per-comment metadata, relying on the YAML block only document-level data? Or should we use a YAML metadata block for each glossa and treat each glossa as a separate markdown document?

### Translations

Like commentaries, translations must point to a critical edition of the text.

**TODO**: Specify how translations should work.

## Development

To develop and run the application locally, make sure you have Node.js and NPM installed. See https://docs.npmjs.com/downloading-and-installing-node-js-and-npm for help.

### Installing dependencies

With `node` and `npm` installed, you can install the application's dependencies locally by running

```sh
$ npm install
```

from the root directory (the same directory that contains this README).

### Running the application

To run the application locally, use

```sh
$ npm run dev
```

This will start a development server at localhost:5137 by default. Any changes that you make to the application code should be picked up automatically. If for some reason they are not, try restarting the server.

## AjMC Development

### Ingesting changes in the commentaries

In order to update the commentaries used here, make sure that you have set the following environment variables:

- `GITHUB_API_TOKEN`: Needed to access the `commentaries_data` repository
- `ZOTERO_API_TOKEN`: Needed to access the Zotero API for bibliographic data
- `ZOTERO_API_URL`: E.g, https://api.zotero.org/groups/{GROUP_ID}/, where `GROUP_ID` is the ID of the group containing the bibliographic information for the commentaries

You will also need to have a recent version of the the Elixir runtime available on your system. With Homebrew on macOS, run

```sh
$ brew install elixir
```

See https://elixir-lang.org/install.html for more information.

Finally, you can now run

```sh
$ elixir support/ingestion_scripts/canonical_commentaries.exs
```

This script will update the `commentaries/` directory with the latest changes from the `commentaries_data` repository.

**!!! NB !!!**: For now, this will overwrite any changes that have been manually made to the markdown commentaries.

## License

Copyright 2024 Matteo Romanello, Ajax Multi-Commentary Project

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
