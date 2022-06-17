export type Query = { [key: string]: string | string[] | Query | undefined | null };

export type QuerySerializer = (query: Query, initialSearchString?: string) => string;
