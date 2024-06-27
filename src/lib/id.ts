import {nanoid} from "nanoid";
const shortIdSize = 6;

export const generateId = (): string => {
    return nanoid(shortIdSize)
}