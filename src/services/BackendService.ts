import { AxiosResponse } from "axios";
import { get, post } from "./Api";
import { Meta, SavedMeta, ErrorResponse } from "../types";
import { currentSecret } from "../helpers";

export default {
    getMeta: async (id: string) => {
        try {
            const secret = currentSecret() || '';
            const response: AxiosResponse<Meta> = await get('/api/meta/' + id + '/' + secret);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    getPaste: async (id: string) => {
        try {
            const response: AxiosResponse<string> = await get('/raw/' + id);
            return response.data;
        } catch (error) {
            return '';
        }
    },

    savePaste: async (text: string, mime: string, id: string = '', expiry: number = 0): Promise<SavedMeta> => {
        const secret = currentSecret() || '';
        try {
            const response: AxiosResponse<SavedMeta> = await post('/api/new/' + id + '/' + secret + '/' + (expiry <= 0 ? '' : expiry) + '/' + mime, text);
            localStorage.setItem('secret', response.data.secret);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                throw new ErrorResponse(error.response.data);
            } else {
                throw new ErrorResponse(['Unexpected error occurred while trying to save, please try again']);
            }
        }
    }
}
