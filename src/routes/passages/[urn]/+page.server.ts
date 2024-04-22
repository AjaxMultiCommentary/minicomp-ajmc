import type { EditionConfig, PassageConfig, TextContainer, TextElement } from '$lib/types.js';

import fs from 'fs';
import { error } from '@sveltejs/kit';
import { parse as parseToml } from 'smol-toml';

import CTS_URN from '$lib/cts_urn.js';
import { readCommentaryFiles } from '$lib/commentaries/index.js';

const _doc = fs.readFileSync('config/commentary.toml', 'utf-8');
const COMMENTARY_CONFIG = parseURNs(parseToml(_doc));
const EDITIONS_DIR = 'out/editions';
const ALL_COMMENTS = readCommentaryFiles();

export const load = async ({ params: { urn = '' } }) => {
    if (urn === '' || typeof urn === 'undefined') {
        return error(404);
    }

    const ctsUrn = new CTS_URN(urn);
    const version = ctsUrn.version
        ? COMMENTARY_CONFIG.editions.find((e: EditionConfig) => e.ctsUrn.version === ctsUrn.version)
        : COMMENTARY_CONFIG.editions[0];

    if (!version) {
        return error(404, `Edition ${ctsUrn.toString()} not found.`);
    }

    const passageStart = ctsUrn.integerCitations[0] || [1];
    const passages: PassageConfig[] = COMMENTARY_CONFIG.passages;
    const passageInfo = getPassage(passages, passageStart);

    if (!passageInfo) {
        return error(404, 'Passage not found.');
    }

    const editions: EditionConfig[] = COMMENTARY_CONFIG.editions;
    const editionFile = `${EDITIONS_DIR}/${version.ctsUrn.workComponent}.jsonl`;
    const jsonl = fs
        .readFileSync(editionFile, 'utf-8')
        .split('\n')
        .filter((l) => l !== '')
        .map((l) => JSON.parse(l));

    const textContainers = getTextContainersForPassage(passageInfo, jsonl);
    const textElements = getTextElementsForPassage(
        textContainers.map((tc) => tc.offset),
        jsonl
    );
    const comments = getCommentsForPassage(passageInfo);

    return {
        comments: comments.map(c => ({ ...c, ctsUrn: c?.ctsUrn.toJSON() })),
        currentPassage: {
            ...passageInfo, ctsUrn: passageInfo.ctsUrn.toJSON()
        },
        editions: editions.map(e => ({ ...e, ctsUrn: e?.ctsUrn.toJSON() })),
        passages: passages.map(p => ({ ...p, ctsUrn: p?.ctsUrn.toJSON() })),
        textContainers,
        textElements
    };
};

function getCommentsForPassage(passageInfo: PassageConfig) {
    const passageStart = passageInfo.ctsUrn.integerCitations[0];
    const passageEnd = passageInfo.ctsUrn.integerCitations[1];

    return ALL_COMMENTS.filter(
        (c) =>
            c &&
            c.ctsUrn.integerCitations[0].every((value, index) => value >= passageStart[index]) &&
            c.ctsUrn.integerCitations[0].every((value, index) => value <= passageEnd[index])
    ).sort((cA, cB) => {
        if (cA?.ctsUrn.integerCitations[0][0] === cB?.ctsUrn.integerCitations[0][0]) {
            return 0;
        }

        // @ts-ignore
        if (cA?.ctsUrn.integerCitations[0][0] < cB?.ctsUrn.integerCitations[0][0]) {
            return -1;
        }

        return 1;
    });
}

function getTextElementsForPassage(
    offsets: number[],
    jsonl: (TextContainer | TextElement)[]
): TextElement[] {
    const textElements = jsonl.filter(
        (l) => l.type === 'text_element' && offsets.includes(l.line_offset)
    ) as TextElement[];

    return textElements;
}

function getTextContainersForPassage(
    passageInfo: PassageConfig,
    jsonl: (TextContainer | TextElement)[]
): TextContainer[] {
    const textContainers = jsonl.filter(
        (l) => l.type === 'text_container' && passageContainsLocation(l.location, passageInfo)
    ) as TextContainer[];

    return textContainers;
}

function getPassage(passages: PassageConfig[], passageStart: number[]): PassageConfig | undefined {
    return passages.find(
        (p) =>
            p.ctsUrn.integerCitations[0].every((c, index) => c <= passageStart[index]) &&
            p.ctsUrn.integerCitations[1].every((c, index) => c >= passageStart[index])
    );
}

function parseURNs(config: any) {
    return {
        ...config,
        editions: config.editions.map((edition: EditionConfig) => {
            return {
                ...edition,
                ctsUrn: new CTS_URN(edition.urn)
            };
        }),
        passages: config.table_of_contents.map((passage: PassageConfig) => {
            return {
                ...passage,
                ctsUrn: new CTS_URN(passage.urn)
            };
        })
    };
}

// FIXME: There needs to be a generic way of parsing location arrays and mapping them
// to passage URNs. This method will currently only work for single-level works like
// tragedy.
function passageContainsLocation(location: string[], passageInfo: PassageConfig) {
    return (
        parseInt(location[0]) >= parseInt(passageInfo.ctsUrn.citations[0]) &&
        parseInt(location[0]) <= parseInt(passageInfo.ctsUrn.citations[1])
    );
}
