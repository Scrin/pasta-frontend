export interface Meta {
    id: string,
    secret?: string,
    expiry?: number,
    mime: string
}

export interface SavedMeta extends Meta {
    secret: string,
    expiry: number
}

export class ErrorResponse extends Error {
    errors: string[]

    constructor(errors: string[], ...params: any[]) {
        super(...params);
        this.errors = errors;
    }
}
