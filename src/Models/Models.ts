/*
*** All interface
*/

export interface Profile {
    selected: IMap<boolean>;
    sorted: number | null;
    search: number | null;
}

export interface Data {
    id: number;
    name: string;
    age: number;
}

export interface GLOBAL_BD_data {
    token: string
    profile: Profile
    data: Data[]
}

export interface GLOBAL_BD {
    data: GLOBAL_BD_data[]
}

export interface Token_t {
    num: number,
    date: number
}

export interface MoveData {
    token: string
    draggingRow: number
    hoveredRow: number
}

export interface SearchData {
    token: string
    query: number
}
export interface IMap<T> {
    [index: number]: T;
} 

export interface SelectedData {
    token: string
    selected: IMap<boolean>
}

export interface OffsetData {
    token: string
    offset: number
}