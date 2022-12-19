export namespace Discord {
    export interface IToken {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
    }

    export interface IUser {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
    }
}
